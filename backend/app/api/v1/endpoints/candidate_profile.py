"""Candidate Profile Endpoints"""

from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_medium
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.candidate_profile import (
    CandidateProfileCreate,
    CandidateProfileUpdate,
    CandidateProfileResponse
)
from app.services.candidate_profile_service import CandidateProfileService


router = APIRouter(tags=["Candidate Profile"])


@router.post(
    "/candidates/{public_id}/profile",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_201_CREATED
)
@rate_limit_medium()
async def create_candidate_profile(
    request: Request,
    public_id: UUID,
    profile_in: CandidateProfileCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Create profile for a candidate (Trainer only)
    """
    service = CandidateProfileService(db)
    return await service.create_profile(public_id, profile_in)


@router.put(
    "/candidates/{public_id}/profile",
    response_model=CandidateProfileResponse
)
@rate_limit_medium()
async def update_candidate_profile(
    request: Request,
    public_id: UUID,
    profile_in: CandidateProfileUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update candidate profile (Trainer only)
    """
    service = CandidateProfileService(db)
    return await service.update_profile(public_id, profile_in)


@router.delete(
    "/candidates/{public_id}/profile",
    status_code=status.HTTP_204_NO_CONTENT
)
@rate_limit_medium()
async def delete_candidate_profile(
    request: Request,
    public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete candidate profile (Admin only)
    """
    service = CandidateProfileService(db)
    await service.delete_profile(public_id)
    return None
