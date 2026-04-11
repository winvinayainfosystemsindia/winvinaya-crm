"""
AI Engine — Candidate Tools
==========================

Tools for searching, counting, and analyzing candidate registrations.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from app.ai.schemas import ToolDefinition, ToolParameterSchema, ToolResult
from app.ai.tool_registry import BaseTool, registry
from app.repositories.candidate_repository import CandidateRepository

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


# ── Search/Count Candidates ──────────────────────────────────────────────────

class SearchCandidatesTool(BaseTool):
    """
    Search for registered candidates or get registration statistics (counts).
    """
    definition = ToolDefinition(
        name="search_candidates",
        description="Search for registered candidates by name/email/phone, or get total registration counts and demographic breakdowns.",
        category="placement",
        is_read_only=True,
        parameters={
            "query": ToolParameterSchema(
                type="string", 
                description="Search term (name, email, phone, or city)"
            ),
            "include_stats": ToolParameterSchema(
                type="boolean",
                description="If true, returns overall statistics like total count, gender breakdown, etc.",
                default=False
            ),
            "limit": ToolParameterSchema(
                type="integer",
                description="Number of records to return (default 10)",
                default=10
            )
        },
        required_parameters=[]
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession") -> ToolResult:
        try:
            repo = CandidateRepository(db)
            include_stats = params.get("include_stats", False)
            query = params.get("query")
            limit = params.get("limit", 10)

            result_data = {}
            message_parts = []

            # 1. Fetch Stats if requested
            if include_stats or not query:
                stats = await repo.get_stats()
                result_data["stats"] = stats
                message_parts.append(f"Total: {stats.get('total', 0)}")
                message_parts.append(f"Today: {stats.get('today_count', 0)}")

            # 2. Fetch records if query provided or as a preview
            candidates, total_matching = await repo.get_multi(
                search=query,
                limit=limit
            )
            
            result_data["candidates"] = [
                {
                    "id": c.id,
                    "name": c.name,
                    "city": c.city,
                    "gender": c.gender,
                    "email": c.email,
                    "phone": c.phone,
                    "created_at": str(c.created_at)
                }
                for c in candidates
            ]
            result_data["total_matching"] = total_matching

            if query:
                message_parts.append(f"Found {total_matching} candidates matching '{query}'.")

            return ToolResult(
                success=True,
                message=" | ".join(message_parts) if message_parts else "Successfully retrieved candidate data.",
                data=result_data
            )

        except Exception as e:
            logger.exception("Error in search_candidates tool")
            return ToolResult(success=False, message=f"Failed to retrieve candidates: {str(e)}", error=str(e))


# ── Registration ─────────────────────────────────────────────────────────────

registry.register(SearchCandidatesTool())
