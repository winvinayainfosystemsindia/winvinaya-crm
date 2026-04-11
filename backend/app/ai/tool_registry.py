"""
AI Engine — Tool Registry
==========================

Central registry of all available AI tools.

Design:
- Tools self-register using @registry.register decorator
- Registry builds the LLM system prompt automatically from tool definitions
- Tool metadata (name, description, schema) is the single source of truth
- Supports filtering by category, capability, and read-only flag
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from app.ai.schemas import ToolDefinition, ToolResult

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class BaseTool:
    """
    Abstract base class that every AI tool must implement.

    Subclass this, set `definition`, and implement `execute()`.
    The ToolRegistry auto-discovers all registered subclasses.
    """

    definition: ToolDefinition  # Must be set on every subclass

    async def execute(self, params: dict[str, Any], db: "AsyncSession") -> ToolResult:
        """
        Execute this tool with the given parameters.

        Args:
            params: Validated parameter dict matching the tool's schema
            db:     Active async SQLAlchemy session

        Returns:
            ToolResult — always returns, never raises (errors go in result.error)
        """
        raise NotImplementedError(f"Tool '{self.definition.name}' must implement execute()")

    def validate_params(self, params: dict[str, Any]) -> list[str]:
        """
        Validate incoming parameters against the tool definition.
        Returns a list of validation error strings (empty = valid).
        """
        errors = []
        for required in self.definition.required_parameters:
            if required not in params or params[required] is None:
                errors.append(f"Missing required parameter: '{required}'")

        for param_name, param_schema in self.definition.parameters.items():
            if param_name in params and param_schema.enum and params[param_name] not in param_schema.enum:
                errors.append(
                    f"Parameter '{param_name}' must be one of: {param_schema.enum}. Got: '{params[param_name]}'"
                )

        return errors


class ToolRegistry:
    """
    Central registry managing all registered AI tools.

    Responsibilities:
    - Store all tool instances indexed by name
    - Generate the LLM system prompt tools section
    - Provide tool lookup and category-based filtering
    - Produce diagnostic info for the /ai/tools admin endpoint
    """

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}
        logger.info("ToolRegistry initialized.")

    def register(self, tool: BaseTool) -> None:
        """Register a tool instance. Called at module import time."""
        name = tool.definition.name
        if name in self._tools:
            logger.warning("Tool '%s' is already registered. Overwriting.", name)
        self._tools[name] = tool
        logger.debug("Registered tool: %s [category=%s]", name, tool.definition.category)

    def get(self, name: str) -> BaseTool:
        """Retrieve a tool by name. Raises KeyError if not found."""
        if name not in self._tools:
            from app.ai.exceptions import ToolNotFoundError
            raise ToolNotFoundError(name)
        return self._tools[name]

    def all(self) -> list[BaseTool]:
        """Return all registered tools."""
        return list(self._tools.values())

    def by_category(self, category: str) -> list[BaseTool]:
        """Return all tools belonging to a specific category."""
        return [t for t in self._tools.values() if t.definition.category == category]

    def read_only_tools(self) -> list[BaseTool]:
        """Return only tools that perform read-only DB operations."""
        return [t for t in self._tools.values() if t.definition.is_read_only]

    def write_tools(self) -> list[BaseTool]:
        """Return only tools that modify the DB."""
        return [t for t in self._tools.values() if not t.definition.is_read_only]

    def requires_approval_tools(self) -> list[BaseTool]:
        """Return tools that require human approval before executing."""
        return [t for t in self._tools.values() if t.definition.requires_approval]

    def to_prompt_block(self, categories: list[str] | None = None) -> str:
        """
        Render all (or filtered) tools as a structured text block
        for injection into the LLM system prompt.

        Example output:
          TOOL: create_lead
          DESCRIPTION: Creates a new CRM lead record.
          PARAMETERS:
            - title (string, required): Lead title
            - lead_source (string, required): Source. One of: [whatsapp, website, ...]
          REQUIRES_APPROVAL: false
          ---
        """
        tools = self.all() if not categories else [
            t for t in self._tools.values() if t.definition.category in categories
        ]

        if not tools:
            return "(No tools available)"

        blocks = []
        for tool in sorted(tools, key=lambda t: (t.definition.category, t.definition.name)):
            d = tool.definition
            param_lines = []
            for pname, pschema in d.parameters.items():
                required_tag = "(required)" if pname in d.required_parameters else "(optional)"
                enum_tag = f" One of: {pschema.enum}" if pschema.enum else ""
                param_lines.append(f"    - {pname} ({pschema.type}, {required_tag}): {pschema.description}{enum_tag}")

            param_section = "\n".join(param_lines) if param_lines else "    (none)"
            read_only_tag = " [READ-ONLY]" if d.is_read_only else ""
            approval_tag = " [REQUIRES HUMAN APPROVAL]" if d.requires_approval else ""

            blocks.append(
                f"TOOL: {d.name}{read_only_tag}{approval_tag}\n"
                f"DESCRIPTION: {d.description}\n"
                f"CATEGORY: {d.category}\n"
                f"PARAMETERS:\n{param_section}"
            )

        return "\n---\n".join(blocks)

    def to_definitions_list(self) -> list[ToolDefinition]:
        """Return all tool definitions (for the admin API endpoint)."""
        return [t.definition for t in self._tools.values()]

    def count(self) -> int:
        return len(self._tools)

    def __contains__(self, name: str) -> bool:
        return name in self._tools

    def __repr__(self) -> str:
        return f"<ToolRegistry tools={self.count()}>"


# ─────────────────────────────────────────────────────────────────────────────
# Global Singleton Registry
# ─────────────────────────────────────────────────────────────────────────────

registry = ToolRegistry()
