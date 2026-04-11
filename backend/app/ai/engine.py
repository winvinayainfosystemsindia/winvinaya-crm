"""
AI Engine — Main Orchestrator
==============================

AIEngine is the central coordinator for all agentic task runs.

Lifecycle of a task run:
  1. Create TaskJournal (DB row)
  2. Load context from DB if needed
  3. Call Planner → get ToolCallPlan
  4. For each step in plan:
     a. Validate tool parameters
     b. Check approval rules
     c. Execute tool → get ToolResult
     d. Record step in journal
  5. Finalize journal with status + summary
  6. Return AITaskRunResponse

All errors are caught and written to the journal — callers always
get a clean response, never a raw exception.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, TYPE_CHECKING

from app.ai.exceptions import (
    AIEngineError,
    LLMAuthError,
    LLMProviderError,
    TaskTimeoutError,
)
from app.ai.planner import Planner
from app.ai.providers import get_llm_provider
from app.ai.schemas import AITaskRunRequest, AITaskRunResponse, ToolCallPlan
from app.ai.task_journal import TaskJournal
from app.ai.tool_registry import ToolRegistry, registry as global_registry
from app.core.config import settings
from app.models.ai_task_log import AITaskStatus, AITaskTrigger

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class AIEngine:
    """
    The agentic orchestrator.

    Instantiated per-request (not a singleton) so each task run
    gets a fresh session, provider, and journal.
    """

    def __init__(
        self,
        db: "AsyncSession",
        registry: ToolRegistry | None = None,
        triggered_by_user_id: int | None = None,
    ):
        self._db = db
        self._registry = registry or global_registry
        self._user_id = triggered_by_user_id

    async def run(self, request: AITaskRunRequest) -> AITaskRunResponse:
        """
        Execute a full agentic task run.

        This is the single entry point for all AI task execution.
        It handles the full lifecycle and always returns a clean response.
        """
        # Determine trigger type
        try:
            trigger = AITaskTrigger(request.trigger_type)
        except ValueError:
            trigger = AITaskTrigger.API

        # Initialise LLM provider
        try:
            provider = await get_llm_provider(self._db)
        except (LLMAuthError, LLMProviderError) as e:
            logger.error("Cannot initialize LLM provider: %s", str(e))
            return AITaskRunResponse(
                task_id=__import__("uuid").uuid4(),
                status="failed",
                task_name=request.task_hint,
                steps_planned=0,
                steps_completed=0,
                steps_failed=0,
                records_affected=0,
                requires_approval=False,
                error=e.message,
            )

        # Create the journal (DB row) immediately
        journal = await TaskJournal.create(
            db=self._db,
            task_name=request.task_hint,
            trigger=trigger,
            raw_input=request.input_data,
            ai_provider=provider.provider_name,
            ai_model=provider.model_name,
            triggered_by_user_id=self._user_id,
        )

        try:
            # Run the full task with a hard timeout
            result = await asyncio.wait_for(
                self._execute_task(request, journal, provider),
                timeout=settings.AI_TASK_TIMEOUT_SECONDS,
            )
            return result

        except asyncio.TimeoutError:
            error_msg = f"Task timed out after {settings.AI_TASK_TIMEOUT_SECONDS}s"
            await journal.finalize(
                status=AITaskStatus.FAILED,
                summary="⏱️ Task execution timed out.",
                error_message=error_msg,
            )
            return self._build_response(journal, status="failed", error=error_msg)

        except Exception as e:
            logger.exception("Unexpected error in AIEngine.run — task_id=%d", journal.task_id)
            await journal.finalize(
                status=AITaskStatus.FAILED,
                summary="💥 An unexpected error occurred.",
                error_message=str(e),
            )
            return self._build_response(journal, status="failed", error=str(e))
    
    async def run_chat(
        self,
        user_input: str,
        history: list[dict],
        session_id: int,
    ) -> AITaskRunResponse:
        """
        Execute an agentic chat turn. 
        Contextualizes the plan based on conversation history.
        """
        # Initialise LLM provider
        try:
            provider = await get_llm_provider(self._db)
        except (LLMAuthError, LLMProviderError) as e:
            logger.error("LLM Provider initialization failed: %s", str(e))
            return self._build_response(
                None, 
                status="failed", 
                error=f"AI Engine is not configured correctly: {str(e)}. Please check your AI Settings."
            )

        # Create the journal (DB row) immediately
        journal = await TaskJournal.create(
            db=self._db,
            task_name="AI Coworker Chat",
            trigger=AITaskTrigger.MANUAL, # Or specific CHAT trigger
            raw_input={"message": user_input},
            ai_provider=provider.provider_name,
            ai_model=provider.model_name,
            triggered_by_user_id=self._user_id,
            chat_session_id=session_id,
        )

        try:
            # Planning Phase (with history)
            await journal.mark_planning()
            planner = Planner(provider=provider, registry=self._registry)
            
            plan: ToolCallPlan = await planner.plan(
                task_hint=user_input,
                input_data={},
                history=history,
            )
            await journal.record_plan(plan)

            # Execution Phase
            # Reuse core _execute_task_steps logic (refactored slightly)
            response = await self._execute_task_with_plan(plan, journal)
            
            # Extract the AI's direct response to the user
            if plan.response_to_user:
                response.summary = plan.response_to_user
            
            return response

        except Exception as e:
            logger.exception("Chat execution failed")
            await journal.finalize(
                status=AITaskStatus.FAILED,
                summary="Sorry, I encountered an error processing your request.",
                error_message=str(e),
            )
            return self._build_response(journal, status="failed", error=str(e))

    # ── Private: Main Execution Flow ──────────────────────────────────────────

    async def _execute_task(
        self,
        request: AITaskRunRequest,
        journal: TaskJournal,
        provider: Any,
    ) -> AITaskRunResponse:
        """Core task execution logic — called inside the timeout guard."""

        # ── 1. Planning Phase ─────────────────────────────────────────────────
        await journal.mark_planning()

        planner = Planner(provider=provider, registry=self._registry)

        try:
            plan: ToolCallPlan = await planner.plan(
                task_hint=request.task_hint,
                input_data=request.input_data,
                context_snapshot=None,  # Context loading (Phase 2+)
                allowed_categories=None,  # Allow all tools
            )
        except NoPlanGeneratedError:
            await journal.finalize(
                status=AITaskStatus.FAILED,
                summary="🤔 The AI could not determine a plan for this task.",
                error_message="No tool calls were generated.",
            )
            return self._build_response(journal, status="failed", error="No plan generated.")

        except LLMProviderError as e:
            await journal.finalize(
                status=AITaskStatus.FAILED,
                summary=f"❌ LLM provider error: {e.message}",
                error_message=e.message,
            )
            return self._build_response(journal, status="failed", error=e.message)

        await journal.record_plan(plan)

        # ── Dry Run: Return plan without executing ────────────────────────────
        if request.dry_run:
            dry_summary = (
                f"[DRY RUN] {len(plan.steps)} step(s) planned: "
                + ", ".join(s.tool_name for s in plan.steps)
            )
            await journal.finalize(
                status=AITaskStatus.COMPLETED,
                summary=dry_summary,
            )
            return self._build_response(journal, status="completed")

        # ── 2. Execution Phase ────────────────────────────────────────────────
        return await self._execute_task_with_plan(plan, journal)

    async def _execute_task_with_plan(
        self,
        plan: ToolCallPlan,
        journal: TaskJournal,
    ) -> AITaskRunResponse:
        """Shared logic to execute a series of tool calls from a plan."""
        await journal.mark_running()

        final_status = AITaskStatus.COMPLETED

        for step_num, step in enumerate(plan.steps, start=1):
            # Safety limit
            if step_num > settings.AI_MAX_TOOL_CALLS_PER_RUN:
                raise ToolLimitExceededError(settings.AI_MAX_TOOL_CALLS_PER_RUN)

            await journal.record_step_start(
                step_number=step_num,
                tool_name=step.tool_name,
                parameters=step.parameters,
                reasoning=step.reasoning,
            )

            # Get tool
            try:
                tool = self._registry.get(step.tool_name)
            except AIEngineError as e:
                from app.ai.schemas import ToolResult
                await journal.record_step_result(
                    step_num,
                    ToolResult(success=False, message=e.message, error=e.message),
                )
                final_status = AITaskStatus.PARTIALLY_COMPLETED
                continue

            # Validate parameters
            validation_errors = tool.validate_params(step.parameters)
            if validation_errors:
                from app.ai.schemas import ToolResult
                error_msg = "; ".join(validation_errors)
                await journal.record_step_result(
                    step_num,
                    ToolResult(success=False, message=f"Validation failed: {error_msg}", error=error_msg),
                )
                final_status = AITaskStatus.PARTIALLY_COMPLETED
                continue

            # Approval gate
            if tool.definition.requires_approval:
                await journal.mark_awaiting_approval(
                    reason="Tool requires human approval before execution",
                    pending_tool=step.tool_name,
                )
                return self._build_response(journal, status="awaiting_approval")

            # Execute
            try:
                from app.ai.schemas import ToolResult
                result = await tool.execute(params=step.parameters, db=self._db)
                await journal.record_step_result(step_num, result)
                if not result.success:
                    final_status = AITaskStatus.PARTIALLY_COMPLETED
            except Exception as e:
                logger.exception(
                    "Tool '%s' raised an unhandled exception at step %d",
                    step.tool_name, step_num
                )
                from app.ai.schemas import ToolResult
                await journal.record_step_result(
                    step_num,
                    ToolResult(success=False, message=f"Tool crashed: {type(e).__name__}", error=str(e)),
                )
                final_status = AITaskStatus.PARTIALLY_COMPLETED

        # Finalise journal
        summary = self._build_summary(plan, journal)
        await journal.finalize(
            status=final_status,
            summary=summary,
        )

        return self._build_response(journal, status=final_status.value)

    # ── Private: Helpers ──────────────────────────────────────────────────────

    def _build_summary(self, plan: ToolCallPlan, journal: TaskJournal) -> str:
        log = journal.log
        ok = log.tools_succeeded
        fail = log.tools_failed
        total = log.tools_called
        records = log.records_affected

        if fail == 0:
            emoji = "✅"
        elif ok == 0:
            emoji = "❌"
        else:
            emoji = "⚠️"

        return (
            f"{emoji} {plan.task_name} — "
            f"{ok}/{total} steps succeeded, "
            f"{records} record(s) affected."
        )

    def _build_response(
        self,
        journal: TaskJournal,
        status: str,
        error: str | None = None,
    ) -> AITaskRunResponse:
        log = journal.log
        return AITaskRunResponse(
            task_id=log.public_id,
            status=status,
            task_name=log.task_name,
            steps_planned=len(log.plan) if log.plan else 0,
            steps_completed=log.tools_succeeded,
            steps_failed=log.tools_failed,
            records_affected=log.records_affected,
            requires_approval=log.requires_approval,
            summary=log.summary,
            duration_ms=log.duration_ms,
            error=error or log.error_message,
        )
