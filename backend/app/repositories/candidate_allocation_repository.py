"""Candidate Allocation Repository"""

from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_allocation import CandidateAllocation
from app.repositories.base import BaseRepository


class CandidateAllocationRepository(BaseRepository[CandidateAllocation]):
    """Repository for CandidateAllocation CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(CandidateAllocation, db)
    
    async def get_by_public_id(self, public_id: str) -> Optional[CandidateAllocation]:
        """Get an allocation by its public UUID"""
        query = select(self.model).where(
            self.model.public_id == public_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_batch(self, batch_id: int) -> List[CandidateAllocation]:
        """Get all allocations for a specific batch"""
        from sqlalchemy.orm import selectinload, joinedload
        query = select(self.model).where(
            self.model.batch_id == batch_id,
            self.model.is_deleted == False
        ).options(
            selectinload(self.model.candidate),
            joinedload(self.model.batch)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_candidate(self, candidate_id: int) -> List[CandidateAllocation]:
        """Get all allocations for a specific candidate"""
        query = select(self.model).where(
            self.model.candidate_id == candidate_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_active_allocations_by_candidate(self, candidate_id: int) -> List[CandidateAllocation]:
        """Get active (non-closed) allocations for a specific candidate"""
        from app.models.training_batch import TrainingBatch
        query = select(self.model).join(TrainingBatch).where(
            self.model.candidate_id == candidate_id,
            self.model.is_deleted == False,
            TrainingBatch.status != "closed"
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
