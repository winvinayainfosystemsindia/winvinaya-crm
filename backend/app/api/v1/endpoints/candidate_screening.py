"""Candidate Screening Endpoints"""

from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_medium
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.candidate_screening import (
    CandidateScreeningCreate,
    CandidateScreeningUpdate,
    CandidateScreeningResponse
)
from app.services.candidate_screening_service import CandidateScreeningService


router = APIRouter(tags=["Candidate Screening"])


@router.post(
    "/candidates/{public_id}/screening",
    response_model=CandidateScreeningResponse,
    status_code=status.HTTP_201_CREATED
)
@rate_limit_medium()
async def create_candidate_screening(
    request: Request,
    public_id: UUID,
    screening_in: CandidateScreeningCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Create screening for a candidate
    """
    service = CandidateScreeningService(db)
    return await service.create_screening(public_id, screening_in)


@router.put(
    "/candidates/{public_id}/screening",
    response_model=CandidateScreeningResponse
)
@rate_limit_medium()
async def update_candidate_screening(
    request: Request,
    public_id: UUID,
    screening_in: CandidateScreeningUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update candidate screening
    """
    service = CandidateScreeningService(db)
    return await service.update_screening(public_id, screening_in)


@router.delete(
    "/candidates/{public_id}/screening",
    status_code=status.HTTP_204_NO_CONTENT
)
@rate_limit_medium()
async def delete_candidate_screening(
    request: Request,
    public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete candidate screening (Admin only)
    """
    service = CandidateScreeningService(db)
    await service.delete_screening(public_id)
    return None
