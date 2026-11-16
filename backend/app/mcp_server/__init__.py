"""WinVinaya MIS Remote MCP Server package."""

from app.mcp_server.main import app, create_mcp_app, mcp_protocol_router
from app.mcp_server.auth.login_routes import oauth_router

__all__ = ["app", "create_mcp_app", "mcp_protocol_router", "oauth_router"]

