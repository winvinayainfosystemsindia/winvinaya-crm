"""
AI Engine — LLM Task Planner
==============================

Responsible for:
  1. Building the structured system prompt (tool list + persona)
  2. Sending the task request to the LLM provider
  3. Parsing the LLM JSON response into a validated ToolCallPlan
  4. Retrying on transient failures

The Planner never touches the DB — it only produces a plan.
The AIEngine executor is responsible for actually running it.
"""

from __future__ import annotations

import json
import logging
import re
from typing import TYPE_CHECKING

from app.ai.exceptions import (
    LLMProviderError,
    LLMResponseParseError,
    NoPlanGeneratedError,
    PlanningError,
)
from app.ai.brain.utils import load_prompt, load_skills_reference
from app.ai.providers import LLMProvider
from app.ai.schemas import ToolCallPlan, ToolCallRequest, ToolResult
from app.ai.tool_registry import ToolRegistry

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

# Prompts are now loaded from the app/ai/prompts directory via load_prompt utility.


# ─────────────────────────────────────────────────────────────────────────────
# Planner
# ─────────────────────────────────────────────────────────────────────────────

class Planner:
    """
    Converts a task description + context into a structured ToolCallPlan
    by calling the configured LLM provider.
    """

    def __init__(self, provider: LLMProvider, registry: ToolRegistry) -> None:
        self._provider = provider
        self._registry = registry

    async def plan(
        self,
        task_hint: str,
        input_data: dict,
        history: list[dict] | None = None,
        context_snapshot: dict | None = None,
        allowed_categories: list[str] | None = None,
        system_prompt_override: str | None = None,
    ) -> ToolCallPlan:
        """
        Generate a tool execution plan for the given task.

        Args:
            task_hint:         Natural language description of what to accomplish
            input_data:        Raw trigger data (e.g., WhatsApp message payload)
            history:           Conversation history for context
            context_snapshot:  Pre-loaded DB context (e.g., existing contact records)
            allowed_categories: Restrict the tool list to specific categories
            system_prompt_override: Custom instructions from the database

        Returns:
            A validated ToolCallPlan
        """
        template = system_prompt_override or load_prompt("aria_planner.md")
        system_prompt = template.format(
            tool_block=self._registry.to_prompt_block(categories=allowed_categories)
        )
        
        # Inject skills reference into the planner's context
        skills_ref = load_skills_reference()
        system_prompt += f"\n\n## Global Reference: Skills\n{skills_ref}"

        user_message = self._build_user_message(task_hint, input_data, history, context_snapshot)

        logger.info("Planner → LLM request: task='%s'", task_hint)

        llm_response = await self._provider.complete(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.1,   # Low temperature for deterministic planning
            max_tokens=4096,
        )

        plan = self._parse_response(llm_response.content)

        # We no longer raise NoPlanGeneratedError for empty steps, 
        # as it allows for conversational fallback and analysis.

        logger.info(
            "Planner → Plan ready: task='%s', steps=%d, impact=%d",
            plan.task_name, len(plan.steps), plan.estimated_record_impact
        )
        return plan

    async def synthesize(
        self,
        task_hint: str,
        reasoning: str,
        tool_results: list[tuple[ToolCallRequest, ToolResult]],
    ) -> str:
        """
        Produce a final natural language answer based on tool outputs.
        """
        # Build execution summary and tool results block
        summary_lines = []
        results_map = {}
        
        for i, (req, res) in enumerate(tool_results, start=1):
            summary_lines.append(f"{i}. Executed {req.tool_name}: {req.reasoning}")
            results_map[f"step_{i}_{req.tool_name}"] = {
                "success": res.success,
                "message": res.message,
                "data": res.data,
                "error": res.error
            }

        synthesis_prompt = load_prompt("aria_synthesis.md", {
            "task_hint": task_hint,
            "execution_summary": "\n".join(summary_lines),
            "tool_results_block": json.dumps(results_map, indent=2)
        })

        logger.info("Planner → Synthesis request for task='%s'", task_hint[:50])

        llm_response = await self._provider.complete(
            system_prompt="You are a helpful CRM assistant providing a final summary of your work.",
            user_message=synthesis_prompt,
            temperature=0.3, # Slightly higher for more natural synthesis
            max_tokens=1024,
        )

        return llm_response.content.strip()

    # ── Private Methods ───────────────────────────────────────────────────────

    def _build_user_message(
        self,
        task_hint: str,
        input_data: dict,
        history: list[dict] | None = None,
        context_snapshot: dict | None = None,
    ) -> str:
        parts = []
        
        if history:
            parts.append("## Conversation History")
            for msg in history:
                role = msg.get("role", "user").upper()
                content = msg.get("content", "")
                parts.append(f"<{role}>: {content}")
            parts.append("---\n")
            
        parts.append(f"## Current Task\n{task_hint}\n")

        if input_data:
            parts.append(f"## Input Data\n```json\n{json.dumps(input_data, indent=2)}\n```\n")

        if context_snapshot:
            parts.append(
                f"## Existing Context (from DB)\n"
                f"```json\n{json.dumps(context_snapshot, indent=2)}\n```\n"
            )
            parts.append(
                "IMPORTANT: Use the above context to avoid creating duplicates. "
                "If a record already exists, UPDATE it rather than creating a new one.\n"
            )

        parts.append(
            "Now produce the JSON plan. "
            "Return ONLY the JSON object — no markdown fences, no explanation text."
        )
        return "\n".join(parts)

    def _parse_response(self, raw: str) -> ToolCallPlan:
        """Parse and validate the LLM's JSON response into a ToolCallPlan."""
        # Robust JSON extraction from LLM response
        raw_strip = raw.strip()
        
        # Try to extract content between triple backticks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_strip, re.DOTALL)
        if json_match:
            cleaned = json_match.group(1).strip()
        else:
            # If no backticks, try to find the first '{' and last '}'
            first_brace = raw_strip.find('{')
            last_brace = raw_strip.rfind('}')
            if first_brace != -1 and last_brace != -1:
                cleaned = raw_strip[first_brace:last_brace+1].strip()
            else:
                cleaned = raw_strip

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse LLM response as JSON: %s\nRaw: %s", e, raw[:500])
            raise LLMResponseParseError(raw)

        # Validate required keys
        missing = [k for k in ("task_name", "reasoning", "steps") if k not in data]
        if missing:
            raise PlanningError(
                f"LLM response missing required fields: {missing}",
                context={"raw": raw[:500]},
            )

        # Normalize 'reasoning' — LLMs occasionally return a list instead of a string
        raw_reasoning = data.get("reasoning", "")
        if isinstance(raw_reasoning, list):
            reasoning = " ".join(str(r) for r in raw_reasoning)
        else:
            reasoning = str(raw_reasoning) if raw_reasoning else ""

        try:
            steps = [
                ToolCallRequest(
                    tool_name=step["tool_name"],
                    parameters=step.get("parameters", {}),
                    reasoning=step.get("reasoning"),
                )
                for step in data["steps"]
            ]
        except (KeyError, TypeError) as e:
            raise PlanningError(
                f"Could not parse steps from LLM response: {e}",
                context={"raw": raw[:500]},
            )

        return ToolCallPlan(
            task_name=data["task_name"],
            reasoning=reasoning,
            response_to_user=data.get("response_to_user"),
            steps=steps,
            estimated_record_impact=data.get("estimated_record_impact", 0),
        )
