"""
AI Engine — Core Data Schemas
===============================

Pydantic models for:
  - Tool definitions and tool call/result contracts
  - Task run requests and responses
  - Task journal read models
  - Internal planning schemas
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Tool Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ToolParameterSchema(BaseModel):
    """JSON Schema for a single tool parameter."""
    type: str
    description: str
    enum: list[str] | None = None
    default: Any = None


class ToolDefinition(BaseModel):
    """
    Full MCP-compatible tool definition.
    This is what gets injected into the LLM system prompt.
    """
    name: str = Field(..., description="Unique, snake_case tool identifier")
    description: str = Field(..., description="What this tool does (fed to the LLM)")
    category: str = Field(..., description="Grouping: crm | placement | training | candidate | hr | notification")
    requires_approval: bool = Field(
        default=False,
        description="If True, engine pauses and asks for human approval before executing"
    )
    is_read_only: bool = Field(
        default=False,
        description="If True, this tool only reads data; never modifies the DB"
    )
    parameters: dict[str, ToolParameterSchema] = Field(
        default_factory=dict,
        description="Map of parameter name → schema"
    )
    required_parameters: list[str] = Field(
        default_factory=list,
        description="Names of parameters that MUST be supplied"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "name": "create_lead",
                "description": "Creates a new CRM lead record",
                "category": "crm",
                "requires_approval": False,
                "is_read_only": False,
                "parameters": {
                    "title": {"type": "string", "description": "Lead title"},
                    "lead_source": {"type": "string", "description": "Source", "enum": ["whatsapp", "website"]},
                },
                "required_parameters": ["title", "lead_source"],
            }
        }


class ToolCallRequest(BaseModel):
    """A single tool call as planned by the LLM planner."""
    tool_name: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    reasoning: str | None = Field(
        default=None,
        description="LLM's reasoning for why this tool call is needed"
    )


class ToolStepLog(BaseModel):
    """
    Immutable record of one tool call's execution — written to the task journal.
    """
    step_number: int
    tool_name: str
    parameters: dict[str, Any]
    reasoning: str | None = None
    status: Literal["success", "failed", "skipped", "pending_approval"] = "pending_approval"
    result_data: dict[str, Any] | None = None
    result_message: str | None = None
    error: str | None = None
    records_affected: int = 0
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_ms: int | None = None


class ToolResult(BaseModel):
    """The return value every tool's execute() method must return."""
    success: bool
    message: str = Field(..., description="Human-readable outcome summary")
    data: dict[str, Any] = Field(
        default_factory=dict,
        description="Returned structured data (e.g., created record IDs, counts)"
    )
    records_affected: int = Field(
        default=0,
        description="Number of DB records created, updated, or deleted"
    )
    error: str | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Planning Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ToolCallPlan(BaseModel):
    """The structured output the LLM Planner produces before execution begins."""
    task_name: str
    reasoning: str = Field(..., description="Chain-of-thought explanation of the overall plan")
    steps: list[ToolCallRequest] = Field(..., description="Ordered list of tool calls to make")
    estimated_record_impact: int = Field(
        default=0,
        description="LLM's estimate of how many DB records this plan will touch"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Task Run Schemas (API Request / Response)
# ─────────────────────────────────────────────────────────────────────────────

class AITaskRunRequest(BaseModel):
    """
    Request body for POST /api/v1/ai/run
    Supports both manual and webhook-triggered task runs.
    """
    trigger_type: str = Field(
        ...,
        description="Type of trigger: manual | webhook | schedule | api",
        examples=["manual", "webhook"]
    )
    task_hint: str = Field(
        ...,
        description="Short description/intent of what should happen",
        examples=["Process WhatsApp enquiry from Raj Kumar", "Create job role from uploaded JD"]
    )
    input_data: dict[str, Any] = Field(
        default_factory=dict,
        description="Structured input payload for the task (e.g., parsed WhatsApp message)"
    )
    context_keys: list[str] = Field(
        default_factory=list,
        description="Hints for which context to pre-load (e.g., ['contact', 'open_deals'])"
    )
    dry_run: bool = Field(
        default=False,
        description="If True, plan is produced but no tools are actually executed"
    )


class AITaskRunResponse(BaseModel):
    """Response from POST /api/v1/ai/run"""
    task_id: uuid.UUID
    status: str
    task_name: str
    steps_planned: int
    steps_completed: int
    steps_failed: int
    records_affected: int
    requires_approval: bool
    summary: str | None = None
    duration_ms: int | None = None
    error: str | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Task Journal Read Models
# ─────────────────────────────────────────────────────────────────────────────

class AITaskLogRead(BaseModel):
    """Full task journal read model for the API response."""
    id: int
    public_id: uuid.UUID
    task_name: str
    trigger: str
    status: str
    ai_provider: str | None
    ai_model: str | None
    raw_input: dict | None
    plan: list | None
    plan_reasoning: str | None
    steps: list[ToolStepLog] | None
    tools_called: int
    tools_succeeded: int
    tools_failed: int
    records_affected: int
    requires_approval: bool
    summary: str | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    duration_ms: int | None
    llm_tokens_used: int | None
    llm_cost_usd: float | None
    created_at: datetime

    class Config:
        from_attributes = True


class AITaskLogListItem(BaseModel):
    """Compact summary for task list views."""
    id: int
    public_id: uuid.UUID
    task_name: str
    trigger: str
    status: str
    tools_called: int
    records_affected: int
    requires_approval: bool
    summary: str | None
    duration_ms: int | None
    created_at: datetime

    class Config:
        from_attributes = True
