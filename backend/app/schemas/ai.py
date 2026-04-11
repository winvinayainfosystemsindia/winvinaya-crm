"""
AI Engine — API Response Schemas
================================

Pydantic models for AI execution, task runs, and logs.
These are used as FastAPI response models and request bodies.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AITaskRunRequest(BaseModel):
    """Trigger a new AI task run."""
    task_hint: str = Field(..., description="Natural language description of the task")
    input_data: dict[str, Any] = Field(default_factory=dict, description="Payload (e.g. WhatsApp JSON)")
    trigger_type: str = Field("api", description="Where the task came from (api, whatsapp, internal)")
    dry_run: bool = Field(False, description="Plan only — do not execute tools")


class AITaskRunResponse(BaseModel):
    """Immediate response after triggering/running a task."""
    task_id: uuid.UUID = Field(..., description="Public ID of the task journal")
    status: str = Field(..., description="Final status (completed, failed, awaiting_approval, etc.)")
    task_name: str
    steps_planned: int
    steps_completed: int
    steps_failed: int
    records_affected: int
    requires_approval: bool
    summary: str | None = None
    duration_ms: int | None = None
    error: str | None = None


class AITaskLogListItem(BaseModel):
    """Schema for the paginated task list view."""
    id: int
    public_id: uuid.UUID
    task_name: str
    trigger: str
    status: str
    tools_called: int
    tools_succeeded: int
    records_affected: int
    requires_approval: bool
    summary: str | None
    duration_ms: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AITaskLogRead(AITaskLogListItem):
    """Complete task journal view including reasoning and steps."""
    raw_input: dict[str, Any] | None
    plan_reasoning: str | None
    plan: list[dict] | None
    steps: list[dict] | None
    context_snapshot: dict | None
    ai_provider: str | None
    ai_model: str | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    triggered_by_user_id: int | None
    approved_by_user_id: int | None
    approved_at: datetime | None
    llm_tokens_used: int | None
    llm_cost_usd: float | None

    model_config = ConfigDict(from_attributes=True)
