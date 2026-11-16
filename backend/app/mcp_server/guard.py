from __future__ import annotations
"""Guard layer for the WinVinaya MIS MCP Server.

Enforces:
1. Admin-only role check (`MCP_ALLOWED_ROLES`, default `['admin']`) on every request
2. Read-only tool check (`tool.definition.is_read_only == True`)
3. Row cap (`MCP_MAX_ROWS`, default 50) on list payloads
4. Immutable audit log entry in `mcp_audit_log`
"""

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.brain.schemas import ToolDefinition
from app.mcp_server.config import mcp_settings
from app.models.mcp_oauth import MCPAuditLog
from app.models.user import User

logger = logging.getLogger(__name__)


class MCPAccessDeniedError(PermissionError):
    """Raised when a user is not permitted to access the MCP connector or tool."""


def is_user_allowed_mcp(user: User | None, tool_def: ToolDefinition | None = None) -> bool:
    """Return True if the user is active, not deleted, and holds an allowed role."""
    if user is None or not user.is_active or getattr(user, "is_deleted", False):
        return False

    if user.is_superuser:
        user_role_ok = True
    else:
        role_val = str(user.role.value if hasattr(user.role, "value") else user.role).lower()
        user_role_ok = role_val in mcp_settings.MCP_ALLOWED_ROLES

    if not user_role_ok:
        return False

    if tool_def is not None:
        if not tool_def.is_read_only:
            return False
        if tool_def.allowed_roles and not user.is_superuser:
            role_val = str(user.role.value if hasattr(user.role, "value") else user.role).lower()
            allowed_lower = [r.lower() for r in tool_def.allowed_roles]
            # Admin is always allowed across all read-only tools
            if role_val != "admin" and role_val not in allowed_lower:
                return False

    return True


def assert_user_allowed_mcp(user: User | None, tool_def: ToolDefinition | None = None) -> None:
    """Raise MCPAccessDeniedError if user is not allowed to call MCP / tool."""
    if not is_user_allowed_mcp(user, tool_def):
        raise MCPAccessDeniedError(
            "Access restricted to active WinVinaya MIS administrators."
        )


def cap_rows_and_count(data: Any, max_rows: int | None = None) -> tuple[Any, int]:
    """Cap top-level list fields inside `data` to `max_rows` and compute total returned rows."""
    limit = max_rows if max_rows is not None else mcp_settings.MCP_MAX_ROWS
    if not isinstance(data, dict):
        return data, 0

    capped: dict[str, Any] = {}
    row_count = 0
    for key, value in data.items():
        if key == "REVEAL_DATA":
            # Strip internal Aria planner prompt hint from external MCP output
            continue
        if isinstance(value, list):
            sliced = value[:limit]
            capped[key] = sliced
            row_count += len(sliced)
        else:
            capped[key] = value
    return capped, row_count


async def write_audit_log(
    auth_db: AsyncSession,
    *,
    user: User | None,
    tool_name: str,
    parameters: dict[str, Any] | None,
    row_count: int,
    success: bool,
    error_message: str | None = None,
    duration_ms: int = 0,
    client_ip: str | None = None,
) -> MCPAuditLog:
    """Record an MCP tool invocation in `mcp_audit_log`."""
    safe_params = {}
    if isinstance(parameters, dict):
        for k, v in parameters.items():
            if any(secret_word in k.lower() for secret_word in ("password", "secret", "token")):
                safe_params[k] = "***"
            else:
                safe_params[k] = v

    entry = MCPAuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else None,
        tool_name=tool_name,
        parameters=safe_params,
        row_count=row_count,
        success=success,
        error_message=error_message,
        duration_ms=duration_ms,
        client_ip=client_ip,
    )
    auth_db.add(entry)
    await auth_db.flush()
    return entry

