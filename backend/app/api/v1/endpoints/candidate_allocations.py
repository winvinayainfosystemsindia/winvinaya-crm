"""Candidate Allocation Endpoints"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.candidate_allocation import CandidateAllocationCreate, CandidateAllocationResponse, CandidateAllocationUpdate
from app.services.candidate_allocation_service import CandidateAllocationService
from app.utils.activity_tracker import log_create, log_update, log_delete


router = APIRouter(prefix="/candidate-allocations", tags=["Candidate Allocations"])


@router.post("/", response_model=CandidateAllocationResponse, status_code=status.HTTP_201_CREATED)
async def allocate_candidate(
    request: Request,
    allocation_in: CandidateAllocationCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Allocate a candidate to a training batch (Admin/Sourcing only)
    """
    service = CandidateAllocationService(db)
    allocation = await service.allocate_candidate(allocation_in)
    
    # Log the allocation
    await log_create(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="candidate_allocation",
        resource_id=allocation.id,
        created_object=allocation
    )
    
    return allocation


@router.get("/batch/{batch_public_id}", response_model=List[CandidateAllocationResponse])
async def get_batch_allocations(
    batch_public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all candidate allocations for a specific batch
    """
    service = CandidateAllocationService(db)
    allocations = await service.get_allocations_by_batch(batch_public_id)
    
    # Debug logging (safe - doesn't access relationships)
    print(f"[DEBUG] Found {len(allocations)} allocations for batch {batch_public_id}")
    
    return allocations


@router.get("/eligible", response_model=List[dict])
async def get_eligible_candidates(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SOURCING, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all candidates eligible for training (selected in counseling and not in active training)
    """
    service = CandidateAllocationService(db)
    return await service.get_eligible_candidates()


@router.put("/{public_id}", response_model=CandidateAllocationResponse)
async def update_allocation(
    request: Request,
    public_id: UUID,
    allocation_in: CandidateAllocationUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a candidate allocation (Admin/Sourcing only)
    """
    service = CandidateAllocationService(db)
    
    # Get before state
    allocation = await service.repository.get_by_public_id(str(public_id))
    
    updated_allocation = await service.update_allocation(public_id, allocation_in)
    
    # Log the update
    await log_update(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="candidate_allocation",
        resource_id=updated_allocation.id,
        before=allocation,
        after=updated_allocation
    )
    
    return updated_allocation


@router.delete("/{public_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_allocation(
    request: Request,
    public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.SOURCING])),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a candidate allocation (Admin/Sourcing only)
    """
    service = CandidateAllocationService(db)
    allocation = await service.repository.get_by_public_id(str(public_id))
    
    await service.remove_allocation(public_id)
    
    # Log the deletion
    await log_delete(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="candidate_allocation",
        resource_id=allocation.id
    )
    
    return None
