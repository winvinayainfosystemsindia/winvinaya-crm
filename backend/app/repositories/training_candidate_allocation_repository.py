"""Candidate Allocation Repository"""

from typing import Optional, List
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.repositories.base import BaseRepository


class TrainingCandidateAllocationRepository(BaseRepository[TrainingCandidateAllocation]):
    """Repository for TrainingCandidateAllocation CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingCandidateAllocation, db)
    
    async def get_by_public_id(self, public_id: str) -> Optional[TrainingCandidateAllocation]:
        """Get an allocation by its public UUID"""
        query = select(self.model).where(
            self.model.public_id == public_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_batch(self, batch_id: int) -> List[TrainingCandidateAllocation]:
        """Get all allocations for a specific batch with expert eager loading"""
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
    
    async def get_by_candidate(self, candidate_id: int) -> List[TrainingCandidateAllocation]:
        """Get all allocations for a specific candidate with batch info"""
        from sqlalchemy.orm import joinedload
        query = select(self.model).options(
            joinedload(self.model.batch)
        ).where(
            self.model.candidate_id == candidate_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_active_allocations_by_candidate(self, candidate_id: int) -> List[TrainingCandidateAllocation]:
        """Expert query: Get active allocations with batch status filtering"""
        from app.models.training_batch import TrainingBatch
        from sqlalchemy.orm import joinedload
        
        query = select(self.model).join(TrainingBatch).options(
            joinedload(self.model.batch)
        ).where(
            self.model.candidate_id == candidate_id,
            self.model.is_deleted == False,
            TrainingBatch.status.in_(["planned", "ongoing"]) # Professional definition of active
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def check_candidate_availability(self, candidate_id: int, start_date, end_date) -> bool:
        """Expert-level check if candidate is already in an active batch during these dates"""
        from app.models.training_batch import TrainingBatch
        
        query = select(self.model).join(TrainingBatch).where(
            self.model.candidate_id == candidate_id,
            self.model.is_deleted == False,
            TrainingBatch.is_deleted == False,
            TrainingBatch.status != "closed",
            or_(
                TrainingBatch.start_date.between(start_date, end_date),
                TrainingBatch.end_date.between(start_date, end_date)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is None
