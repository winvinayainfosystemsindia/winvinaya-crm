from __future__ import annotations
"""OAuth 2.1 Metadata & Dynamic Client Registration (RFC 9728, RFC 8414, RFC 7591)."""

import secrets
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp_server.auth.tokens import hash_secret
from app.mcp_server.config import mcp_settings
from app.models.mcp_oauth import OAuthClient


def build_protected_resource_metadata(issuer_url: str) -> dict[str, Any]:
    """RFC 9728 OAuth 2.0 Protected Resource Metadata."""
    issuer = issuer_url.rstrip("/")
    return {
        "resource": issuer,
        "authorization_servers": [issuer],
        "bearer_methods_supported": ["header"],
        "scopes_supported": ["mcp:read"],
        "resource_documentation": f"{issuer}/health",
    }


def build_authorization_server_metadata(issuer_url: str) -> dict[str, Any]:
    """RFC 8414 OAuth 2.0 Authorization Server Metadata."""
    issuer = issuer_url.rstrip("/")
    return {
        "issuer": issuer,
        "authorization_endpoint": f"{issuer}/authorize",
        "token_endpoint": f"{issuer}/token",
        "registration_endpoint": f"{issuer}/register",
        "revocation_endpoint": f"{issuer}/revoke",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code", "refresh_token"],
        "token_endpoint_auth_methods_supported": [
            "none",
            "client_secret_post",
            "client_secret_basic",
        ],
        "code_challenge_methods_supported": ["S256"],
        "scopes_supported": ["mcp:read"],
    }


async def register_oauth_client(
    auth_db: AsyncSession,
    payload: dict[str, Any],
) -> dict[str, Any]:
    """RFC 7591 Dynamic Client Registration for Claude MCP connector."""
    redirect_uris = payload.get("redirect_uris") or []
    if not isinstance(redirect_uris, list) or not redirect_uris:
        raise ValueError("invalid_redirect_uri: redirect_uris must be a non-empty list")

    for uri in redirect_uris:
        if not mcp_settings.is_redirect_uri_allowed(str(uri)):
            raise ValueError(f"invalid_redirect_uri: Redirect URI '{uri}' is not allowed")

    client_name = str(payload.get("client_name") or "Claude MCP Client")[:255]
    grant_types = payload.get("grant_types") or ["authorization_code", "refresh_token"]
    response_types = payload.get("response_types") or ["code"]
    auth_method = str(payload.get("token_endpoint_auth_method") or "none")

    client_id = f"wvmcp_client_{secrets.token_urlsafe(18)}"
    raw_secret: str | None = None
    secret_hash: str | None = None
    if auth_method in ("client_secret_post", "client_secret_basic"):
        raw_secret = f"wvmcp_secret_{secrets.token_urlsafe(24)}"
        secret_hash = hash_secret(raw_secret)

    client_row = OAuthClient(
        client_id=client_id,
        client_secret_hash=secret_hash,
        client_name=client_name,
        redirect_uris=redirect_uris,
        grant_types=grant_types,
        response_types=response_types,
        token_endpoint_auth_method=auth_method,
    )
    auth_db.add(client_row)
    await auth_db.flush()

    response: dict[str, Any] = {
        "client_id": client_id,
        "client_name": client_name,
        "redirect_uris": redirect_uris,
        "grant_types": grant_types,
        "response_types": response_types,
        "token_endpoint_auth_method": auth_method,
    }
    if raw_secret:
        response["client_secret"] = raw_secret
        response["client_secret_expires_at"] = 0
    return response


async def get_oauth_client(auth_db: AsyncSession, client_id: str) -> OAuthClient | None:
    """Fetch a registered OAuth client by client_id."""
    if not client_id:
        return None
    stmt = select(OAuthClient).where(
        and_(
            OAuthClient.client_id == client_id,
            OAuthClient.is_deleted == False,
        )
    )
    return (await auth_db.execute(stmt)).scalar_one_or_none()

