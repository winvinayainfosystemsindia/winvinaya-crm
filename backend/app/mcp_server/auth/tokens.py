from __future__ import annotations
"""OAuth 2.1 token, authorization code, and PKCE S256 utilities."""

import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Tuple

from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.mcp_server.config import mcp_settings
from app.mcp_server.guard import is_user_allowed_mcp
from app.models.mcp_oauth import OAuthAuthCode, OAuthToken
from app.models.user import User


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def hash_secret(raw_value: str) -> str:
    """Return SHA-256 hex digest of a token or authorization code."""
    return hashlib.sha256(raw_value.encode("utf-8")).hexdigest()


def compute_pkce_s256_challenge(code_verifier: str) -> str:
    """Compute RFC 7636 S256 code_challenge from a code_verifier."""
    digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


def verify_pkce(code_verifier: str, code_challenge: str, method: str = "S256") -> bool:
    """Verify PKCE code_verifier against stored code_challenge (strictly S256)."""
    if not code_verifier or not code_challenge:
        return False
    if method.upper() != "S256":
        return False
    expected = compute_pkce_s256_challenge(code_verifier)
    return secrets.compare_digest(expected, code_challenge.rstrip("="))


async def create_authorization_code(
    auth_db: AsyncSession,
    *,
    client_id: str,
    user_id: int,
    redirect_uri: str,
    code_challenge: str,
    code_challenge_method: str = "S256",
    scope: str = "mcp:read",
    resource: str | None = None,
) -> str:
    """Generate and persist a single-use OAuth 2.1 authorization code."""
    raw_code = f"wvmcp_code_{secrets.token_urlsafe(32)}"
    expires_at = _utcnow() + timedelta(seconds=mcp_settings.MCP_AUTH_CODE_EXPIRE_SECONDS)

    record = OAuthAuthCode(
        code_hash=hash_secret(raw_code),
        client_id=client_id,
        user_id=user_id,
        redirect_uri=redirect_uri,
        code_challenge=code_challenge,
        code_challenge_method=code_challenge_method,
        scope=scope or "mcp:read",
        resource=resource,
        expires_at=expires_at,
    )
    auth_db.add(record)
    await auth_db.flush()
    return raw_code


async def issue_token_pair(
    auth_db: AsyncSession,
    *,
    client_id: str,
    user_id: int,
    scope: str = "mcp:read",
    resource: str | None = None,
    client_ip: str | None = None,
    user_agent: str | None = None,
) -> Tuple[str, str, int]:
    """Issue a new access_token and refresh_token pair and store their hashes."""
    raw_access = f"wvmcp_at_{secrets.token_urlsafe(36)}"
    raw_refresh = f"wvmcp_rt_{secrets.token_urlsafe(36)}"
    now = _utcnow()
    access_ttl = mcp_settings.MCP_ACCESS_TOKEN_EXPIRE_SECONDS
    refresh_ttl = mcp_settings.MCP_REFRESH_TOKEN_EXPIRE_SECONDS

    token_row = OAuthToken(
        access_token_hash=hash_secret(raw_access),
        refresh_token_hash=hash_secret(raw_refresh),
        client_id=client_id,
        user_id=user_id,
        scope=scope or "mcp:read",
        resource=resource,
        access_expires_at=now + timedelta(seconds=access_ttl),
        refresh_expires_at=now + timedelta(seconds=refresh_ttl),
        client_ip=client_ip,
        user_agent=user_agent,
    )
    auth_db.add(token_row)
    await auth_db.flush()
    return raw_access, raw_refresh, access_ttl


