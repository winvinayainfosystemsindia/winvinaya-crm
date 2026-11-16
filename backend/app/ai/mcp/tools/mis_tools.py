"""
AI Engine & MCP — Comprehensive Read-Only MIS Tools
===================================================

Read-only tools exposing WinVinaya MIS metrics and records across:
- Overview / Executive Dashboard (`get_mis_dashboard`)
- Candidates (`get_candidate_profile`, `get_screening_funnel`)
- Training (`list_training_batches`, `get_batch_attendance`, `get_mock_interview_results`)
- Placement (`list_job_roles`, `get_job_role_pipeline`, `get_interviews_and_offers`, `get_placement_report`)
- CRM Companies (`list_companies`, `get_company_overview`)
- Operations (`get_leave_summary`, `list_tickets`)
"""

from __future__ import annotations

import logging
from datetime import date, datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import and_, func, or_, select

from app.ai.brain.schemas import ToolDefinition, ToolParameterSchema, ToolResult
from app.ai.mcp.base_tool import BaseTool
from app.ai.mcp.registry import registry
from app.models.candidate import Candidate
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_screening import CandidateScreening
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.models.dsr_leave_application import DSRLeaveApplication
from app.models.job_role import JobRole
from app.models.lead import Lead
from app.models.placement_interview import PlacementInterview
from app.models.placement_mapping import PlacementMapping
from app.models.placement_offer import PlacementOffer
from app.models.ticket import Ticket
from app.models.training_attendance import TrainingAttendance
from app.models.training_batch import TrainingBatch
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_mock_interview import TrainingMockInterview
from app.models.user import User

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

MAX_ROWS = 50


def _cap_limit(raw_limit: Any, default: int = 25) -> int:
    try:
        val = int(raw_limit) if raw_limit is not None else default
    except (TypeError, ValueError):
        val = default
    return max(1, min(val, MAX_ROWS))


def _parse_date(val: Any) -> date | None:
    if not val:
        return None
    if isinstance(val, date):
        return val
    return date.fromisoformat(str(val).strip()[:10])


# ── 1. Executive MIS Dashboard ──────────────────────────────────────────────

