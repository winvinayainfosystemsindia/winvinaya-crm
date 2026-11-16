from __future__ import annotations
"""MCP OAuth 2.1 and Audit Log database models"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class OAuthClient(BaseModel):
    """Dynamically registered OAuth 2.1 clients (RFC 7591) for MCP connectors."""

    __tablename__ = "oauth_clients"

    client_id: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        index=True,
        nullable=False,
    )
    client_secret_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    client_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    redirect_uris: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    grant_types: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: ["authorization_code", "refresh_token"],
    )
    response_types: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=lambda: ["code"],
    )
    token_endpoint_auth_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="none",
    )


class OAuthAuthCode(BaseModel):
    """Short-lived OAuth 2.1 authorization codes with PKCE S256."""

    __tablename__ = "oauth_auth_codes"

    code_hash: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        index=True,
        nullable=False,
    )
    client_id: Mapped[str] = mapped_column(
        String(128),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    redirect_uri: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    code_challenge: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    code_challenge_method: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="S256",
    )
    scope: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default="mcp:read",
    )
    resource: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class OAuthToken(BaseModel):
    """Issued OAuth 2.1 access and refresh tokens (stored as SHA-256 hashes)."""

    __tablename__ = "oauth_tokens"

    access_token_hash: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        index=True,
        nullable=False,
    )
    refresh_token_hash: Mapped[str | None] = mapped_column(
        String(128),
        unique=True,
        index=True,
        nullable=True,
    )
    client_id: Mapped[str] = mapped_column(
        String(128),
        index=True,
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    scope: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default="mcp:read",
    )
    resource: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    access_expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    refresh_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    client_ip: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )


class MCPAuditLog(BaseModel):
    """Immutable audit log of every MCP tool invocation."""

    __tablename__ = "mcp_audit_log"

    user_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    user_email: Mapped[str | None] = mapped_column(
        String(255),
        index=True,
        nullable=True,
    )
    tool_name: Mapped[str] = mapped_column(
        String(128),
        index=True,
        nullable=False,
    )
    parameters: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )
    row_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    success: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    duration_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    client_ip: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

