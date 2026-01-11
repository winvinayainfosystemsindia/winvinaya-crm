"""Training Assessment Repository"""

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_assessment import TrainingAssessment
from app.repositories.base import BaseRepository


class TrainingAssessmentRepository(BaseRepository[TrainingAssessment]):
    """Repository for TrainingAssessment CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingAssessment, db)

    async def get_by_batch(self, batch_id: int) -> List[TrainingAssessment]:
        """Get all assessments for a batch"""
        return await self.get_by_fields(batch_id=batch_id)
