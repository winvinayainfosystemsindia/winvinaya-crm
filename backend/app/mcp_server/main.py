from __future__ import annotations
"""WinVinaya MIS — Remote MCP Server (Streamable HTTP + OAuth 2.1).

Entry point for the standalone PM2 process:
    uvicorn app.mcp_server.main:app --host 127.0.0.1 --port 8100 --workers 2
"""

from contextlib import asynccontextmanager
from typing import Any
import uuid

from fastapi import APIRouter, Depends, FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp_server.adapter import call_mcp_tool, list_mcp_tools
from app.mcp_server.auth.login_routes import oauth_router
from app.mcp_server.auth.tokens import verify_access_token
from app.mcp_server.config import mcp_settings
from app.mcp_server.db import close_mcp_db, get_mcp_auth_db, get_mcp_ro_db
from app.mcp_server.prompts import get_mcp_prompt, list_mcp_prompts
from app.mcp_server.resources import (
    list_mcp_resource_templates,
    list_mcp_resources,
    read_mcp_resource,
)
from app.models.user import User

SUPPORTED_PROTOCOL_VERSIONS = {"2025-06-18", "2025-03-26", "2024-11-05"}
DEFAULT_PROTOCOL_VERSION = "2025-03-26"

mcp_protocol_router = APIRouter(tags=["MCP Protocol"])


def _request_base_url(request: Request) -> str:
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme or "https"
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    return f"{proto}://{host}"


def _unauthorized_response(request: Request, detail: str = "Authentication required") -> JSONResponse:
    base = _request_base_url(request)
    resource_meta_url = f"{base}/.well-known/oauth-protected-resource/mcp"
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"error": "unauthorized", "error_description": detail},
        headers={
            "WWW-Authenticate": f'Bearer resource_metadata="{resource_meta_url}", scope="mcp:read"',
        },
    )


async def _authenticate_mcp_request(
    request: Request,
    auth_db: AsyncSession,
) -> User | None:
    auth_header = request.headers.get("authorization") or ""
    if not auth_header.lower().startswith("bearer "):
        return None
    raw_token = auth_header[7:].strip()
    if not raw_token:
        return None
    return await verify_access_token(auth_db, raw_token)


async def _dispatch_jsonrpc_message(
    msg: dict[str, Any],
    *,
    user: User,
    ro_db: AsyncSession,
    auth_db: AsyncSession,
    client_ip: str | None,
) -> tuple[dict[str, Any] | None, str | None]:
    """Process a single JSON-RPC 2.0 message. Returns (response_dict_or_None, new_session_id)."""
    msg_id = msg.get("id")
    method = msg.get("method")
    params = msg.get("params") or {}

    # Notifications (no id) -> return None so caller responds with 202 Accepted
    if msg_id is None:
        return None, None

    if not method or not isinstance(method, str):
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32600, "message": "Invalid Request"},
        }, None

    try:
        if method == "initialize":
            requested_version = str(params.get("protocolVersion") or DEFAULT_PROTOCOL_VERSION)
            negotiated_version = (
                requested_version
                if requested_version in SUPPORTED_PROTOCOL_VERSIONS
                else DEFAULT_PROTOCOL_VERSION
            )
            session_id = str(uuid.uuid4())
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "protocolVersion": negotiated_version,
                    "capabilities": {
                        "tools": {"listChanged": False},
                        "resources": {"subscribe": False, "listChanged": False},
                        "prompts": {"listChanged": False},
                    },
                    "serverInfo": {
                        "name": mcp_settings.SERVER_NAME,
                        "version": mcp_settings.SERVER_VERSION,
                    },
                    "instructions": (
                        "WinVinaya Foundation MIS Read-Only Connector. "
                        "Use tools to query candidate registrations, screening, counseling, "
                        "training batches, attendance, mock interviews, placement pipelines, "
                        "CRM companies/leads/deals, and DSR compliance."
                    ),
                },
            }, session_id

        if method == "ping":
            return {"jsonrpc": "2.0", "id": msg_id, "result": {}}, None

        if method == "tools/list":
            tools = list_mcp_tools(user)
            return {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": tools}}, None

        if method == "tools/call":
            tool_name = str(params.get("name") or "")
            tool_args = params.get("arguments") or {}
            if not tool_name:
                return {
                    "jsonrpc": "2.0",
                    "id": msg_id,
                    "error": {"code": -32602, "message": "Missing tool 'name'"},
                }, None
            result = await call_mcp_tool(
                name=tool_name,
                arguments=tool_args,
                user=user,
                ro_db=ro_db,
                auth_db=auth_db,
                client_ip=client_ip,
            )
            return {"jsonrpc": "2.0", "id": msg_id, "result": result}, None

        if method == "resources/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"resources": list_mcp_resources()},
            }, None

        if method == "resources/templates/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"resourceTemplates": list_mcp_resource_templates()},
            }, None

        if method == "resources/read":
            uri = str(params.get("uri") or "")
            res = await read_mcp_resource(uri, ro_db, user)
            return {"jsonrpc": "2.0", "id": msg_id, "result": res}, None

        if method == "prompts/list":
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"prompts": list_mcp_prompts()},
            }, None

        if method == "prompts/get":
            pname = str(params.get("name") or "")
            pargs = params.get("arguments") or {}
            res = get_mcp_prompt(pname, pargs)
            return {"jsonrpc": "2.0", "id": msg_id, "result": res}, None

        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32601, "message": f"Method not found: {method}"},
        }, None

    except ValueError as exc:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32602, "message": str(exc)},
        }, None
    except Exception as exc:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32603, "message": f"Internal error: {str(exc)}"},
        }, None