async def exchange_authorization_code(
    auth_db: AsyncSession,
    *,
    code: str,
    client_id: str,
    redirect_uri: str,
    code_verifier: str,
    client_ip: str | None = None,
    user_agent: str | None = None,
) -> Tuple[str, str, int, str]:
    """Validate and consume an authorization code, returning (access, refresh, expires_in, scope)."""
    code_hash = hash_secret(code)
    stmt = select(OAuthAuthCode).where(
        and_(
            OAuthAuthCode.code_hash == code_hash,
            OAuthAuthCode.is_deleted == False,
        )
    )
    auth_code = (await auth_db.execute(stmt)).scalar_one_or_none()
    if auth_code is None:
        raise ValueError("invalid_grant: Authorization code not found")

    if auth_code.used_at is not None:
        raise ValueError("invalid_grant: Authorization code already used")

    now = _utcnow()
    if _as_utc(auth_code.expires_at) < now:
        raise ValueError("invalid_grant: Authorization code expired")

    if auth_code.client_id != client_id:
        raise ValueError("invalid_grant: client_id mismatch")

    if redirect_uri and auth_code.redirect_uri != redirect_uri:
        raise ValueError("invalid_grant: redirect_uri mismatch")

    if not verify_pkce(code_verifier, auth_code.code_challenge, auth_code.code_challenge_method):
        raise ValueError("invalid_grant: PKCE verification failed")

    # Mark code as used immediately
    auth_code.used_at = now

    # Verify user is still active and allowed (admin)
    user = (
        await auth_db.execute(select(User).where(User.id == auth_code.user_id))
    ).scalar_one_or_none()
    if not is_user_allowed_mcp(user):
        raise ValueError("access_denied: User is no longer an active administrator")

    access_token, refresh_token, expires_in = await issue_token_pair(
        auth_db,
        client_id=client_id,
        user_id=auth_code.user_id,
        scope=auth_code.scope or "mcp:read",
        resource=auth_code.resource,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return access_token, refresh_token, expires_in, (auth_code.scope or "mcp:read")


async def rotate_refresh_token(
    auth_db: AsyncSession,
    *,
    refresh_token: str,
    client_id: str | None = None,
    client_ip: str | None = None,
    user_agent: str | None = None,
) -> Tuple[str, str, int, str]:
    """Rotate a valid refresh token and issue a fresh token pair."""
    rt_hash = hash_secret(refresh_token)
    stmt = select(OAuthToken).where(
        and_(
            OAuthToken.refresh_token_hash == rt_hash,
            OAuthToken.is_deleted == False,
        )
    )
    token_row = (await auth_db.execute(stmt)).scalar_one_or_none()
    if token_row is None or token_row.revoked_at is not None:
        raise ValueError("invalid_grant: Refresh token invalid or revoked")

    now = _utcnow()
    if token_row.refresh_expires_at and _as_utc(token_row.refresh_expires_at) < now:
        raise ValueError("invalid_grant: Refresh token expired")

    if client_id and token_row.client_id != client_id:
        raise ValueError("invalid_grant: client_id mismatch")

    user = (
        await auth_db.execute(select(User).where(User.id == token_row.user_id))
    ).scalar_one_or_none()
    if not is_user_allowed_mcp(user):
        token_row.revoked_at = now
        raise ValueError("access_denied: User is no longer an active administrator")

    # Revoke old token pair (refresh token rotation)
    token_row.revoked_at = now

    access_token, new_refresh, expires_in = await issue_token_pair(
        auth_db,
        client_id=token_row.client_id,
        user_id=token_row.user_id,
        scope=token_row.scope or "mcp:read",
        resource=token_row.resource,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return access_token, new_refresh, expires_in, (token_row.scope or "mcp:read")


async def verify_access_token(auth_db: AsyncSession, raw_token: str) -> User | None:
    """Resolve and validate an OAuth Bearer access token, returning the active admin User."""
    if not raw_token:
        return None
    at_hash = hash_secret(raw_token.strip())
    stmt = select(OAuthToken).where(
        and_(
            OAuthToken.access_token_hash == at_hash,
            OAuthToken.is_deleted == False,
        )
    )
    token_row = (await auth_db.execute(stmt)).scalar_one_or_none()
    if token_row is None or token_row.revoked_at is not None:
        return None

    now = _utcnow()
    if _as_utc(token_row.access_expires_at) < now:
        return None

    user = (
        await auth_db.execute(select(User).where(User.id == token_row.user_id))
    ).scalar_one_or_none()
    if not is_user_allowed_mcp(user):
        return None

    return user


async def revoke_token(auth_db: AsyncSession, raw_token: str) -> bool:
    """Revoke an access or refresh token by its raw string."""
    if not raw_token:
        return False
    h = hash_secret(raw_token.strip())
    stmt = select(OAuthToken).where(
        and_(
            (OAuthToken.access_token_hash == h) | (OAuthToken.refresh_token_hash == h),
            OAuthToken.revoked_at.is_(None),
        )
    )
    rows = (await auth_db.execute(stmt)).scalars().all()
    now = _utcnow()
    for r in rows:
        r.revoked_at = now
    await auth_db.flush()
    return len(rows) > 0


async def revoke_all_user_tokens(auth_db: AsyncSession, user_id: int) -> int:
    """Revoke all active MCP OAuth tokens for a specific user."""
    now = _utcnow()
    stmt = (
        update(OAuthToken)
        .where(and_(OAuthToken.user_id == user_id, OAuthToken.revoked_at.is_(None)))
        .values(revoked_at=now)
    )
    result = await auth_db.execute(stmt)
    await auth_db.flush()
    return result.rowcount or 0

