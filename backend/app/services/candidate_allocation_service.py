"""Candidate Allocation Service"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_allocation import CandidateAllocation
from app.models.candidate import Candidate
from app.models.candidate_counseling import CandidateCounseling
from app.models.training_batch import TrainingBatch
from app.schemas.candidate_allocation import CandidateAllocationCreate, CandidateAllocationUpdate
from app.repositories.candidate_allocation_repository import CandidateAllocationRepository
from app.repositories.training_batch_repository import TrainingBatchRepository
from app.repositories.candidate_repository import CandidateRepository


class CandidateAllocationService:
    """Service for candidate allocation operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = CandidateAllocationRepository(db)
        self.batch_repo = TrainingBatchRepository(db)
        self.candidate_repo = CandidateRepository(db)
    
    async def get_allocations_by_batch(self, batch_public_id: UUID) -> List[CandidateAllocation]:
        """Get all allocations for a batch with relationships loaded"""
        # First verify the batch exists
        batch = await self.batch_repo.get_by_public_id(str(batch_public_id))
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")
        
        # Use the repository method which uses selectinload correctly for async
        return await self.repository.get_by_batch(batch.id)
    
    async def allocate_candidate(self, allocation_in: CandidateAllocationCreate) -> CandidateAllocation:
        """Allocate a candidate to a batch"""
        # Resolve batch_id if public_id provided
        if allocation_in.batch_public_id:
            batch = await self.batch_repo.get_by_public_id(str(allocation_in.batch_public_id))
            if not batch:
                raise HTTPException(status_code=404, detail="Training batch not found")
            allocation_in.batch_id = batch.id
        else:
            batch = await self.batch_repo.get_by_id(allocation_in.batch_id)
            if not batch:
                raise HTTPException(status_code=404, detail="Training batch not found")

        # Resolve candidate_id if public_id provided
        if allocation_in.candidate_public_id:
            candidate = await self.candidate_repo.get_by_public_id(allocation_in.candidate_public_id)
            if not candidate:
                raise HTTPException(status_code=404, detail="Candidate not found")
            allocation_in.candidate_id = candidate.id
        else:
            candidate = await self.candidate_repo.get_by_id(allocation_in.candidate_id)
            if not candidate:
                raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check if already allocated to this specific batch
        existing = await self.repository.get_by_batch(allocation_in.batch_id)
        if any(a.candidate_id == allocation_in.candidate_id for a in existing):
            raise HTTPException(status_code=400, detail="Candidate already allocated to this batch")
        
        # Check if candidate is in any other active batch
        active_allocations = await self.repository.get_active_allocations_by_candidate(allocation_in.candidate_id)
        if active_allocations:
            raise HTTPException(status_code=400, detail="Candidate is already in an active training batch")
            
        # Create allocation
        data = allocation_in.model_dump(exclude={"batch_public_id", "candidate_public_id"}, exclude_unset=True)
        if "status" not in data or data["status"] is None:
            data["status"] = {"current": "allocated"}
            
        allocation = await self.repository.create(data)
        
        # Update batch status if needed
        if batch.status == "planned":
            await self.batch_repo.update(batch.id, {"status": "running"})
            
        # Return with relationships loaded
        return await self._get_with_relations(allocation.id)

    async def get_eligible_candidates(self) -> List[dict]:
        """Get candidates eligible for training (selected in counseling and not in active training)"""
        from sqlalchemy import and_, not_, exists

        # Subquery to check if candidate has any active allocation
        active_allocation_exists = exists().where(
            and_(
                CandidateAllocation.candidate_id == Candidate.id,
                CandidateAllocation.is_deleted == False,
                CandidateAllocation.batch_id == TrainingBatch.id,
                TrainingBatch.status != "closed"
            )
        )

        query = select(Candidate).join(CandidateCounseling).where(
            Candidate.is_deleted == False,
            CandidateCounseling.status == "selected",
            not_(active_allocation_exists)
        )
        
        result = await self.db.execute(query)
        candidates = result.scalars().all()
        
        return [{"public_id": c.public_id, "name": c.name, "email": c.email, "phone": c.phone} for c in candidates]
    
    async def update_allocation(self, public_id: UUID, allocation_in: CandidateAllocationUpdate) -> CandidateAllocation:
        """Update an allocation and return with relationships"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
            
        update_data = allocation_in.model_dump(exclude_unset=True)
        await self.repository.update(allocation.id, update_data)
        
        # Reload with relationships for response
        return await self._get_with_relations(allocation.id)
    
    async def remove_allocation(self, public_id: UUID) -> bool:
        """Remove a candidate from a batch (delete allocation)"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        return await self.repository.delete(allocation.id)

    async def _get_with_relations(self, allocation_id: int) -> CandidateAllocation:
        """Helper to get allocation with full relationships loaded"""
        from sqlalchemy.orm import selectinload, joinedload
        query = select(CandidateAllocation).where(
            CandidateAllocation.id == allocation_id
        ).options(
            selectinload(CandidateAllocation.candidate),
            joinedload(CandidateAllocation.batch)
        )
        result = await self.db.execute(query)
        obj = result.scalar_one_or_none()
        if not obj:
            raise HTTPException(status_code=404, detail="Allocation not found")
        return obj
