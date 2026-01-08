"""Training Mock Interview Repository"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_mock_interview import TrainingMockInterview
from app.repositories.base import BaseRepository


class TrainingMockInterviewRepository(BaseRepository[TrainingMockInterview]):
    """Repository for TrainingMockInterview CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingMockInterview, db)
