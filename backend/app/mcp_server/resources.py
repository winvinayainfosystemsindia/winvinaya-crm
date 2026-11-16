from __future__ import annotations
"""MCP Resources for WinVinaya MIS (`mis://schema/glossary` and `mis://reports/monthly/{yyyy-mm}`)."""

import calendar
import json
from datetime import date
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.mcp.tools.mis_tools import GetMISDashboardTool
from app.models.user import User

GLOSSARY_DATA: dict[str, Any] = {
    "organization": "WinVinaya Foundation",
    "system": "WinVinaya CRM & MIS",
    "candidate_funnel_stages": [
        "1. Registered (candidates table)",
        "2. Screened (candidate_screenings table: status e.g. Selected, Rejected, Pending)",
        "3. Counselled (candidate_counseling table: status pending | selected | rejected)",
        "4. Allocated to Training Batch (training_candidate_allocations: allocated | in_training | completed | dropped_out | placed)",
        "5. Mapped to Job Role (placement_mappings: mapped -> shortlisted -> interview_l1..l5 -> technical_round -> hr_round -> offer_made -> offer_accepted -> joined)",
    ],
    "placement_pipeline_stages": {
        "mapped": "Candidate mapped to a job role for consideration",
        "shortlisted": "Shortlisted for employer submission",
        "interview_l1": "Level 1 interview stage",
        "interview_l2": "Level 2 interview stage",
        "interview_l3": "Level 3 interview stage",
        "technical_round": "Technical assessment/interview round",
        "hr_round": "HR round",
        "offer_made": "Employer extended a formal job offer",
        "offer_accepted": "Candidate accepted the offer",
        "offer_rejected": "Candidate declined the offer",
        "joined": "Candidate has joined the company",
        "not_joined": "Candidate accepted offer but did not join",
        "rejected": "Rejected during screening or interview",
        "dropped": "Candidate withdrew from the process",
        "on_hold": "Pipeline on hold",
    },
    "user_roles": [
        "admin",
        "manager",
        "sourcing",
        "placement",
        "trainer",
        "counselor",
        "project_coordinator",
        "developer",
        "marketing",
    ],
}


def list_mcp_resources() -> list[dict[str, Any]]:
    """Return static MCP resources."""
    today = date.today()
    ym = f"{today.year:04d}-{today.month:02d}"
    return [
        {
            "uri": "mis://schema/glossary",
            "name": "WinVinaya MIS Glossary & Funnel Definitions",
            "description": "Definitions of candidate funnel stages, placement pipeline stages, and statuses.",
            "mimeType": "application/json",
        },
        {
            "uri": f"mis://reports/monthly/{ym}",
            "name": f"Monthly MIS Report ({ym})",
            "description": f"Pre-computed WinVinaya MIS funnel metrics for {ym}.",
            "mimeType": "application/json",
        },
    ]


def list_mcp_resource_templates() -> list[dict[str, Any]]:
    """Return dynamic MCP resource templates."""
    return [
        {
            "uriTemplate": "mis://reports/monthly/{yyyy_mm}",
            "name": "Monthly MIS Report by Month (YYYY-MM)",
            "description": "WinVinaya MIS funnel KPIs for a specific month in YYYY-MM format.",
            "mimeType": "application/json",
        }
    ]


async def read_mcp_resource(uri: str, ro_db: AsyncSession, user: User) -> dict[str, Any]:
    """Read an MCP resource by URI."""
    if uri in ("mis://schema/glossary", "mis://glossary"):
        return {
            "contents": [
                {
                    "uri": uri,
                    "mimeType": "application/json",
                    "text": json.dumps(GLOSSARY_DATA, indent=2),
                }
            ]
        }

    prefix = "mis://reports/monthly/"
    if uri.startswith(prefix):
        ym = uri[len(prefix):].strip()
        parts = ym.split("-")
        if len(parts) != 2:
            raise ValueError(f"Invalid month format '{ym}'. Expected YYYY-MM.")
        year, month = int(parts[0]), int(parts[1])
        _, last_day = calendar.monthrange(year, month)
        start_date = f"{year:04d}-{month:02d}-01"
        end_date = f"{year:04d}-{month:02d}-{last_day:02d}"

        tool = GetMISDashboardTool()
        res = await tool.execute({"start_date": start_date, "end_date": end_date}, ro_db, user)
        return {
            "contents": [
                {
                    "uri": uri,
                    "mimeType": "application/json",
                    "text": json.dumps(
                        {"month": ym, "summary": res.message, "metrics": res.data},
                        default=str,
                        indent=2,
                    ),
                }
            ]
        }

    raise ValueError(f"Resource not found: {uri}")