@mcp_protocol_router.post("/mcp")
async def mcp_post_endpoint(
    request: Request,
    ro_db: AsyncSession = Depends(get_mcp_ro_db),
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> Response:
    user = await _authenticate_mcp_request(request, auth_db)
    if user is None:
        return _unauthorized_response(request)

    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}},
        )

    client_ip = request.client.host if request.client else None
    incoming_session_id = request.headers.get("mcp-session-id")

    if isinstance(payload, list):
        responses = []
        new_session_id = None
        for item in payload:
            if isinstance(item, dict):
                resp, sid = await _dispatch_jsonrpc_message(
                    item,
                    user=user,
                    ro_db=ro_db,
                    auth_db=auth_db,
                    client_ip=client_ip,
                )
                if sid:
                    new_session_id = sid
                if resp is not None:
                    responses.append(resp)
        if not responses:
            return Response(status_code=status.HTTP_202_ACCEPTED)
        headers = {}
        if new_session_id or incoming_session_id:
            headers["Mcp-Session-Id"] = new_session_id or incoming_session_id
        return JSONResponse(content=responses, headers=headers)

    if not isinstance(payload, dict):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"jsonrpc": "2.0", "id": None, "error": {"code": -32600, "message": "Invalid Request"}},
        )

    resp, new_session_id = await _dispatch_jsonrpc_message(
        payload,
        user=user,
        ro_db=ro_db,
        auth_db=auth_db,
        client_ip=client_ip,
    )
    if resp is None:
        return Response(status_code=status.HTTP_202_ACCEPTED)

    headers = {}
    if new_session_id or incoming_session_id:
        headers["Mcp-Session-Id"] = new_session_id or incoming_session_id
    return JSONResponse(content=resp, headers=headers)


@mcp_protocol_router.get("/mcp")
async def mcp_get_endpoint(
    request: Request,
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> Response:
    user = await _authenticate_mcp_request(request, auth_db)
    if user is None:
        return _unauthorized_response(request)

    accept = (request.headers.get("accept") or "").lower()
    if "text/event-stream" in accept:
        async def _event_stream():
            yield ": connected\n\n"

        return StreamingResponse(
            _event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    return JSONResponse(
        content={
            "name": mcp_settings.SERVER_NAME,
            "version": mcp_settings.SERVER_VERSION,
            "protocolVersion": DEFAULT_PROTOCOL_VERSION,
            "status": "ready",
        }
    )


@mcp_protocol_router.delete("/mcp")
async def mcp_delete_endpoint(
    request: Request,
    auth_db: AsyncSession = Depends(get_mcp_auth_db),
) -> Response:
    user = await _authenticate_mcp_request(request, auth_db)
    if user is None:
        return _unauthorized_response(request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@mcp_protocol_router.get("/mcp/health")
async def mcp_health() -> JSONResponse:
    return JSONResponse(
        content={
            "status": "healthy",
            "service": mcp_settings.SERVER_NAME,
            "version": mcp_settings.SERVER_VERSION,
            "read_only": True,
            "allowed_roles": mcp_settings.MCP_ALLOWED_ROLES,
        }
    )


@asynccontextmanager
async def _lifespan(app: FastAPI):
    yield
    await close_mcp_db()


def create_mcp_app() -> FastAPI:
    """Create the standalone FastAPI application for the MCP server process."""
    mcp_app = FastAPI(
        title="WinVinaya MIS — Claude MCP Server",
        version=mcp_settings.SERVER_VERSION,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
        lifespan=_lifespan,
    )
    mcp_app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://claude.ai", "https://claude.com"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Mcp-Session-Id", "Accept"],
        expose_headers=["Mcp-Session-Id", "WWW-Authenticate"],
    )
    mcp_app.include_router(oauth_router)
    mcp_app.include_router(mcp_protocol_router)

    @mcp_app.get("/health")
    async def root_health() -> JSONResponse:
        return await mcp_health()

    return mcp_app


app = create_mcp_app()

