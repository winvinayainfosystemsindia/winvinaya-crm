from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_medium
from app.api.deps import get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.schemas.placement_mapping import (
    PlacementMapping, 
    PlacementMappingCreate, 
    CandidateMatchResult,
    PlacementMappingInDBBase
)
from app.services.placement_mapping_service import PlacementMappingService
from app.utils.activity_tracker import log_create


router = APIRouter(prefix="/placement/mappings", tags=["Placement Mapping"])


@router.get("/match/{job_role_public_id}", response_model=List[CandidateMatchResult])
@rate_limit_medium()
async def get_matches_for_job_role(
    request: Request,
    job_role_public_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get ranked candidate matches for a specific job role based on skills, qualifications, and disability.
    """
    service = PlacementMappingService(db)
    return await service.get_matches_for_job_role(job_role_public_id)


@router.post("/", response_model=PlacementMappingInDBBase, status_code=status.HTTP_201_CREATED)
@rate_limit_medium()
async def map_candidate(
    request: Request,
    mapping_in: PlacementMappingCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.PLACEMENT])),
    db: AsyncSession = Depends(get_db)
):
    """
    Record a mapping between a candidate and a job role.
    """
    service = PlacementMappingService(db)
    mapping = await service.map_candidate(mapping_in, current_user.id)
    
    # Log the activity
    await log_create(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="placement_mapping",
        resource_id=mapping.id,
        created_object=mapping
    )
    
    return mapping


@router.get("/job-role/{job_role_public_id}", response_model=List[PlacementMapping])
@rate_limit_medium()
async def get_job_role_mappings(
    request: Request,
    job_role_public_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all current mappings for a specific job role.
    """
    service = PlacementMappingService(db)
    return await service.get_mapped_candidates(job_role_public_id)


@router.get("/candidate/{candidate_id}", response_model=List[PlacementMapping])
@rate_limit_medium()
async def get_candidate_mappings(
    request: Request,
    candidate_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all job role mappings for a specific candidate.
    """
    service = PlacementMappingService(db)
    return await service.repository.get_by_candidate(candidate_id)
