"""Training Batch Event Repository"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.training_batch_event import TrainingBatchEvent


class TrainingBatchEventRepository(BaseRepository[TrainingBatchEvent]):
    """Repository for TrainingBatchEvent model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingBatchEvent, db)
