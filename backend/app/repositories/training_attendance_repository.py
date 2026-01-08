"""Training Attendance Repository"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.training_attendance import TrainingAttendance
from app.repositories.base import BaseRepository


class TrainingAttendanceRepository(BaseRepository[TrainingAttendance]):
    """Repository for TrainingAttendance CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingAttendance, db)
    
    async def get_by_batch_and_date(self, batch_id: int, date):
        """Get attendance for a specific batch and date"""
        query = select(self.model).where(
            self.model.batch_id == batch_id,
            self.model.date == date,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalars().all()
