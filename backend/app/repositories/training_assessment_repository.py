"""Training Assessment Repository"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_assessment import TrainingAssessment
from app.repositories.base import BaseRepository


class TrainingAssessmentRepository(BaseRepository[TrainingAssessment]):
    """Repository for TrainingAssessment CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingAssessment, db)
