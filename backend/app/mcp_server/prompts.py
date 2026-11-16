from __future__ import annotations
"""MCP Prompts for one-click MIS analysis in Claude."""

from typing import Any

PROMPTS_CATALOG: list[dict[str, Any]] = [
    {
        "name": "weekly_mis_summary",
        "description": "Generate an executive weekly WinVinaya MIS summary covering registrations, screening, training batches, placement pipeline, and DSR compliance.",
        "arguments": [
            {
                "name": "start_date",
                "description": "Optional start date (YYYY-MM-DD) for the week",
                "required": False,
            },
            {
                "name": "end_date",
                "description": "Optional end date (YYYY-MM-DD) for the week",
                "required": False,
            },
        ],
    },
    {
        "name": "placement_pipeline_review",
        "description": "Review the placement Kanban pipeline for a specific job role, highlighting bottlenecks and candidates stuck in interview or offer stages.",
        "arguments": [
            {
                "name": "job_role",
                "description": "Job role title or numeric ID to review",
                "required": True,
            }
        ],
    },
    {
        "name": "batch_health_check",
        "description": "Perform a training batch health check covering attendance below 75%, dropouts, and mock interview performance.",
        "arguments": [
            {
                "name": "batch",
                "description": "Training batch name or numeric ID",
                "required": True,
            }
        ],
    },
]


def list_mcp_prompts() -> list[dict[str, Any]]:
    return PROMPTS_CATALOG


def get_mcp_prompt(name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
    args = arguments or {}
    if name == "weekly_mis_summary":
        sd = args.get("start_date") or "the past 7 days"
        ed = args.get("end_date") or "today"
        text = (
            f"Please produce an executive WinVinaya MIS summary from {sd} to {ed}.\n"
            "1. Call `get_mis_dashboard` and `get_candidate_analytics` to summarize new registrations and disability/city breakdowns.\n"
            "2. Call `get_training_analytics` and `list_training_batches` to report active batches and dropouts.\n"
            "3. Call `get_placement_report` and `get_interviews_and_offers` for placement progress.\n"
            "4. Call `get_dsr_status` for operational compliance."
        )
        return {
            "description": "Executive Weekly WinVinaya MIS Summary",
            "messages": [{"role": "user", "content": {"type": "text", "text": text}}],
        }

    if name == "placement_pipeline_review":
        jr = args.get("job_role") or ""
        text = (
            f"Please review the placement pipeline for job role '{jr}'.\n"
            "1. Call `get_job_role_pipeline` and `get_interviews_and_offers`.\n"
            "2. Summarize candidate counts at each stage, highlight candidates with the longest `days_in_pipeline`, and list pending interviews or offers."
        )
        return {
            "description": f"Placement Pipeline Review for {jr}",
            "messages": [{"role": "user", "content": {"type": "text", "text": text}}],
        }

    if name == "batch_health_check":
        batch = args.get("batch") or ""
        text = (
            f"Please run a health check for training batch '{batch}'.\n"
            "1. Call `list_training_batches` to check allocation and dropout counts.\n"
            "2. Call `get_batch_attendance` with `min_attendance_pct=75` to identify candidates with low attendance.\n"
            "3. Call `get_mock_interview_results` to summarize mock interview ratings and re-test needs."
        )
        return {
            "description": f"Training Batch Health Check for {batch}",
            "messages": [{"role": "user", "content": {"type": "text", "text": text}}],
        }

    raise ValueError(f"Unknown prompt: {name}")

