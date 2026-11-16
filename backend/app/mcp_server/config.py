from __future__ import annotations
"""Configuration for the WinVinaya MIS Claude MCP Server.

Reads settings directly from `app.core.config.settings` (which assembles
`DATABASE_URL` from `POSTGRES_*` environment variables).
"""

import os
from typing import List
from urllib.parse import urlparse

from app.core.config import settings


class MCPSettings:
    """Runtime settings for the MCP server and OAuth 2.1 provider."""

    def __init__(self) -> None:
        self.SERVER_NAME: str = "winvinaya-mis-mcp"
        self.SERVER_VERSION: str = "1.0.0"

        self.MCP_ISSUER_URL: str = (
            os.getenv("MCP_ISSUER_URL") or settings.MCP_ISSUER_URL
        ).rstrip("/")

        self.MCP_TOKEN_SECRET: str = (
            os.getenv("MCP_TOKEN_SECRET")
            or settings.MCP_TOKEN_SECRET
            or settings.SECRET_KEY
        )
        self.MCP_ACCESS_TOKEN_EXPIRE_SECONDS: int = int(
            os.getenv(
                "MCP_ACCESS_TOKEN_EXPIRE_SECONDS",
                str(settings.MCP_ACCESS_TOKEN_EXPIRE_SECONDS),
            )
        )
        self.MCP_REFRESH_TOKEN_EXPIRE_SECONDS: int = int(
            os.getenv(
                "MCP_REFRESH_TOKEN_EXPIRE_SECONDS",
                str(settings.MCP_REFRESH_TOKEN_EXPIRE_SECONDS),
            )
        )
        self.MCP_AUTH_CODE_EXPIRE_SECONDS: int = int(
            os.getenv(
                "MCP_AUTH_CODE_EXPIRE_SECONDS",
                str(settings.MCP_AUTH_CODE_EXPIRE_SECONDS),
            )
        )

        raw_roles = os.getenv("MCP_ALLOWED_ROLES") or settings.MCP_ALLOWED_ROLES
        self.MCP_ALLOWED_ROLES: List[str] = [
            r.strip().lower() for r in raw_roles.split(",") if r.strip()
        ]

        # Uses the backend's configured DATABASE_URL from app.core.config.settings
        self.DATABASE_URL: str = settings.DATABASE_URL

        self.MCP_MAX_ROWS: int = int(
            os.getenv("MCP_MAX_ROWS", str(settings.MCP_MAX_ROWS))
        )

        raw_redirects = (
            os.getenv("MCP_ALLOWED_REDIRECT_URIS") or settings.MCP_ALLOWED_REDIRECT_URIS
        )
        self.MCP_ALLOWED_REDIRECT_URIS: List[str] = [
            u.strip() for u in raw_redirects.split(",") if u.strip()
        ]

    def issuer_for_request(self, base_url: str | None = None) -> str:
        """Return issuer URL derived from incoming request host or configured MCP_ISSUER_URL."""
        if base_url:
            return f"{base_url.rstrip('/')}/mcp"
        return self.MCP_ISSUER_URL

    def is_redirect_uri_allowed(self, redirect_uri: str) -> bool:
        """Validate a client redirect URI against the allow-list."""
        if not redirect_uri:
            return False
        parsed = urlparse(redirect_uri)
        if parsed.scheme not in ("https", "http"):
            return False
        for allowed in self.MCP_ALLOWED_REDIRECT_URIS:
            if redirect_uri == allowed:
                return True
            allowed_parsed = urlparse(allowed)
            if (
                allowed_parsed.hostname in ("localhost", "127.0.0.1")
                and parsed.hostname == allowed_parsed.hostname
                and parsed.scheme == allowed_parsed.scheme
            ):
                return True
        return False


mcp_settings = MCPSettings()
