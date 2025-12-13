"""Candidate Endpoints"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_medium
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.models.user import User, UserRole
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate, CandidateListResponse, CandidateStats
from app.services.candidate_service import CandidateService


router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
@rate_limit_medium()
async def register_candidate(
    request: Request,
    candidate_in: CandidateCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new candidate (Public access)
    """
    # No auth dependency here - public self-registration
    service = CandidateService(db)
    return await service.create_candidate(candidate_in)


@router.get("/", response_model=List[CandidateListResponse])
@rate_limit_medium()
async def get_candidates(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of candidates (Restricted)
    Returns simplified candidate list without nested relationships.
    """
    service = CandidateService(db)
    return await service.get_candidates(skip=skip, limit=limit)


@router.get("/stats", response_model=CandidateStats)
@rate_limit_medium()
async def get_candidate_stats(
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get candidate statistics (Restricted)
    """
    service = CandidateService(db)
    return await service.get_stats()


@router.get("/{public_id}", response_model=CandidateResponse)
@rate_limit_medium()
async def get_candidate(
    request: Request,
    public_id: UUID,
    with_details: bool = True,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get candidate details by public_id (UUID) (Restricted)
    Set with_details=true to include profile, documents, and counseling data.
    """
    service = CandidateService(db)
    return await service.get_candidate(public_id, with_details=with_details)


@router.put("/{public_id}", response_model=CandidateResponse)
@rate_limit_medium()
async def update_candidate(
    request: Request,
    public_id: UUID,
    candidate_in: CandidateUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update candidate by public_id (UUID) (Admin/Manager only)
    """
    service = CandidateService(db)
    return await service.update_candidate(public_id, candidate_in)


@router.delete("/{public_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit_medium()
async def delete_candidate(
    request: Request,
    public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete candidate by public_id (UUID) (Admin only)
    """
    service = CandidateService(db)
    await service.delete_candidate(public_id)
    return None

