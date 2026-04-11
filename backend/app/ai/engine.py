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
import json
import logging
import time
import uuid
from datetime import datetime, timezone, timedelta
from typing import Any, AsyncGenerator, TYPE_CHECKING

from app.ai.exceptions import (
    AIEngineError,
    LLMAuthError,
    LLMProviderError,
    LLMRateLimitError,
    TaskTimeoutError,
)
from app.ai.planner import Planner
from app.ai.providers import get_llm_provider
from app.ai.schemas import AITaskRunRequest, AITaskRunResponse, ToolCallPlan, ToolCallRequest, ToolResult
from app.ai.task_journal import TaskJournal
from app.ai.tool_registry import registry as global_registry
import app.ai.tools  # Trigger tool discovery and registration
from app.repositories.system_setting_repository import SystemSettingRepository
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
        user: "User",
    ):
        self._db = db
        self._user = user
        self._user_id = user.id
        self._registry = global_registry
        self._ist_offset = timedelta(hours=5, minutes=30)
        
        # Log tool count for diagnostics
        logger.debug(f"AIEngine initialized with {len(self._registry.all())} tools.")

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
                task_id=uuid.uuid4(),
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
    
    async def stream_chat(
        self,
        user_input: str,
        history: list[dict],
        session_id: int,
    ) -> AsyncGenerator[str, None]:
        """
        Execute an agentic chat turn with SSE streaming.
        Yields tokens and status events.
        """
        # Load system prompt from DB
        repo = SystemSettingRepository(self._db)
        stored_prompt = await repo.get_by_key("AI_SYSTEM_PROMPT")
        system_prompt = stored_prompt.value if stored_prompt else None

        # 1. Init Provider
        try:
            provider = await get_llm_provider(self._db)
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e), 'status': 'failed'})}\n\n"
            return

        journal = await TaskJournal.create(
            db=self._db,
            task_name="AI Coworker Chat",
            trigger=AITaskTrigger.MANUAL,
            raw_input={"message": user_input},
            ai_provider=provider.provider_name,
            ai_model=provider.model_name,
            triggered_by_user_id=self._user_id,
            chat_session_id=session_id,
        )

        try:
            # 2. Planning Phase
            yield f"data: {json.dumps({'status': 'planning', 'message': 'Planning response...'})}\n\n"
            await journal.mark_planning()
            planner = Planner(provider=provider, registry=self._registry)
            
            plan: ToolCallPlan = await planner.plan(
                task_hint=user_input,
                input_data={},
                history=history,
                system_prompt_override=system_prompt,
            )
            await journal.record_plan(plan)

            # 3. Execution Phase (Status Yielding)
            if plan.steps:
                for step in plan.steps:
                    yield f"data: {json.dumps({'status': 'executing', 'message': f'Running {step.tool_name}...'})}\n\n"
            
            response, results = await self._execute_task_with_plan(plan, journal)
            
            # 4. Local synthesis — NO second LLM call (prevents rate limit exhaustion)
            # The tool's `message` field is already a professional human-readable summary.
            # We stream it token-by-token to maintain the animated streaming UX.
            yield f"data: {json.dumps({'status': 'typing'})}\n\n"

            full_content = ""
            if results:
                # Build a professional response from tool results without an LLM call
                response_lines = []
                for req, res in results:
                    if res.success:
                        # Use the tool's own message — already human-readable
                        response_lines.append(res.message)
                        # Append any REVEAL_DATA as structured context
                        if res.data and res.data.get("REVEAL_DATA"):
                            reveal = res.data["REVEAL_DATA"]
                            # Parse REVEAL_DATA into readable format
                            # e.g. "ACTUAL_CANDIDATE_COUNT: 150" → "There are **150** registered candidates."
                            if "ACTUAL_CANDIDATE_COUNT" in reveal:
                                count = reveal.split(":")[-1].strip()
                                full_content = (
                                    f"There are currently **{count}** registered candidates in the system.\n\n"
                                    f"*Detailed breakdown:* {res.message}"
                                )
                            elif "PIPELINE_VALUE" in reveal:
                                full_content = f"📊 **Sales Pipeline Overview**\n\n{res.message}"
                            elif "STAFF_PERFORMANCE" in reveal:
                                full_content = f"👤 **Staff Performance Report**\n\n{res.message}"
                            elif "PENDING_DSR_COUNT" in reveal:
                                count = reveal.split("PENDING_DSR_COUNT:")[-1].split(",")[0].strip()
                                full_content = f"📋 **{count} users** have not submitted their DSR.\n\n{res.message}"
                            elif "TRAINING_STATS" in reveal:
                                full_content = f"🎓 **Training Analytics**\n\n{res.message}"
                            elif "LEAD_COUNTS" in reveal:
                                full_content = f"🎯 **Lead Pipeline**\n\n{res.message}"
                            else:
                                full_content = res.message
                        else:
                            full_content = res.message
                    else:
                        full_content = f"⚠️ Tool '{req.tool_name}' encountered an issue: {res.message}"

                # If multiple tools, join results
                if len(results) > 1 and not full_content:
                    full_content = "\n\n".join(response_lines)

            else:
                full_content = plan.response_to_user or "I've processed your request."

            # Stream the pre-built answer word-by-word for animated UX
            words = full_content.split(" ")
            for i, word in enumerate(words):
                token = word + (" " if i < len(words) - 1 else "")
                yield f"data: {json.dumps({'token': token})}\n\n"
                await asyncio.sleep(0.015)

            # 5. Finalize
            await journal.finalize(status=AITaskStatus.COMPLETED, summary=full_content)
            yield f"data: {json.dumps({'status': 'completed', 'summary': full_content, 'task_db_id': journal.task_id})}\n\n"

        except LLMRateLimitError as e:
            logger.warning("Rate limit hit during chat: %s", str(e))
            msg = f"⏳ **Rate Limit Exceeded:** {str(e)}. Please wait a moment."
            await journal.finalize(status=AITaskStatus.FAILED, summary=msg, error_message=str(e))
            yield f"data: {json.dumps({'error': msg, 'status': 'failed'})}\n\n"
        except LLMAuthError as e:
            msg = f"❌ **AI Configuration Error:** {str(e)}. Please check API keys."
            await journal.finalize(status=AITaskStatus.FAILED, summary=msg, error_message=str(e))
            yield f"data: {json.dumps({'error': msg, 'status': 'failed'})}\n\n"
        except Exception as e:
            logger.exception("Chat execution failed")
            msg = f"💥 **Unexpected Error:** {str(e)}"
            await journal.finalize(status=AITaskStatus.FAILED, summary=msg, error_message=str(e))
            yield f"data: {json.dumps({'error': msg, 'status': 'failed'})}\n\n"
        return

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
        response, results = await self._execute_task_with_plan(plan, journal)
        
        # Synthesis for background tasks too, to provide better logs
        if results and response.status == "completed":
             try:
                 synthesis = await planner.synthesize(
                     task_hint=request.task_hint,
                     reasoning=plan.reasoning,
                     tool_results=results
                 )
                 response.summary = synthesis
                 await journal.finalize(status=AITaskStatus.COMPLETED, summary=synthesis)
             except Exception:
                 pass
                 
        return response

    async def _execute_task_with_plan(
        self,
        plan: ToolCallPlan,
        journal: TaskJournal,
    ) -> tuple[AITaskRunResponse, list[tuple[ToolCallRequest, ToolResult]]]:
        """Shared logic to execute a series of tool calls from a plan."""
        await journal.mark_running()

        final_status = AITaskStatus.COMPLETED
        execution_results: list[tuple[ToolCallRequest, ToolResult]] = []

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
                result = await tool.execute(params=step.parameters, db=self._db, user=self._user)
                await journal.record_step_result(step_num, result)
                execution_results.append((step, result))
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

        return self._build_response(journal, status=final_status.value), execution_results

    # ── Private: Helpers ──────────────────────────────────────────────────────

    def _build_summary(self, plan: ToolCallPlan, journal: TaskJournal) -> str:
        log = journal.log
        ok = log.tools_succeeded
        fail = log.tools_failed
        total = log.tools_called
        records = log.records_affected

        # If zero tools called, return the AI's conversational response
        if total == 0 and plan.response_to_user:
            return plan.response_to_user

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
