from __future__ import annotations
"""Registry Adapter: Bridges WinVinaya `ToolRegistry` to the MCP Protocol.

Only tools with `definition.is_read_only == True` are exposed.
Write tools (`create_lead`, `create_job_role`) are strictly excluded.
"""

import json
import logging
import time
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

import app.ai.mcp.tools  # noqa: F401 — ensures all tool modules register on import
from app.ai.brain.exceptions import ToolNotFoundError
from app.ai.mcp.base_tool import BaseTool
from app.ai.mcp.registry import registry
from app.mcp_server.guard import (
    MCPAccessDeniedError,
    assert_user_allowed_mcp,
    cap_rows_and_count,
    is_user_allowed_mcp,
    write_audit_log,
)
from app.models.user import User

logger = logging.getLogger(__name__)


def _json_schema_for_tool(tool: BaseTool) -> dict[str, Any]:
    """Convert `ToolDefinition.parameters` into standard MCP JSON Schema `inputSchema`."""
    d = tool.definition
    properties: dict[str, Any] = {}
    for pname, pschema in d.parameters.items():
        prop: dict[str, Any] = {
            "type": pschema.type,
            "description": pschema.description,
        }
        if pschema.enum:
            prop["enum"] = pschema.enum
        if pschema.default is not None:
            prop["default"] = pschema.default
        properties[pname] = prop

    schema: dict[str, Any] = {
        "type": "object",
        "properties": properties,
    }
    if d.required_parameters:
        schema["required"] = list(d.required_parameters)
    return schema


def list_mcp_tools(user: User | None = None) -> list[dict[str, Any]]:
    """Return MCP `tools/list` payload for all read-only tools allowed for `user`."""
    mcp_tools: list[dict[str, Any]] = []
    for tool in sorted(registry.all(), key=lambda t: t.definition.name):
        d = tool.definition
        if not d.is_read_only:
            continue
        if user is not None and not is_user_allowed_mcp(user, d):
            continue
        mcp_tools.append(
            {
                "name": d.name,
                "description": d.description,
                "inputSchema": _json_schema_for_tool(tool),
                "annotations": {
                    "title": d.name.replace("_", " ").title(),
                    "readOnlyHint": True,
                    "destructiveHint": False,
                    "idempotentHint": True,
                    "openWorldHint": False,
                },
            }
        )
    return mcp_tools


async def call_mcp_tool(
    *,
    name: str,
    arguments: dict[str, Any] | None,
    user: User,
    ro_db: AsyncSession,
    auth_db: AsyncSession,
    client_ip: str | None = None,
) -> dict[str, Any]:
    """Execute a read-only tool through the guard and return MCP `CallToolResult`."""
    params = dict(arguments or {})
    start_ns = time.perf_counter_ns()

    try:
        tool = registry.get(name)
    except ToolNotFoundError:
        duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)
        await write_audit_log(
            auth_db,
            user=user,
            tool_name=name,
            parameters=params,
            row_count=0,
            success=False,
            error_message=f"Unknown tool: {name}",
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return {
            "content": [{"type": "text", "text": json.dumps({"error": f"Unknown tool: '{name}'"})}],
            "isError": True,
        }

    # Strict read-only enforcement (never allow write tools via MCP)
    if not tool.definition.is_read_only:
        duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)
        await write_audit_log(
            auth_db,
            user=user,
            tool_name=name,
            parameters=params,
            row_count=0,
            success=False,
            error_message="Write tool blocked in read-only MCP mode",
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({"error": f"Tool '{name}' is a write tool and is not enabled in read-only mode."}),
                }
            ],
            "isError": True,
        }

    # RBAC check
    try:
        assert_user_allowed_mcp(user, tool.definition)
    except MCPAccessDeniedError as exc:
        duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)
        await write_audit_log(
            auth_db,
            user=user,
            tool_name=name,
            parameters=params,
            row_count=0,
            success=False,
            error_message=str(exc),
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return {
            "content": [{"type": "text", "text": json.dumps({"error": str(exc)})}],
            "isError": True,
        }

    # Validate parameters against tool schema
    validation_errors = tool.validate_params(params)
    if validation_errors:
        err_msg = "; ".join(validation_errors)
        duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)
        await write_audit_log(
            auth_db,
            user=user,
            tool_name=name,
            parameters=params,
            row_count=0,
            success=False,
            error_message=err_msg,
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return {
            "content": [{"type": "text", "text": json.dumps({"error": err_msg})}],
            "isError": True,
        }

    # Execute against read-only DB session
    try:
        result = await tool.execute(params, ro_db, user)
    except Exception as exc:
        logger.exception(f"Unhandled error executing MCP tool '{name}'")
        duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)
        await write_audit_log(
            auth_db,
            user=user,
            tool_name=name,
            parameters=params,
            row_count=0,
            success=False,
            error_message=str(exc),
            duration_ms=duration_ms,
            client_ip=client_ip,
        )
        return {
            "content": [{"type": "text", "text": json.dumps({"error": str(exc)})}],
            "isError": True,
        }

    capped_data, row_count = cap_rows_and_count(result.data)
    duration_ms = int((time.perf_counter_ns() - start_ns) / 1_000_000)

    await write_audit_log(
        auth_db,
        user=user,
        tool_name=name,
        parameters=params,
        row_count=row_count,
        success=result.success,
        error_message=result.error,
        duration_ms=duration_ms,
        client_ip=client_ip,
    )

    payload = {
        "success": result.success,
        "summary": result.message,
        "data": capped_data,
    }
    if result.error:
        payload["error"] = result.error

    return {
        "content": [
            {
                "type": "text",
                "text": json.dumps(payload, default=str, ensure_ascii=False),
            }
        ],
        "isError": not result.success,
    }

