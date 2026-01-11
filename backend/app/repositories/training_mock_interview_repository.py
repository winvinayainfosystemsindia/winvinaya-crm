"""Training Mock Interview Repository"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_mock_interview import TrainingMockInterview
from app.repositories.base import BaseRepository


class TrainingMockInterviewRepository(BaseRepository[TrainingMockInterview]):
    """Repository for TrainingMockInterview CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingMockInterview, db)

    async def get_by_batch_id(self, batch_id: int, skip: int = 0, limit: int = 100) -> list[TrainingMockInterview]:
        """Get mock interviews by batch ID"""
        from sqlalchemy import select, desc
        query = (
            select(self.model)
            .where(self.model.batch_id == batch_id)
            .where(self.model.is_deleted == False)
            .order_by(desc(self.model.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
