"""Training Extension Service"""

from typing import List, Any
from datetime import date
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.candidate import Candidate
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.repositories.training_attendance_repository import TrainingAttendanceRepository
from app.repositories.training_assignment_repository import TrainingAssignmentRepository
from app.repositories.training_mock_interview_repository import TrainingMockInterviewRepository
from app.repositories.training_batch_event_repository import TrainingBatchEventRepository
from app.schemas.training_attendance import TrainingAttendanceCreate, TrainingAttendanceUpdate
from app.schemas.training_assignment import TrainingAssignmentCreate, TrainingAssignmentUpdate
from app.schemas.training_mock_interview import TrainingMockInterviewCreate, TrainingMockInterviewUpdate
from app.schemas.training_batch_event import TrainingBatchEventCreate, TrainingBatchEventUpdate


class TrainingExtensionService:
    """Service for training attendance, assignments, and mock interviews"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attendance_repo = TrainingAttendanceRepository(db)
        self.assignment_repo = TrainingAssignmentRepository(db)
        self.mock_interview_repo = TrainingMockInterviewRepository(db)
        self.event_repo = TrainingBatchEventRepository(db)

    # Attendance
    async def get_attendance(self, batch_id: int, start_date: date = None, end_date: date = None):
        query = select(self.attendance_repo.model).options(
            selectinload(self.attendance_repo.model.batch),
            selectinload(self.attendance_repo.model.period)
        ).where(
            self.attendance_repo.model.batch_id == batch_id,
            self.attendance_repo.model.is_deleted == False
        )
        if start_date:
            query = query.where(self.attendance_repo.model.date >= start_date)
        if end_date:
            query = query.where(self.attendance_repo.model.date <= end_date)
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_attendance_by_date(self, batch_id: int, attendance_date: date):
        """Get all attendance records for a specific batch and date"""
        query = select(self.attendance_repo.model).options(
            selectinload(self.attendance_repo.model.batch),
            selectinload(self.attendance_repo.model.period)
        ).where(
            self.attendance_repo.model.batch_id == batch_id,
            self.attendance_repo.model.date == attendance_date,
            self.attendance_repo.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def validate_attendance_marking(self, candidate_id: int, batch_id: int) -> bool:
        """Validate if attendance can be marked for a candidate"""
        # Check if candidate is dropped out
        query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.batch_id == batch_id,
            TrainingCandidateAllocation.candidate_id == candidate_id,
            TrainingCandidateAllocation.is_deleted == False
        )
        allocation = (await self.db.execute(query)).scalar_one_or_none()
        
        if not allocation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Candidate allocation not found for this batch"
            )
        
        if allocation.is_dropout:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot mark attendance for dropped out candidates"
            )
        
        return True

    async def get_attendance_by_candidate(self, public_id: UUID):
        query = select(self.attendance_repo.model).join(Candidate).options(
            selectinload(self.attendance_repo.model.batch),
            selectinload(self.attendance_repo.model.period)
        ).where(
            Candidate.public_id == public_id,
            self.attendance_repo.model.is_deleted == False
        ).order_by(self.attendance_repo.model.date.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_bulk_attendance(self, attendance_list: List[TrainingAttendanceCreate]):
        records = []
        for att in attendance_list:
            # Validate attendance marking (dropout check)
            await self.validate_attendance_marking(att.candidate_id, att.batch_id)
            
            # Check if record exists (now includes period_id for uniqueness)
            query = select(self.attendance_repo.model).where(
                self.attendance_repo.model.batch_id == att.batch_id,
                self.attendance_repo.model.candidate_id == att.candidate_id,
                self.attendance_repo.model.date == att.date,
                self.attendance_repo.model.is_deleted == False
            )
            
            # If period_id is provided, include it in the uniqueness check
            if att.period_id is not None:
                query = query.where(self.attendance_repo.model.period_id == att.period_id)
            else:
                query = query.where(self.attendance_repo.model.period_id.is_(None))
            
            existing = (await self.db.execute(query)).scalar_one_or_none()
            if existing:
                record = await self.attendance_repo.update(
                    existing.id, 
                    att.model_dump(exclude={"batch_id", "candidate_id", "date", "period_id"})
                )
            else:
                record = await self.attendance_repo.create(att.model_dump())
            records.append(record)
        
        # Re-fetch with batch and period to avoid session error during serialization
        ids = [r.id for r in records]
        query = select(self.attendance_repo.model).options(
            selectinload(self.attendance_repo.model.batch),
            selectinload(self.attendance_repo.model.period)
        ).where(self.attendance_repo.model.id.in_(ids))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_attendance(self, attendance_id: int, attendance_in: TrainingAttendanceUpdate):
        """Update a single attendance record"""
        record = await self.attendance_repo.update(attendance_id, attendance_in.model_dump(exclude_unset=True))
        if not record:
            return None
            
        # Re-fetch with batch and period
        query = select(self.attendance_repo.model).options(
            selectinload(self.attendance_repo.model.batch),
            selectinload(self.attendance_repo.model.period)
        ).where(self.attendance_repo.model.id == attendance_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def delete_attendance(self, attendance_id: int):
        """Delete a single attendance record"""
        return await self.attendance_repo.delete(attendance_id)

    # Assignments
    async def get_assignments(self, batch_id: int):
        query = select(self.assignment_repo.model).options(
            selectinload(self.assignment_repo.model.batch)
        ).where(
            self.assignment_repo.model.batch_id == batch_id,
            self.assignment_repo.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_assignments_by_candidate(self, public_id: UUID):
        query = select(self.assignment_repo.model).join(Candidate).options(
            selectinload(self.assignment_repo.model.batch)
        ).where(
            Candidate.public_id == public_id,
            self.assignment_repo.model.is_deleted == False
        ).order_by(self.assignment_repo.model.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_assignment(self, assignment_in: TrainingAssignmentCreate):
        record = await self.assignment_repo.create(assignment_in.model_dump())
        # Re-fetch with batch
        query = select(self.assignment_repo.model).options(
            selectinload(self.assignment_repo.model.batch)
        ).where(self.assignment_repo.model.id == record.id)
        return (await self.db.execute(query)).scalar_one()

    async def update_bulk_assignments(self, assignments_in: List[TrainingAssignmentCreate]):
        records = []
        for ass in assignments_in:
            # Check if record exists for this candidate/batch/date/name
            query = select(self.assignment_repo.model).where(
                self.assignment_repo.model.batch_id == ass.batch_id,
                self.assignment_repo.model.candidate_id == ass.candidate_id,
                self.assignment_repo.model.assignment_name == ass.assignment_name,
                self.assignment_repo.model.is_deleted == False
            )
            # Auto-calculate marks_obtained if course_marks is provided
            if ass.course_marks:
                ass.marks_obtained = sum(ass.course_marks.values())

            existing = (await self.db.execute(query)).scalar_one_or_none()
            if existing:
                record = await self.assignment_repo.update(existing.id, ass.model_dump(exclude={"batch_id", "candidate_id", "assignment_name"}))
            else:
                record = await self.assignment_repo.create(ass.model_dump())
            records.append(record)
        
        # Re-fetch with batch
        ids = [r.id for r in records]
        query = select(self.assignment_repo.model).options(
            selectinload(self.assignment_repo.model.batch)
        ).where(self.assignment_repo.model.id.in_(ids))
        result = await self.db.execute(query)
        return result.scalars().all()

    async def delete_assignments_by_name(self, batch_id: int, assignment_name: str):
        """Delete all assignment records for a given assignment name in a batch"""
        from sqlalchemy import update
        query = update(self.assignment_repo.model).where(
            self.assignment_repo.model.batch_id == batch_id,
            self.assignment_repo.model.assignment_name == assignment_name,
            self.assignment_repo.model.is_deleted == False
        ).values(is_deleted=True)
        await self.db.execute(query)
        await self.db.commit()
        return {"message": f"Assignment '{assignment_name}' deleted successfully", "batch_id": batch_id, "assignment_name": assignment_name}

    async def get_mock_interviews(self, batch_id: int):
        return await self.mock_interview_repo.get_by_batch_id(batch_id)

    async def get_mock_interviews_by_candidate(self, public_id: UUID):
        query = select(self.mock_interview_repo.model).join(Candidate).options(
            selectinload(self.mock_interview_repo.model.batch)
        ).where(
            Candidate.public_id == public_id,
            self.mock_interview_repo.model.is_deleted == False
        ).order_by(self.mock_interview_repo.model.interview_date.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_mock_interview(self, id: int):
        return await self.mock_interview_repo.get(id)

    async def create_mock_interview(self, mock_in: TrainingMockInterviewCreate):
        record = await self.mock_interview_repo.create(mock_in.model_dump())
        # Re-fetch with batch
        query = select(self.mock_interview_repo.model).options(
            selectinload(self.mock_interview_repo.model.batch)
        ).where(self.mock_interview_repo.model.id == record.id)
        return (await self.db.execute(query)).scalar_one()

    async def update_mock_interview(self, id: int, mock_in: TrainingMockInterviewUpdate):
        record = await self.mock_interview_repo.update(id, mock_in.model_dump(exclude_unset=True))
        if not record:
            return None
        # Re-fetch with batch
        query = select(self.mock_interview_repo.model).options(
            selectinload(self.mock_interview_repo.model.batch)
        ).where(self.mock_interview_repo.model.id == record.id)
        return (await self.db.execute(query)).scalar_one()

    async def delete_mock_interview(self, id: int):
        return await self.mock_interview_repo.delete(id)

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

    async def get_batch_event(self, event_id: int):
        return await self.event_repo.get(event_id)

    async def delete_batch_event(self, event_id: int):
        return await self.event_repo.delete(event_id)
