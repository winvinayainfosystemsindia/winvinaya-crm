"""Training Candidate Allocation Service"""

from typing import List, Optional, Any
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.candidate import Candidate
from app.models.candidate_counseling import CandidateCounseling
from app.models.training_batch import TrainingBatch
from app.schemas.training_candidate_allocation import TrainingCandidateAllocationCreate, TrainingCandidateAllocationUpdate
from app.repositories.training_candidate_allocation_repository import TrainingCandidateAllocationRepository
from app.repositories.training_batch_repository import TrainingBatchRepository
from app.repositories.candidate_repository import CandidateRepository


class TrainingCandidateAllocationService:
    """Service for training candidate allocation operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = TrainingCandidateAllocationRepository(db)
        self.batch_repo = TrainingBatchRepository(db)
        self.candidate_repo = CandidateRepository(db)
    
    async def get_allocations_by_batch(
        self, 
        batch_public_id: UUID,
        search: Optional[str] = None,
        is_dropout: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[TrainingCandidateAllocation]:
        """Get all allocations for a batch with search, filter, and sort"""
        # First verify the batch exists
        batch = await self.batch_repo.get_by_public_id(str(batch_public_id))
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")
        
        # Build query
        query = select(TrainingCandidateAllocation).join(Candidate).where(
            TrainingCandidateAllocation.batch_id == batch.id,
            TrainingCandidateAllocation.is_deleted == False
        )
        
        # Apply filters
        if search:
            search_filter = or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
                Candidate.phone.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            
        if is_dropout is not None:
            query = query.where(TrainingCandidateAllocation.is_dropout == is_dropout)
            
        # Apply sorting
        if hasattr(TrainingCandidateAllocation, sort_by):
            sort_attr = getattr(TrainingCandidateAllocation, sort_by)
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_attr))
            else:
                query = query.order_by(sort_attr)
        elif hasattr(Candidate, sort_by):
            sort_attr = getattr(Candidate, sort_by)
            if sort_order.lower() == "desc":
                query = query.order_by(desc(sort_attr))
            else:
                query = query.order_by(sort_attr)
        
        # Eager load relationships
        query = query.options(
            selectinload(TrainingCandidateAllocation.candidate),
            joinedload(TrainingCandidateAllocation.batch)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_allocations_by_candidate(self, candidate_public_id: UUID) -> List[TrainingCandidateAllocation]:
        """Get all allocations for a candidate (current and historical)"""
        # Verify the candidate exists
        candidate = await self.candidate_repo.get_by_public_id(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Build query to get all allocations ordered by creation date (newest first)
        query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.candidate_id == candidate.id,
            TrainingCandidateAllocation.is_deleted == False
        ).options(
            joinedload(TrainingCandidateAllocation.batch)
        ).order_by(desc(TrainingCandidateAllocation.created_at))
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def allocate_candidate(self, allocation_in: TrainingCandidateAllocationCreate) -> TrainingCandidateAllocation:
        """Allocate a candidate to a batch with disability matching logic"""
        # Resolve batch
        if allocation_in.batch_public_id:
            batch = await self.batch_repo.get_by_public_id(str(allocation_in.batch_public_id))
        else:
            batch = await self.batch_repo.get_by_id(allocation_in.batch_id)
            
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")

        # Resolve candidate
        if allocation_in.candidate_public_id:
            candidate = await self.candidate_repo.get_by_public_id(allocation_in.candidate_public_id)
        else:
            candidate = await self.candidate_repo.get_by_id(allocation_in.candidate_id)
            
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
            
        # 1. Business Logic: Disability Type Match
        # Assuming candidate.disability_details is a dict containing 'type' or similar
        candidate_disability = candidate.disability_details.get('disability_type') if candidate.disability_details else None
        
        if batch.disability_type and candidate_disability:
            if batch.disability_type.lower() != candidate_disability.lower():
                raise HTTPException(
                    status_code=400, 
                    detail=f"Disability type mismatch. Batch: {batch.disability_type}, Candidate: {candidate_disability}"
                )
        
        # 2. Business Logic: Must be selected in counseling
        # Need to check counseling status
        query = select(CandidateCounseling).where(CandidateCounseling.candidate_id == candidate.id)
        counseling_result = await self.db.execute(query)
        counseling = counseling_result.scalar_one_or_none()
        
        # Temporarily commenting out until we are sure about the counseling flow integration
        # if not counseling or counseling.status != "selected":
        #    raise HTTPException(status_code=400, detail="Candidate must be 'selected' in counseling to be allocated")
        
        # Check if already allocated to this batch
        query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.batch_id == batch.id,
            TrainingCandidateAllocation.candidate_id == candidate.id,
            TrainingCandidateAllocation.is_deleted == False
        )
        existing_result = await self.db.execute(query)
        if existing_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Candidate already allocated to this batch")
        
        # Check if candidate is in any other active batch
        active_allocations = await self.repository.get_active_allocations_by_candidate(candidate.id)
        if active_allocations:
            raise HTTPException(status_code=400, detail="Candidate is already in an active training batch")
            
        # Create allocation
        data = allocation_in.model_dump(exclude={"batch_public_id", "candidate_public_id"}, exclude_unset=True)
        data["batch_id"] = batch.id
        data["candidate_id"] = candidate.id
        
        if "status" not in data or data["status"] is None:
            data["status"] = {"current": "allocated"}
            
        allocation = await self.repository.create(data)
        
        # Update batch status if it was planned
        if batch.status == "planned":
            await self.batch_repo.update(batch.id, {"status": "running"})
            
        return await self._get_with_relations(allocation.id)

    async def get_eligible_candidates(self, batch_public_id: Optional[UUID] = None) -> List[dict]:
        """Get candidates eligible for training (selected and matching disability)"""
        # If batch_public_id is provided, filter by matching disability type
        target_disability = None
        if batch_public_id:
            batch = await self.batch_repo.get_by_public_id(str(batch_public_id))
            if batch:
                target_disability = batch.disability_type

        # Subquery for active allocations
        # Only consider allocations in active batches (planned, running, extended) as blocking
        active_allocation_exists = select(TrainingCandidateAllocation.id).join(TrainingBatch).where(
            and_(
                TrainingCandidateAllocation.candidate_id == Candidate.id,
                TrainingCandidateAllocation.is_deleted == False,
                TrainingCandidateAllocation.is_dropout == False,
                TrainingBatch.status.in_(['planned', 'running', 'extended'])
            )
        ).exists()

        query = select(Candidate).join(CandidateCounseling).where(
            Candidate.is_deleted == False,
            func.lower(CandidateCounseling.status) == "selected",
            ~active_allocation_exists
        )
        
        # Apply disability matching if batch specified
        if target_disability:
            # Look into JSON column for disability type
            # Use ilike for robust case-insensitive matching
            query = query.where(Candidate.disability_details['disability_type'].as_string().ilike(target_disability))
        
        result = await self.db.execute(query)
        candidates = result.scalars().all()
        
        return [
            {
                "public_id": c.public_id, 
                "name": c.name, 
                "email": c.email, 
                "phone": c.phone,
                "disability_type": c.disability_details.get('disability_type') if c.disability_details else None
            } for c in candidates
        ]
    
    async def update_allocation(self, public_id: UUID, allocation_in: TrainingCandidateAllocationUpdate) -> TrainingCandidateAllocation:
        """Update an allocation (handle dropout logic)"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
            
        update_data = allocation_in.model_dump(exclude_unset=True)
        
        # If being marked as dropout, ensure remark is provided or already exists
        if update_data.get("is_dropout") is True:
            remark = update_data.get("dropout_remark") or allocation.dropout_remark
            if not remark:
                 raise HTTPException(status_code=400, detail="Dropout remark is required when marking as dropout")
            
            # Update status as well
            if "status" not in update_data:
                update_data["status"] = allocation.status or {}
            update_data["status"]["current"] = "dropout"
        
        await self.repository.update(allocation.id, update_data)
        return await self._get_with_relations(allocation.id)
    
    async def remove_allocation(self, public_id: UUID) -> bool:
        """Soft delete an allocation"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        return await self.repository.delete(allocation.id)

    async def _get_with_relations(self, allocation_id: int) -> TrainingCandidateAllocation:
        """Helper for loading full relations"""
        query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.id == allocation_id
        ).options(
            selectinload(TrainingCandidateAllocation.candidate),
            joinedload(TrainingCandidateAllocation.batch)
        )
        result = await self.db.execute(query)
        return result.scalar_one()
