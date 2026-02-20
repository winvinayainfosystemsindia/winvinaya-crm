"""Screening Assignment API endpoints"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.schemas.candidate_screening_assignment import (
    AssignCandidatesRequest,
    UnassignCandidateRequest,
    BulkAssignResult,
    EligibleScreenerResponse
)
from app.services.candidate_screening_assignment_service import CandidateScreeningAssignmentService

router = APIRouter(prefix="/screening-assignments", tags=["Screening Assignments"])


@router.post("/assign", response_model=BulkAssignResult)
async def assign_candidates(
    request: Request,
    payload: AssignCandidatesRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Assign one or more candidates to a screener.
    Manager/Admin only. Replaces any existing assignment for those candidates.
    """
    service = CandidateScreeningAssignmentService(db)
    assigned_count = await service.assign_candidates(
        candidate_public_ids=payload.candidate_public_ids,
        assigned_to_user_id=payload.assigned_to_user_id,
        assigned_by_user_id=current_user.id
    )
    return BulkAssignResult(
        assigned_count=assigned_count,
        message=f"Successfully assigned {assigned_count} candidate(s)"
    )


@router.post("/unassign", response_model=BulkAssignResult)
async def unassign_candidate(
    request: Request,
    payload: UnassignCandidateRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER])),
    db: AsyncSession = Depends(get_db)
):
    """Remove assignment from a candidate. Manager/Admin only."""
    service = CandidateScreeningAssignmentService(db)
    removed = await service.unassign_candidate(payload.candidate_public_id)
    return BulkAssignResult(
        assigned_count=1 if removed else 0,
        message="Assignment removed" if removed else "No assignment found for this candidate"
    )


@router.get("/eligible-screeners", response_model=List[EligibleScreenerResponse])
async def get_eligible_screeners(
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users eligible to be assigned as screeners (Trainer, Sourcing).
    Manager/Admin only.
    """
    service = CandidateScreeningAssignmentService(db)
    screeners = await service.get_eligible_screeners()
    return [
        EligibleScreenerResponse(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            role=u.role.value
        )
        for u in screeners
    ]
