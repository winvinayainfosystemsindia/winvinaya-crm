"""Training Batch Service"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_batch import TrainingBatch
from app.schemas.training_batch import TrainingBatchCreate, TrainingBatchUpdate
from app.repositories.training_batch_repository import TrainingBatchRepository


class TrainingBatchService:
    """Service for training batch operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = TrainingBatchRepository(db)
    
    async def get_batches(self, skip: int = 0, limit: int = 100) -> List[TrainingBatch]:
        """Get all training batches"""
        return await self.repository.get_multi(skip=skip, limit=limit)
    
    async def get_batch_by_public_id(self, public_id: UUID) -> Optional[TrainingBatch]:
        """Get a batch by public ID"""
        batch = await self.repository.get_by_public_id(str(public_id))
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")
        return batch
    
    async def create_batch(self, batch_in: TrainingBatchCreate) -> TrainingBatch:
        """Create a new training batch"""
        return await self.repository.create(batch_in.model_dump())
    
    async def update_batch(self, public_id: UUID, batch_in: TrainingBatchUpdate) -> TrainingBatch:
        """Update a training batch"""
        batch = await self.get_batch_by_public_id(public_id)
        update_data = batch_in.model_dump(exclude_unset=True)
        return await self.repository.update(batch.id, update_data)
    
    async def delete_batch(self, public_id: UUID) -> bool:
        """Delete a training batch"""
        batch = await self.get_batch_by_public_id(public_id)
        return await self.repository.delete(batch.id)

    async def get_stats(self) -> dict:
        """Get training batch statistics"""
        batches = await self.repository.get_multi(limit=1000)
        return {
            "total": len(batches),
            "planned": len([b for b in batches if b.status == "planned"]),
            "running": len([b for b in batches if b.status == "running"]),
            "closed": len([b for b in batches if b.status == "closed"])
        }
