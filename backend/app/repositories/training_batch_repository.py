"""Training Batch Repository"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_batch import TrainingBatch
from app.repositories.base import BaseRepository


class TrainingBatchRepository(BaseRepository[TrainingBatch]):
    """Repository for TrainingBatch CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingBatch, db)
    
    async def get_by_public_id(self, public_id: str) -> Optional[TrainingBatch]:
        """Get a batch by its public UUID"""
        query = select(self.model).where(
            self.model.public_id == public_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
