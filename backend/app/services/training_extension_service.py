"""Training Extension Service"""

from typing import List, Any
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.training_attendance_repository import TrainingAttendanceRepository
from app.repositories.training_assessment_repository import TrainingAssessmentRepository
from app.repositories.training_mock_interview_repository import TrainingMockInterviewRepository
from app.repositories.training_batch_event_repository import TrainingBatchEventRepository
from app.schemas.training_attendance import TrainingAttendanceCreate, TrainingAttendanceUpdate
from app.schemas.training_assessment import TrainingAssessmentCreate, TrainingAssessmentUpdate
from app.schemas.training_mock_interview import TrainingMockInterviewCreate, TrainingMockInterviewUpdate
from app.schemas.training_batch_event import TrainingBatchEventCreate, TrainingBatchEventUpdate


class TrainingExtensionService:
    """Service for training attendance, assessments, and mock interviews"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attendance_repo = TrainingAttendanceRepository(db)
        self.assessment_repo = TrainingAssessmentRepository(db)
        self.mock_interview_repo = TrainingMockInterviewRepository(db)
        self.event_repo = TrainingBatchEventRepository(db)

    # Attendance
    async def get_attendance(self, batch_id: int, start_date: date = None, end_date: date = None):
        query = select(self.attendance_repo.model).where(
            self.attendance_repo.model.batch_id == batch_id,
            self.attendance_repo.model.is_deleted == False
        )
        if start_date:
            query = query.where(self.attendance_repo.model.date >= start_date)
        if end_date:
            query = query.where(self.attendance_repo.model.date <= end_date)
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_bulk_attendance(self, attendance_list: List[TrainingAttendanceCreate]):
        records = []
        for att in attendance_list:
            # Check if record exists
            query = select(self.attendance_repo.model).where(
                self.attendance_repo.model.batch_id == att.batch_id,
                self.attendance_repo.model.candidate_id == att.candidate_id,
                self.attendance_repo.model.date == att.date,
                self.attendance_repo.model.is_deleted == False
            )
            existing = (await self.db.execute(query)).scalar_one_or_none()
            if existing:
                record = await self.attendance_repo.update(existing.id, att.model_dump(exclude={"batch_id", "candidate_id", "date"}))
            else:
                record = await self.attendance_repo.create(att.model_dump())
            records.append(record)
        return records

    # Assessments
    async def get_assessments(self, batch_id: int):
        query = select(self.assessment_repo.model).where(
            self.assessment_repo.model.batch_id == batch_id,
            self.assessment_repo.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_assessment(self, assessment_in: TrainingAssessmentCreate):
        return await self.assessment_repo.create(assessment_in.model_dump())

    # Mock Interviews
    async def get_mock_interviews(self, batch_id: int):
        query = select(self.mock_interview_repo.model).where(
            self.mock_interview_repo.model.batch_id == batch_id,
            self.mock_interview_repo.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_mock_interview(self, mock_in: TrainingMockInterviewCreate):
        return await self.mock_interview_repo.create(mock_in.model_dump())

    # Batch Events (Holidays)
    async def get_batch_events(self, batch_id: int):
        query = select(self.event_repo.model).where(
            self.event_repo.model.batch_id == batch_id,
            self.event_repo.model.is_deleted == False
        ).order_by(self.event_repo.model.date.asc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_batch_event(self, event_in: TrainingBatchEventCreate):
        return await self.event_repo.create(event_in.model_dump())

    async def delete_batch_event(self, event_id: int):
        return await self.event_repo.delete(event_id)
