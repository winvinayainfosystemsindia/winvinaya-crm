"""Candidate Allocation Service"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_allocation import CandidateAllocation
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
        """Get all allocations for a batch"""
        batch = await self.batch_repo.get_by_public_id(str(batch_public_id))
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")
        return await self.repository.get_by_batch(batch.id)
    
    async def allocate_candidate(self, allocation_in: CandidateAllocationCreate) -> CandidateAllocation:
        """Allocate a candidate to a batch"""
        # Verify batch exists
        if not await self.batch_repo.exists(allocation_in.batch_id):
            raise HTTPException(status_code=404, detail="Training batch not found")
        
        # Verify candidate exists
        if not await self.candidate_repo.exists(allocation_in.candidate_id):
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check if already allocated to this batch
        existing = await self.repository.get_by_batch(allocation_in.batch_id)
        if any(a.candidate_id == allocation_in.candidate_id for a in existing):
            raise HTTPException(status_code=400, detail="Candidate already allocated to this batch")
            
        return await self.repository.create(allocation_in.model_dump())
    
    async def update_allocation(self, public_id: UUID, allocation_in: CandidateAllocationUpdate) -> CandidateAllocation:
        """Update an allocation"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
            
        update_data = allocation_in.model_dump(exclude_unset=True)
        return await self.repository.update(allocation.id, update_data)
    
    async def remove_allocation(self, public_id: UUID) -> bool:
        """Remove a candidate from a batch (delete allocation)"""
        allocation = await self.repository.get_by_public_id(str(public_id))
        if not allocation:
            raise HTTPException(status_code=404, detail="Allocation not found")
        return await self.repository.delete(allocation.id)
