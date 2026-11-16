from __future__ import annotations
"""Database session dependencies for the MCP server.

Reuses the backend's configured `AsyncSessionLocal` and `close_db` from
`app.core.database` (which uses `settings.DATABASE_URL` assembled in
`app.core.config`).
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, close_db


async def get_mcp_ro_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a read-only database session for MCP tools and resources (never commits)."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


async def get_mcp_auth_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session for OAuth 2.1 tokens and MCP audit logging."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def close_mcp_db() -> None:
    """Close backend database connections on shutdown."""
    await close_db()
