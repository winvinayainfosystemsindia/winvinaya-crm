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
from app.ai.providers import LLMProvider
from app.ai.schemas import ToolCallPlan, ToolCallRequest
from app.ai.tool_registry import ToolRegistry

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# System Prompt Template
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """\
You are ARIA — the Agentic Reasoning and Intelligence Assistant for WinVinaya CRM.
You are an expert at analyzing business tasks and orchestrating CRM operations.
You work as a helpful CO-WORKER to the user.

Your role is to:
1. UNDERSTAND the user's task and business context carefully
2. PLAN a precise, minimal sequence of tool calls to accomplish the goal
3. AVOID creating duplicates — always search/check before creating
4. CONTEXTUALIZE your plan based on the conversation history provided
5. RETURN a valid JSON response matching the required schema exactly

## Available Tools
{tool_block}

## Response Schema (MUST follow exactly):
You MUST return only valid JSON. No explanation text outside the JSON.
```json
{{
  "task_name": "<short descriptive name for this task>",
  "reasoning": "<your step-by-step thinking about what needs to happen and why>",
  "estimated_record_impact": <integer: estimated number of DB records that will be created/updated>,
  "response_to_user": "<human-readable reply to show the user (e.g. 'I've created that lead for you.')>",
  "steps": [
    {{
      "tool_name": "<exact tool name>",
      "parameters": {{<key-value params matching the tool schema>}},
      "reasoning": "<why this step is needed>"
    }}
  ]
}}
```

## Critical Rules:
- ALWAYS check if a record exists before creating it (use search/find tools first)
- NEVER call the same write tool twice on the same entity in one plan
- If the task is ambiguous or impossible with available tools, return steps: [] with a clear reasoning
- Steps MUST be in logical dependency order (e.g., create company before creating contact)
- Parameters MUST match the tool's defined schema exactly
- estimated_record_impact should be conservative (err on the lower side)
- response_to_user should be professional and concise, summarizing what you will DO.
"""


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
    ) -> ToolCallPlan:
        """
        Generate a tool execution plan for the given task.

        Args:
            task_hint:         Natural language description of what to accomplish
            input_data:        Raw trigger data (e.g., WhatsApp message payload)
            context_snapshot:  Pre-loaded DB context (e.g., existing contact records)
            allowed_categories: Restrict the tool list to specific categories

        Returns:
            A validated ToolCallPlan

        Raises:
            NoPlanGeneratedError:     LLM returned empty steps
            LLMResponseParseError:    Response could not be parsed as JSON
            PlanningError:            Business-logic planning issue
            LLMProviderError:         Network/quota/auth failure
        """
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            tool_block=self._registry.to_prompt_block(categories=allowed_categories)
        )

        user_message = self._build_user_message(task_hint, input_data, history, context_snapshot)

        logger.info("Planner → LLM request: task='%s'", task_hint)

        llm_response = await self._provider.complete(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.1,   # Low temperature for deterministic planning
            max_tokens=4096,
        )

        plan = self._parse_response(llm_response.content)

        if not plan.steps:
            raise NoPlanGeneratedError()

        logger.info(
            "Planner → Plan ready: task='%s', steps=%d, impact=%d",
            plan.task_name, len(plan.steps), plan.estimated_record_impact
        )
        return plan

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
        # Strip markdown code fences if the LLM wrapped the output
        cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
        cleaned = cleaned.strip()

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
            reasoning=data["reasoning"],
            response_to_user=data.get("response_to_user"),
            steps=steps,
            estimated_record_impact=data.get("estimated_record_impact", 0),
        )