class GetMISDashboardTool(BaseTool):
    definition = ToolDefinition(
        name="get_mis_dashboard",
        description=(
            "Get top-level WinVinaya MIS funnel KPIs (registrations, screened, counselled, "
            "training allocations, active batches, job roles, placement mappings, offers, and joined) "
            "with optional start_date and end_date filter (YYYY-MM-DD)."
        ),
        category="candidate",
        is_read_only=True,
        parameters={
            "start_date": ToolParameterSchema(
                type="string",
                description="Optional start date (YYYY-MM-DD) for filtering created_at",
            ),
            "end_date": ToolParameterSchema(
                type="string",
                description="Optional end date (YYYY-MM-DD) for filtering created_at",
            ),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            start_dt = _parse_date(params.get("start_date"))
            end_dt = _parse_date(params.get("end_date"))

            def _apply_window(stmt, col):
                if start_dt:
                    stmt = stmt.where(func.date(col) >= start_dt)
                if end_dt:
                    stmt = stmt.where(func.date(col) <= end_dt)
                return stmt

            cand_q = _apply_window(
                select(func.count(Candidate.id)).where(Candidate.is_deleted == False),
                Candidate.created_at,
            )
            total_registered = (await db.execute(cand_q)).scalar() or 0

            scr_q = _apply_window(
                select(CandidateScreening.status, func.count(CandidateScreening.id))
                .where(CandidateScreening.is_deleted == False)
                .group_by(CandidateScreening.status),
                CandidateScreening.created_at,
            )
            screening_by_status = {
                (r[0] or "Unspecified"): r[1] for r in (await db.execute(scr_q)).all()
            }

            coun_q = _apply_window(
                select(CandidateCounseling.status, func.count(CandidateCounseling.id))
                .where(CandidateCounseling.is_deleted == False)
                .group_by(CandidateCounseling.status),
                CandidateCounseling.created_at,
            )
            counseling_by_status = {
                (r[0] or "pending"): r[1] for r in (await db.execute(coun_q)).all()
            }

            alloc_q = _apply_window(
                select(TrainingCandidateAllocation.status, func.count(TrainingCandidateAllocation.id))
                .where(TrainingCandidateAllocation.is_deleted == False)
                .group_by(TrainingCandidateAllocation.status),
                TrainingCandidateAllocation.created_at,
            )
            training_by_status = {
                (r[0] or "allocated"): r[1] for r in (await db.execute(alloc_q)).all()
            }

            batch_q = (
                select(TrainingBatch.status, func.count(TrainingBatch.id))
                .where(TrainingBatch.is_deleted == False)
                .group_by(TrainingBatch.status)
            )
            batches_by_status = {
                (r[0] or "planned"): r[1] for r in (await db.execute(batch_q)).all()
            }

            jr_q = (
                select(JobRole.status, func.count(JobRole.id))
                .where(JobRole.is_deleted == False)
                .group_by(JobRole.status)
            )
            job_roles_by_status = {
                (str(r[0].value if hasattr(r[0], "value") else r[0])): r[1]
                for r in (await db.execute(jr_q)).all()
            }

            pm_q = _apply_window(
                select(PlacementMapping.status, func.count(PlacementMapping.id))
                .where(and_(PlacementMapping.is_deleted == False, PlacementMapping.is_active == True))
                .group_by(PlacementMapping.status),
                PlacementMapping.mapped_at,
            )
            placement_by_stage = {
                (str(r[0].value if hasattr(r[0], "value") else r[0])): r[1]
                for r in (await db.execute(pm_q)).all()
            }

            offers_count = (
                await db.execute(
                    _apply_window(
                        select(func.count(PlacementOffer.id)).where(PlacementOffer.is_deleted == False),
                        PlacementOffer.created_at,
                    )
                )
            ).scalar() or 0

            joined_count = placement_by_stage.get("joined", 0)

            data = {
                "window": {
                    "start_date": str(start_dt) if start_dt else None,
                    "end_date": str(end_dt) if end_dt else None,
                },
                "candidates_registered": total_registered,
                "screening": {
                    "total_screened": sum(screening_by_status.values()),
                    "by_status": screening_by_status,
                },
                "counseling": {
                    "total_counselled": sum(counseling_by_status.values()),
                    "by_status": counseling_by_status,
                },
                "training": {
                    "total_allocations": sum(training_by_status.values()),
                    "allocations_by_status": training_by_status,
                    "batches_by_status": batches_by_status,
                },
                "placement": {
                    "job_roles_by_status": job_roles_by_status,
                    "active_mappings": sum(placement_by_stage.values()),
                    "mappings_by_stage": placement_by_stage,
                    "total_offers": offers_count,
                    "total_joined": joined_count,
                },
            }
            return ToolResult(
                success=True,
                message=(
                    f"MIS Dashboard: {total_registered} registered, "
                    f"{sum(screening_by_status.values())} screened, "
                    f"{sum(training_by_status.values())} trained/allocated, "
                    f"{offers_count} offers, {joined_count} joined."
                ),
                data=data,
            )
        except Exception as e:
            logger.exception("Error in get_mis_dashboard")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 2. Candidate Profile Timeline ───────────────────────────────────────────

class GetCandidateProfileTool(BaseTool):
    definition = ToolDefinition(
        name="get_candidate_profile",
        description=(
            "Get full 360-degree profile and timeline for a candidate (registration, disability, "
            "education, screening, counseling, training batches, mock interviews, and placement mappings) "
            "by candidate_id, email, or name."
        ),
        category="candidate",
        is_read_only=True,
        parameters={
            "candidate_id": ToolParameterSchema(type="integer", description="Candidate numeric ID"),
            "email": ToolParameterSchema(type="string", description="Candidate email address"),
            "name": ToolParameterSchema(type="string", description="Candidate name (partial match)"),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            cid = params.get("candidate_id")
            email = params.get("email")
            name = params.get("name")

            if not any([cid, email, name]):
                return ToolResult(
                    success=False,
                    message="Provide at least one of: candidate_id, email, or name.",
                    error="MISSING_FILTER",
                )

            stmt = select(Candidate).where(Candidate.is_deleted == False)
            if cid is not None:
                stmt = stmt.where(Candidate.id == int(cid))
            elif email:
                stmt = stmt.where(func.lower(Candidate.email) == email.strip().lower())
            elif name:
                stmt = stmt.where(Candidate.name.ilike(f"%{name.strip()}%"))

            candidates = (await db.execute(stmt.limit(5))).scalars().all()
            if not candidates:
                return ToolResult(success=True, message="No matching candidate found.", data={"candidates": []})

            cand = candidates[0]

            scr = (
                await db.execute(
                    select(CandidateScreening).where(
                        and_(CandidateScreening.candidate_id == cand.id, CandidateScreening.is_deleted == False)
                    )
                )
            ).scalar_one_or_none()

            coun = (
                await db.execute(
                    select(CandidateCounseling).where(
                        and_(CandidateCounseling.candidate_id == cand.id, CandidateCounseling.is_deleted == False)
                    )
                )
            ).scalar_one_or_none()

            alloc_rows = (
                await db.execute(
                    select(TrainingCandidateAllocation, TrainingBatch)
                    .join(TrainingBatch, TrainingBatch.id == TrainingCandidateAllocation.batch_id)
                    .where(
                        and_(
                            TrainingCandidateAllocation.candidate_id == cand.id,
                            TrainingCandidateAllocation.is_deleted == False,
                        )
                    )
                )
            ).all()

            mock_rows = (
                await db.execute(
                    select(TrainingMockInterview).where(
                        and_(
                            TrainingMockInterview.candidate_id == cand.id,
                            TrainingMockInterview.is_deleted == False,
                        )
                    )
                )
            ).scalars().all()

            pm_rows = (
                await db.execute(
                    select(PlacementMapping, JobRole, Company)
                    .join(JobRole, JobRole.id == PlacementMapping.job_role_id)
                    .join(Company, Company.id == JobRole.company_id)
                    .where(
                        and_(
                            PlacementMapping.candidate_id == cand.id,
                            PlacementMapping.is_deleted == False,
                        )
                    )
                )
            ).all()

            profile = {
                "id": cand.id,
                "public_id": str(cand.public_id),
                "name": cand.name,
                "gender": cand.gender,
                "email": cand.email,
                "phone": cand.phone,
                "whatsapp_number": cand.whatsapp_number,
                "dob": str(cand.dob) if cand.dob else None,
                "city": cand.city,
                "district": cand.district,
                "state": cand.state,
                "disability_details": cand.disability_details,
                "education_details": cand.education_details,
                "work_experience": cand.work_experience,
                "registered_at": str(cand.created_at),
                "screening": (
                    {
                        "status": scr.status,
                        "consent_status": scr.consent_status,
                        "skills": scr.skills,
                        "others": scr.others,
                    }
                    if scr
                    else None
                ),
                "counseling": (
                    {
                        "status": coun.status,
                        "counselor_name": coun.counselor_name,
                        "counseling_date": str(coun.counseling_date) if coun.counseling_date else None,
                        "feedback": coun.feedback,
                        "suitable_job_roles": coun.suitable_job_roles,
                    }
                    if coun
                    else None
                ),
                "training_batches": [
                    {
                        "batch_id": b.id,
                        "batch_name": b.batch_name,
                        "batch_status": b.status,
                        "allocation_status": a.status,
                        "is_dropout": a.is_dropout,
                        "dropout_remark": a.dropout_remark,
                    }
                    for a, b in alloc_rows
                ],
                "mock_interviews": [
                    {
                        "id": m.id,
                        "batch_id": m.batch_id,
                        "interviewer_name": m.interviewer_name,
                        "interview_date": str(m.interview_date),
                        "overall_rating": m.overall_rating,
                        "status": m.status,
                        "feedback": m.feedback,
                    }
                    for m in mock_rows
                ],
                "placement_mappings": [
                    {
                        "mapping_id": pm.id,
                        "job_role_id": jr.id,
                        "job_title": jr.title,
                        "company_name": comp.name,
                        "stage": str(pm.status.value if hasattr(pm.status, "value") else pm.status),
                        "match_score": pm.match_score,
                        "is_active": pm.is_active,
                        "mapped_at": str(pm.mapped_at),
                    }
                    for pm, jr, comp in pm_rows
                ],
            }

            return ToolResult(
                success=True,
                message=f"Retrieved profile for candidate '{cand.name}' (ID {cand.id}).",
                data={
                    "profile": profile,
                    "other_matches": [
                        {"id": c.id, "name": c.name, "email": c.email, "city": c.city}
                        for c in candidates[1:]
                    ],
                },
            )
        except Exception as e:
            logger.exception("Error in get_candidate_profile")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 3. Screening & Counseling Funnel ────────────────────────────────────────

class GetScreeningFunnelTool(BaseTool):
    definition = ToolDefinition(
        name="get_screening_funnel",
        description=(
            "Get candidate screening and counseling funnel metrics: total registered, not yet screened, "
            "screening status breakdown, consent breakdown, and counseling status breakdown."
        ),
        category="candidate",
        is_read_only=True,
        parameters={},
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            total_cand = (
                await db.execute(select(func.count(Candidate.id)).where(Candidate.is_deleted == False))
            ).scalar() or 0

            scr_rows = (
                await db.execute(
                    select(CandidateScreening.status, func.count(CandidateScreening.id))
                    .where(CandidateScreening.is_deleted == False)
                    .group_by(CandidateScreening.status)
                )
            ).all()
            screening_counts = {(r[0] or "In Progress"): r[1] for r in scr_rows}
            total_screened = sum(screening_counts.values())

            consent_rows = (
                await db.execute(
                    select(CandidateScreening.consent_status, func.count(CandidateScreening.id))
                    .where(CandidateScreening.is_deleted == False)
                    .group_by(CandidateScreening.consent_status)
                )
            ).all()
            consent_counts = {(r[0] or "None"): r[1] for r in consent_rows}

            coun_rows = (
                await db.execute(
                    select(CandidateCounseling.status, func.count(CandidateCounseling.id))
                    .where(CandidateCounseling.is_deleted == False)
                    .group_by(CandidateCounseling.status)
                )
            ).all()
            counseling_counts = {(r[0] or "pending"): r[1] for r in coun_rows}

            return ToolResult(
                success=True,
                message=(
                    f"Funnel: {total_cand} registered, {total_screened} screened "
                    f"({max(0, total_cand - total_screened)} unscreened), "
                    f"{sum(counseling_counts.values())} counselled."
                ),
                data={
                    "total_registered": total_cand,
                    "total_screened": total_screened,
                    "unscreened": max(0, total_cand - total_screened),
                    "screening_by_status": screening_counts,
                    "consent_by_status": consent_counts,
                    "counseling_by_status": counseling_counts,
                },
            )
        except Exception as e:
            logger.exception("Error in get_screening_funnel")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 4. Training Batches & Attendance & Mock Interviews ──────────────────────

class ListTrainingBatchesTool(BaseTool):
    definition = ToolDefinition(
        name="list_training_batches",
        description=(
            "List training batches with status, start/close dates, disability types, and candidate counts "
            "(allocated, in_training, completed, dropped_out, placed)."
        ),
        category="training",
        is_read_only=True,
        parameters={
            "status": ToolParameterSchema(
                type="string",
                description="Optional batch status filter (e.g., 'planned', 'ongoing', 'running', 'completed')",
            ),
            "search": ToolParameterSchema(
                type="string",
                description="Optional search term matching batch_name",
            ),
            "limit": ToolParameterSchema(
                type="integer",
                description="Max batches to return (default 25, max 50)",
                default=25,
            ),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            status_filter = params.get("status")
            search = params.get("search")

            stmt = select(TrainingBatch).where(TrainingBatch.is_deleted == False)
            count_stmt = select(func.count(TrainingBatch.id)).where(TrainingBatch.is_deleted == False)

            if status_filter:
                stmt = stmt.where(func.lower(TrainingBatch.status) == status_filter.strip().lower())
                count_stmt = count_stmt.where(func.lower(TrainingBatch.status) == status_filter.strip().lower())
            if search:
                stmt = stmt.where(TrainingBatch.batch_name.ilike(f"%{search.strip()}%"))
                count_stmt = count_stmt.where(TrainingBatch.batch_name.ilike(f"%{search.strip()}%"))

            total_count = (await db.execute(count_stmt)).scalar() or 0
            batches = (await db.execute(stmt.order_by(TrainingBatch.id.desc()).limit(limit))).scalars().all()

            batch_ids = [b.id for b in batches]
            alloc_map: dict[int, dict[str, int]] = {bid: {} for bid in batch_ids}
            if batch_ids:
                alloc_rows = (
                    await db.execute(
                        select(
                            TrainingCandidateAllocation.batch_id,
                            TrainingCandidateAllocation.status,
                            func.count(TrainingCandidateAllocation.id),
                        )
                        .where(
                            and_(
                                TrainingCandidateAllocation.batch_id.in_(batch_ids),
                                TrainingCandidateAllocation.is_deleted == False,
                            )
                        )
                        .group_by(TrainingCandidateAllocation.batch_id, TrainingCandidateAllocation.status)
                    )
                ).all()
                for bid, st, cnt in alloc_rows:
                    alloc_map.setdefault(bid, {})[st or "allocated"] = cnt

            items = []
            for b in batches:
                st_counts = alloc_map.get(b.id, {})
                items.append(
                    {
                        "id": b.id,
                        "batch_name": b.batch_name,
                        "status": b.status,
                        "start_date": str(b.start_date) if b.start_date else None,
                        "approx_close_date": str(b.approx_close_date) if b.approx_close_date else None,
                        "disability_types": b.disability_types,
                        "total_candidates": sum(st_counts.values()),
                        "status_breakdown": st_counts,
                    }
                )

            return ToolResult(
                success=True,
                message=f"Returned {len(items)} of {total_count} training batches.",
                data={"total_count": total_count, "batches": items},
            )
        except Exception as e:
            logger.exception("Error in list_training_batches")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetBatchAttendanceTool(BaseTool):
    definition = ToolDefinition(
        name="get_batch_attendance",
        description=(
            "Get attendance statistics for a specific training batch or across batches, "
            "including overall attendance rate and candidates below a threshold (default 75%)."
        ),
        category="training",
        is_read_only=True,
        parameters={
            "batch_id": ToolParameterSchema(type="integer", description="Training batch ID"),
            "batch_name": ToolParameterSchema(type="string", description="Training batch name (partial match)"),
            "min_attendance_pct": ToolParameterSchema(
                type="number",
                description="Threshold percentage to flag low-attendance candidates (default 75.0)",
                default=75.0,
            ),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            batch_id = params.get("batch_id")
            batch_name = params.get("batch_name")
            threshold = float(params.get("min_attendance_pct") or 75.0)

            b_stmt = select(TrainingBatch).where(TrainingBatch.is_deleted == False)
            if batch_id is not None:
                b_stmt = b_stmt.where(TrainingBatch.id == int(batch_id))
            elif batch_name:
                b_stmt = b_stmt.where(TrainingBatch.batch_name.ilike(f"%{batch_name.strip()}%"))

            batches = (await db.execute(b_stmt.order_by(TrainingBatch.id.desc()).limit(20))).scalars().all()
            if not batches:
                return ToolResult(success=True, message="No matching training batches found.", data={"batches": []})

            batch_summaries = []
            low_attendance_candidates = []

            for b in batches:
                att_rows = (
                    await db.execute(
                        select(
                            TrainingAttendance.candidate_id,
                            Candidate.name,
                            Candidate.email,
                            TrainingAttendance.status,
                            func.count(TrainingAttendance.id),
                        )
                        .join(Candidate, Candidate.id == TrainingAttendance.candidate_id)
                        .where(
                            and_(
                                TrainingAttendance.batch_id == b.id,
                                TrainingAttendance.is_deleted == False,
                            )
                        )
                        .group_by(
                            TrainingAttendance.candidate_id,
                            Candidate.name,
                            Candidate.email,
                            TrainingAttendance.status,
                        )
                    )
                ).all()

                cand_stats: dict[int, dict[str, Any]] = {}
                batch_present = 0
                batch_total = 0

                for cid, cname, cemail, st, cnt in att_rows:
                    entry = cand_stats.setdefault(
                        cid,
                        {"candidate_id": cid, "name": cname, "email": cemail, "present": 0, "total": 0},
                    )
                    entry["total"] += cnt
                    batch_total += cnt
                    if (st or "").lower() in ("present", "late", "half_day"):
                        weight = 0.5 if (st or "").lower() == "half_day" else 1.0
                        entry["present"] += cnt * weight
                        batch_present += cnt * weight

                below_count = 0
                for cid, cs in cand_stats.items():
                    pct = round((cs["present"] / cs["total"]) * 100.0, 1) if cs["total"] > 0 else 0.0
                    if pct < threshold:
                        below_count += 1
                        if len(low_attendance_candidates) < MAX_ROWS:
                            low_attendance_candidates.append(
                                {
                                    "batch_id": b.id,
                                    "batch_name": b.batch_name,
                                    "candidate_id": cid,
                                    "candidate_name": cs["name"],
                                    "email": cs["email"],
                                    "attendance_pct": pct,
                                    "sessions_attended": cs["present"],
                                    "total_sessions": cs["total"],
                                }
                            )

                overall_pct = round((batch_present / batch_total) * 100.0, 1) if batch_total > 0 else None
                batch_summaries.append(
                    {
                        "batch_id": b.id,
                        "batch_name": b.batch_name,
                        "status": b.status,
                        "overall_attendance_pct": overall_pct,
                        "tracked_candidates": len(cand_stats),
                        "candidates_below_threshold": below_count,
                    }
                )

            return ToolResult(
                success=True,
                message=(
                    f"Computed attendance for {len(batch_summaries)} batch(es); "
                    f"{len(low_attendance_candidates)} candidate(s) below {threshold}%."
                ),
                data={
                    "threshold_pct": threshold,
                    "batches": batch_summaries,
                    "low_attendance_candidates": low_attendance_candidates,
                },
            )
        except Exception as e:
            logger.exception("Error in get_batch_attendance")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetMockInterviewResultsTool(BaseTool):
    definition = ToolDefinition(
        name="get_mock_interview_results",
        description="Get training mock interview statistics and candidate evaluations by batch or status.",
        category="training",
        is_read_only=True,
        parameters={
            "batch_id": ToolParameterSchema(type="integer", description="Optional batch ID"),
            "status": ToolParameterSchema(
                type="string",
                description="Optional status filter (pending, cleared, re-test, rejected, absent)",
            ),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            batch_id = params.get("batch_id")
            status_filter = params.get("status")

            base_cond = [TrainingMockInterview.is_deleted == False]
            if batch_id is not None:
                base_cond.append(TrainingMockInterview.batch_id == int(batch_id))
            if status_filter:
                base_cond.append(func.lower(TrainingMockInterview.status) == status_filter.strip().lower())

            agg_rows = (
                await db.execute(
                    select(
                        TrainingMockInterview.status,
                        func.count(TrainingMockInterview.id),
                        func.avg(TrainingMockInterview.overall_rating),
                    )
                    .where(and_(*base_cond))
                    .group_by(TrainingMockInterview.status)
                )
            ).all()

            status_summary = {
                (r[0] or "pending"): {
                    "count": r[1],
                    "avg_rating": round(float(r[2]), 2) if r[2] is not None else None,
                }
                for r in agg_rows
            }

            rows = (
                await db.execute(
                    select(TrainingMockInterview, Candidate.name, TrainingBatch.batch_name)
                    .join(Candidate, Candidate.id == TrainingMockInterview.candidate_id)
                    .join(TrainingBatch, TrainingBatch.id == TrainingMockInterview.batch_id)
                    .where(and_(*base_cond))
                    .order_by(TrainingMockInterview.interview_date.desc())
                    .limit(limit)
                )
            ).all()

            records = [
                {
                    "id": m.id,
                    "candidate_id": m.candidate_id,
                    "candidate_name": cname,
                    "batch_id": m.batch_id,
                    "batch_name": bname,
                    "interviewer_name": m.interviewer_name,
                    "status": m.status,
                    "overall_rating": m.overall_rating,
                    "interview_date": str(m.interview_date),
                    "feedback": m.feedback,
                }
                for m, cname, bname in rows
            ]

            total_count = sum(v["count"] for v in status_summary.values())
            return ToolResult(
                success=True,
                message=f"Found {total_count} mock interview(s).",
                data={
                    "total_count": total_count,
                    "status_summary": status_summary,
                    "interviews": records,
                },
            )
        except Exception as e:
            logger.exception("Error in get_mock_interview_results")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 5. Placement Job Roles, Pipeline, Interviews & Offers ───────────────────

class ListJobRolesTool(BaseTool):
    definition = ToolDefinition(
        name="list_job_roles",
        description=(
            "List placement job roles with company name, status, vacancies, salary range, "
            "and mapped candidate counts."
        ),
        category="placement",
        is_read_only=True,
        parameters={
            "status": ToolParameterSchema(
                type="string",
                description="Optional status filter ('active', 'inactive', 'closed')",
            ),
            "search": ToolParameterSchema(
                type="string",
                description="Optional search term for job title or company name",
            ),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            status_filter = params.get("status")
            search = params.get("search")

            stmt = (
                select(JobRole, Company.name)
                .join(Company, Company.id == JobRole.company_id)
                .where(JobRole.is_deleted == False)
            )
            if status_filter:
                stmt = stmt.where(JobRole.status == status_filter.strip().lower())
            if search:
                s = f"%{search.strip()}%"
                stmt = stmt.where(or_(JobRole.title.ilike(s), Company.name.ilike(s)))

            rows = (await db.execute(stmt.order_by(JobRole.id.desc()).limit(limit))).all()
            jr_ids = [jr.id for jr, _ in rows]

            stage_map: dict[int, dict[str, int]] = {}
            if jr_ids:
                pm_rows = (
                    await db.execute(
                        select(
                            PlacementMapping.job_role_id,
                            PlacementMapping.status,
                            func.count(PlacementMapping.id),
                        )
                        .where(
                            and_(
                                PlacementMapping.job_role_id.in_(jr_ids),
                                PlacementMapping.is_deleted == False,
                                PlacementMapping.is_active == True,
                            )
                        )
                        .group_by(PlacementMapping.job_role_id, PlacementMapping.status)
                    )
                ).all()
                for jid, st, cnt in pm_rows:
                    st_key = str(st.value if hasattr(st, "value") else st)
                    stage_map.setdefault(jid, {})[st_key] = cnt

            items = []
            for jr, comp_name in rows:
                stages = stage_map.get(jr.id, {})
                items.append(
                    {
                        "id": jr.id,
                        "title": jr.title,
                        "company_id": jr.company_id,
                        "company_name": comp_name,
                        "status": str(jr.status.value if hasattr(jr.status, "value") else jr.status),
                        "no_of_vacancies": jr.no_of_vacancies,
                        "close_date": str(jr.close_date) if jr.close_date else None,
                        "location": jr.location,
                        "salary_range": jr.salary_range,
                        "total_mapped_candidates": sum(stages.values()),
                        "pipeline_stage_counts": stages,
                    }
                )

            return ToolResult(
                success=True,
                message=f"Found {len(items)} job role(s).",
                data={"total_count": len(items), "job_roles": items},
            )
        except Exception as e:
            logger.exception("Error in list_job_roles")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetJobRolePipelineTool(BaseTool):
    definition = ToolDefinition(
        name="get_job_role_pipeline",
        description=(
            "Get the Kanban placement pipeline for a job role (by job_role_id or title): "
            "stage counts and the list of mapped candidates with current stage, match score, and days in pipeline."
        ),
        category="placement",
        is_read_only=True,
        parameters={
            "job_role_id": ToolParameterSchema(type="integer", description="Job Role ID"),
            "title": ToolParameterSchema(type="string", description="Job Role title (partial match)"),
            "stage": ToolParameterSchema(
                type="string",
                description="Optional stage filter (e.g. 'mapped', 'shortlisted', 'interview_l1', 'offer_made', 'joined')",
            ),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            jrid = params.get("job_role_id")
            title = params.get("title")
            stage_filter = params.get("stage")

            if not jrid and not title:
                return ToolResult(
                    success=False,
                    message="Provide either job_role_id or title.",
                    error="MISSING_FILTER",
                )

            jr_stmt = (
                select(JobRole, Company.name)
                .join(Company, Company.id == JobRole.company_id)
                .where(JobRole.is_deleted == False)
            )
            if jrid is not None:
                jr_stmt = jr_stmt.where(JobRole.id == int(jrid))
            elif title:
                jr_stmt = jr_stmt.where(JobRole.title.ilike(f"%{title.strip()}%"))

            jr_row = (await db.execute(jr_stmt.limit(1))).first()
            if not jr_row:
                return ToolResult(success=True, message="No matching job role found.", data={"job_role": None})

            jr, comp_name = jr_row

            pm_stmt = (
                select(PlacementMapping, Candidate)
                .join(Candidate, Candidate.id == PlacementMapping.candidate_id)
                .where(
                    and_(
                        PlacementMapping.job_role_id == jr.id,
                        PlacementMapping.is_deleted == False,
                        PlacementMapping.is_active == True,
                    )
                )
            )
            if stage_filter:
                pm_stmt = pm_stmt.where(PlacementMapping.status == stage_filter.strip().lower())

            pm_rows = (await db.execute(pm_stmt.order_by(PlacementMapping.updated_at.asc()))).all()

            stage_counts: dict[str, int] = {}
            candidates_list = []
            now_utc = datetime.utcnow()

            for pm, cand in pm_rows:
                st = str(pm.status.value if hasattr(pm.status, "value") else pm.status)
                stage_counts[st] = stage_counts.get(st, 0) + 1
                ref_dt = pm.mapped_at.replace(tzinfo=None) if pm.mapped_at else now_utc
                days_in_pipeline = max(0, (now_utc - ref_dt).days)
                if len(candidates_list) < MAX_ROWS:
                    candidates_list.append(
                        {
                            "mapping_id": pm.id,
                            "candidate_id": cand.id,
                            "candidate_name": cand.name,
                            "email": cand.email,
                            "phone": cand.phone,
                            "city": cand.city,
                            "stage": st,
                            "priority": pm.priority,
                            "match_score": pm.match_score,
                            "mapped_at": str(pm.mapped_at),
                            "days_in_pipeline": days_in_pipeline,
                            "notes": pm.notes,
                        }
                    )

            return ToolResult(
                success=True,
                message=(
                    f"Pipeline for '{jr.title}' ({comp_name}): "
                    f"{len(pm_rows)} active candidate(s) across {len(stage_counts)} stage(s)."
                ),
                data={
                    "job_role": {
                        "id": jr.id,
                        "title": jr.title,
                        "company_name": comp_name,
                        "status": str(jr.status.value if hasattr(jr.status, "value") else jr.status),
                        "no_of_vacancies": jr.no_of_vacancies,
                    },
                    "total_active_candidates": len(pm_rows),
                    "stage_counts": stage_counts,
                    "candidates": candidates_list,
                },
            )
        except Exception as e:
            logger.exception("Error in get_job_role_pipeline")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetInterviewsAndOffersTool(BaseTool):
    definition = ToolDefinition(
        name="get_interviews_and_offers",
        description=(
            "Get placement interview rounds (by result/round type) and job offers "
            "(by candidate response, joining status, and average offered CTC)."
        ),
        category="placement",
        is_read_only=True,
        parameters={
            "job_role_id": ToolParameterSchema(type="integer", description="Optional job role ID filter"),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            jrid = params.get("job_role_id")

            int_cond = [PlacementInterview.is_deleted == False]
            off_cond = [PlacementOffer.is_deleted == False]
            if jrid is not None:
                int_cond.append(PlacementInterview.job_role_id == int(jrid))
                off_cond.append(PlacementOffer.job_role_id == int(jrid))

            int_agg = (
                await db.execute(
                    select(PlacementInterview.result, func.count(PlacementInterview.id))
                    .where(and_(*int_cond))
                    .group_by(PlacementInterview.result)
                )
            ).all()
            interviews_by_result = {
                str(r[0].value if hasattr(r[0], "value") else r[0]): r[1] for r in int_agg
            }

            off_agg = (
                await db.execute(
                    select(
                        PlacementOffer.candidate_response,
                        PlacementOffer.joining_status,
                        func.count(PlacementOffer.id),
                        func.avg(PlacementOffer.offered_ctc),
                    )
                    .where(and_(*off_cond))
                    .group_by(PlacementOffer.candidate_response, PlacementOffer.joining_status)
                )
            ).all()

            offer_breakdown = [
                {
                    "candidate_response": str(r[0].value if hasattr(r[0], "value") else r[0]),
                    "joining_status": str(r[1].value if hasattr(r[1], "value") else r[1]) if r[1] else None,
                    "count": r[2],
                    "avg_ctc": round(float(r[3]), 2) if r[3] is not None else None,
                }
                for r in off_agg
            ]

            recent_offers_rows = (
                await db.execute(
                    select(PlacementOffer, Candidate.name, JobRole.title, Company.name)
                    .join(Candidate, Candidate.id == PlacementOffer.candidate_id)
                    .join(JobRole, JobRole.id == PlacementOffer.job_role_id)
                    .join(Company, Company.id == JobRole.company_id)
                    .where(and_(*off_cond))
                    .order_by(PlacementOffer.id.desc())
                    .limit(limit)
                )
            ).all()

            recent_offers = [
                {
                    "offer_id": o.id,
                    "candidate_id": o.candidate_id,
                    "candidate_name": cname,
                    "job_role_id": o.job_role_id,
                    "job_title": jtitle,
                    "company_name": comp_name,
                    "offered_ctc": o.offered_ctc,
                    "offered_designation": o.offered_designation,
                    "work_location": o.work_location,
                    "candidate_response": str(
                        o.candidate_response.value
                        if hasattr(o.candidate_response, "value")
                        else o.candidate_response
                    ),
                    "joining_status": (
                        str(o.joining_status.value if hasattr(o.joining_status, "value") else o.joining_status)
                        if o.joining_status
                        else None
                    ),
                    "joining_date": str(o.joining_date) if o.joining_date else None,
                }
                for o, cname, jtitle, comp_name in recent_offers_rows
            ]

            return ToolResult(
                success=True,
                message=(
                    f"Interviews: {sum(interviews_by_result.values())}; "
                    f"Offers: {sum(x['count'] for x in offer_breakdown)}."
                ),
                data={
                    "interviews_by_result": interviews_by_result,
                    "offer_breakdown": offer_breakdown,
                    "recent_offers": recent_offers,
                },
            )
        except Exception as e:
            logger.exception("Error in get_interviews_and_offers")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetPlacementReportTool(BaseTool):
    definition = ToolDefinition(
        name="get_placement_report",
        description=(
            "Get placement report aggregated by company and pipeline stage, with optional "
            "start_date, end_date, or company_name filter."
        ),
        category="placement",
        is_read_only=True,
        parameters={
            "start_date": ToolParameterSchema(type="string", description="Optional start date (YYYY-MM-DD)"),
            "end_date": ToolParameterSchema(type="string", description="Optional end date (YYYY-MM-DD)"),
            "company_name": ToolParameterSchema(type="string", description="Optional company name filter"),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            start_dt = _parse_date(params.get("start_date"))
            end_dt = _parse_date(params.get("end_date"))
            company_name = params.get("company_name")

            stmt = (
                select(
                    Company.id,
                    Company.name,
                    PlacementMapping.status,
                    func.count(PlacementMapping.id),
                )
                .join(JobRole, JobRole.id == PlacementMapping.job_role_id)
                .join(Company, Company.id == JobRole.company_id)
                .where(and_(PlacementMapping.is_deleted == False, PlacementMapping.is_active == True))
                .group_by(Company.id, Company.name, PlacementMapping.status)
            )
            if start_dt:
                stmt = stmt.where(func.date(PlacementMapping.mapped_at) >= start_dt)
            if end_dt:
                stmt = stmt.where(func.date(PlacementMapping.mapped_at) <= end_dt)
            if company_name:
                stmt = stmt.where(Company.name.ilike(f"%{company_name.strip()}%"))

            rows = (await db.execute(stmt)).all()
            by_company: dict[int, dict[str, Any]] = {}
            global_stages: dict[str, int] = {}

            for cid, cname, st, cnt in rows:
                st_str = str(st.value if hasattr(st, "value") else st)
                global_stages[st_str] = global_stages.get(st_str, 0) + cnt
                comp_entry = by_company.setdefault(
                    cid,
                    {"company_id": cid, "company_name": cname, "total_mapped": 0, "stages": {}},
                )
                comp_entry["total_mapped"] += cnt
                comp_entry["stages"][st_str] = cnt

            company_list = sorted(by_company.values(), key=lambda x: x["total_mapped"], reverse=True)[:MAX_ROWS]

            return ToolResult(
                success=True,
                message=(
                    f"Placement report across {len(company_list)} company(ies), "
                    f"{sum(global_stages.values())} active mappings."
                ),
                data={
                    "global_stage_counts": global_stages,
                    "by_company": company_list,
                },
            )
        except Exception as e:
            logger.exception("Error in get_placement_report")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 6. CRM Companies ────────────────────────────────────────────────────────

class ListCompaniesTool(BaseTool):
    definition = ToolDefinition(
        name="list_companies",
        description="List CRM companies with industry, size, status, and search filter.",
        category="crm",
        is_read_only=True,
        parameters={
            "search": ToolParameterSchema(type="string", description="Optional search by company name or industry"),
            "status": ToolParameterSchema(
                type="string",
                description="Optional status ('active', 'inactive', 'prospect', 'customer')",
            ),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            search = params.get("search")
            status_filter = params.get("status")

            stmt = select(Company).where(Company.is_deleted == False)
            count_stmt = select(func.count(Company.id)).where(Company.is_deleted == False)

            if status_filter:
                stmt = stmt.where(Company.status == status_filter.strip().lower())
                count_stmt = count_stmt.where(Company.status == status_filter.strip().lower())
            if search:
                s = f"%{search.strip()}%"
                cond = or_(Company.name.ilike(s), Company.industry.ilike(s))
                stmt = stmt.where(cond)
                count_stmt = count_stmt.where(cond)

            total_count = (await db.execute(count_stmt)).scalar() or 0
            companies = (await db.execute(stmt.order_by(Company.id.desc()).limit(limit))).scalars().all()

            items = [
                {
                    "id": c.id,
                    "name": c.name,
                    "industry": c.industry,
                    "company_size": str(c.company_size.value if hasattr(c.company_size, "value") else c.company_size)
                    if c.company_size
                    else None,
                    "status": str(c.status.value if hasattr(c.status, "value") else c.status),
                    "website": c.website,
                    "email": c.email,
                    "phone": c.phone,
                }
                for c in companies
            ]

            return ToolResult(
                success=True,
                message=f"Returned {len(items)} of {total_count} companies.",
                data={"total_count": total_count, "companies": items},
            )
        except Exception as e:
            logger.exception("Error in list_companies")
            return ToolResult(success=False, message=str(e), error=str(e))


class GetCompanyOverviewTool(BaseTool):
    definition = ToolDefinition(
        name="get_company_overview",
        description="Get full overview of a company (contacts, leads, deals, job roles, and placement stats).",
        category="crm",
        is_read_only=True,
        parameters={
            "company_id": ToolParameterSchema(type="integer", description="Company ID"),
            "company_name": ToolParameterSchema(type="string", description="Company name (partial match)"),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            cid = params.get("company_id")
            cname = params.get("company_name")
            if not cid and not cname:
                return ToolResult(
                    success=False,
                    message="Provide either company_id or company_name.",
                    error="MISSING_FILTER",
                )

            stmt = select(Company).where(Company.is_deleted == False)
            if cid is not None:
                stmt = stmt.where(Company.id == int(cid))
            elif cname:
                stmt = stmt.where(Company.name.ilike(f"%{cname.strip()}%"))

            comp = (await db.execute(stmt.limit(1))).scalar_one_or_none()
            if not comp:
                return ToolResult(success=True, message="Company not found.", data={"company": None})

            contacts = (
                await db.execute(
                    select(Contact)
                    .where(and_(Contact.company_id == comp.id, Contact.is_deleted == False))
                    .limit(20)
                )
            ).scalars().all()

            leads = (
                await db.execute(
                    select(Lead).where(and_(Lead.company_id == comp.id, Lead.is_deleted == False)).limit(20)
                )
            ).scalars().all()

            deals = (
                await db.execute(
                    select(Deal).where(and_(Deal.company_id == comp.id, Deal.is_deleted == False)).limit(20)
                )
            ).scalars().all()

            job_roles = (
                await db.execute(
                    select(JobRole).where(and_(JobRole.company_id == comp.id, JobRole.is_deleted == False)).limit(20)
                )
            ).scalars().all()

            return ToolResult(
                success=True,
                message=f"Overview for '{comp.name}': {len(contacts)} contacts, {len(job_roles)} job roles, {len(deals)} deals.",
                data={
                    "company": {
                        "id": comp.id,
                        "name": comp.name,
                        "industry": comp.industry,
                        "status": str(comp.status.value if hasattr(comp.status, "value") else comp.status),
                        "website": comp.website,
                        "address": comp.address,
                    },
                    "contacts": [
                        {"id": c.id, "name": f"{c.first_name} {c.last_name}".strip(), "email": c.email, "mobile": c.mobile}
                        for c in contacts
                    ],
                    "leads": [
                        {
                            "id": l.id,
                            "title": l.title,
                            "status": str(l.lead_status.value if hasattr(l.lead_status, "value") else l.lead_status),
                        }
                        for l in leads
                    ],
                    "deals": [
                        {
                            "id": d.id,
                            "title": d.title,
                            "stage": str(d.deal_stage.value if hasattr(d.deal_stage, "value") else d.deal_stage),
                            "value": float(d.deal_value) if d.deal_value else 0.0,
                        }
                        for d in deals
                    ],
                    "job_roles": [
                        {
                            "id": jr.id,
                            "title": jr.title,
                            "status": str(jr.status.value if hasattr(jr.status, "value") else jr.status),
                            "vacancies": jr.no_of_vacancies,
                        }
                        for jr in job_roles
                    ],
                },
            )
        except Exception as e:
            logger.exception("Error in get_company_overview")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── 7. Operations: Leave Summary & Tickets ──────────────────────────────────

class GetLeaveSummaryTool(BaseTool):
    definition = ToolDefinition(
        name="get_leave_summary",
        description="Get staff leave application counts and recent leave requests by status.",
        category="hr",
        is_read_only=True,
        parameters={
            "status": ToolParameterSchema(
                type="string",
                description="Optional status filter ('pending', 'approved', 'rejected', 'cancelled')",
            ),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            status_filter = params.get("status")

            agg_rows = (
                await db.execute(
                    select(DSRLeaveApplication.status, func.count(DSRLeaveApplication.id))
                    .where(DSRLeaveApplication.is_deleted == False)
                    .group_by(DSRLeaveApplication.status)
                )
            ).all()
            status_counts = {
                str(r[0].value if hasattr(r[0], "value") else r[0]): r[1] for r in agg_rows
            }

            stmt = (
                select(DSRLeaveApplication, User.full_name, User.email)
                .join(User, User.id == DSRLeaveApplication.user_id)
                .where(DSRLeaveApplication.is_deleted == False)
            )
            if status_filter:
                stmt = stmt.where(DSRLeaveApplication.status == status_filter.strip().lower())

            rows = (await db.execute(stmt.order_by(DSRLeaveApplication.start_date.desc()).limit(limit))).all()
            items = [
                {
                    "id": lv.id,
                    "user_name": uname,
                    "user_email": uemail,
                    "leave_type": lv.leave_type,
                    "start_date": str(lv.start_date),
                    "end_date": str(lv.end_date),
                    "status": str(lv.status.value if hasattr(lv.status, "value") else lv.status),
                    "reason": lv.reason,
                }
                for lv, uname, uemail in rows
            ]

            return ToolResult(
                success=True,
                message=f"Leave applications: {sum(status_counts.values())} total.",
                data={
                    "total_count": sum(status_counts.values()),
                    "status_counts": status_counts,
                    "leaves": items,
                },
            )
        except Exception as e:
            logger.exception("Error in get_leave_summary")
            return ToolResult(success=False, message=str(e), error=str(e))


class ListTicketsTool(BaseTool):
    definition = ToolDefinition(
        name="list_tickets",
        description="List support/system tickets and summary counts by status and priority.",
        category="hr",
        is_read_only=True,
        parameters={
            "status": ToolParameterSchema(
                type="string",
                description="Optional status ('open', 'in_progress', 'resolved', 'closed')",
            ),
            "priority": ToolParameterSchema(
                type="string",
                description="Optional priority ('low', 'medium', 'high', 'urgent')",
            ),
            "limit": ToolParameterSchema(type="integer", description="Max records (default 25, max 50)", default=25),
        },
        required_parameters=[],
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession", user: "User") -> ToolResult:
        try:
            limit = _cap_limit(params.get("limit"), 25)
            status_filter = params.get("status")
            priority_filter = params.get("priority")

            agg_rows = (
                await db.execute(
                    select(Ticket.status, func.count(Ticket.id))
                    .where(Ticket.is_deleted == False)
                    .group_by(Ticket.status)
                )
            ).all()
            status_counts = {
                str(r[0].value if hasattr(r[0], "value") else r[0]): r[1] for r in agg_rows
            }

            stmt = (
                select(Ticket, User.full_name, User.email)
                .join(User, User.id == Ticket.user_id)
                .where(Ticket.is_deleted == False)
            )
            if status_filter:
                stmt = stmt.where(Ticket.status == status_filter.strip().lower())
            if priority_filter:
                stmt = stmt.where(Ticket.priority == priority_filter.strip().lower())

            rows = (await db.execute(stmt.order_by(Ticket.id.desc()).limit(limit))).all()
            items = [
                {
                    "id": t.id,
                    "ticket_number": t.ticket_number,
                    "title": t.title,
                    "status": str(t.status.value if hasattr(t.status, "value") else t.status),
                    "priority": str(t.priority.value if hasattr(t.priority, "value") else t.priority),
                    "category": str(t.category.value if hasattr(t.category, "value") else t.category),
                    "created_by": uname,
                    "created_by_email": uemail,
                    "created_at": str(t.created_at),
                }
                for t, uname, uemail in rows
            ]

            return ToolResult(
                success=True,
                message=f"Tickets: {sum(status_counts.values())} total.",
                data={
                    "total_count": sum(status_counts.values()),
                    "status_counts": status_counts,
                    "tickets": items,
                },
            )
        except Exception as e:
            logger.exception("Error in list_tickets")
            return ToolResult(success=False, message=str(e), error=str(e))


# ── Registration ─────────────────────────────────────────────────────────────

registry.register(GetMISDashboardTool())
registry.register(GetCandidateProfileTool())
registry.register(GetScreeningFunnelTool())
registry.register(ListTrainingBatchesTool())
registry.register(GetBatchAttendanceTool())
registry.register(GetMockInterviewResultsTool())
registry.register(ListJobRolesTool())
registry.register(GetJobRolePipelineTool())
registry.register(GetInterviewsAndOffersTool())
registry.register(GetPlacementReportTool())
registry.register(ListCompaniesTool())
registry.register(GetCompanyOverviewTool())
registry.register(GetLeaveSummaryTool())
registry.register(ListTicketsTool())

