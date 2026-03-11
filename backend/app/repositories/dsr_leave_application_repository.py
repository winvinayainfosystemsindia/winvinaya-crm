"""DSR Leave Application Repository"""

from datetime import date
from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dsr_leave_application import DSRLeaveApplication, DSRLeaveStatus
from app.repositories.base import BaseRepository


class DSRLeaveApplicationRepository(BaseRepository[DSRLeaveApplication]):

    def __init__(self, db: AsyncSession):
        super().__init__(DSRLeaveApplication, db)

    async def get_by_public_id(self, public_id: UUID) -> Optional[DSRLeaveApplication]:
        result = await self.db.execute(
            select(DSRLeaveApplication)
            .where(DSRLeaveApplication.public_id == public_id)
            .where(DSRLeaveApplication.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        status: Optional[DSRLeaveStatus] = None,
    ) -> Tuple[List[DSRLeaveApplication], int]:
        base = and_(DSRLeaveApplication.user_id == user_id, DSRLeaveApplication.is_deleted == False)
        if status:
            base = and_(base, DSRLeaveApplication.status == status)
            
        count_query = select(func.count()).select_from(DSRLeaveApplication).where(base)
        query = select(DSRLeaveApplication).where(base).order_by(DSRLeaveApplication.start_date.desc()).offset(skip).limit(limit)
        
        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_all_requests(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[DSRLeaveStatus] = None,
        user_id: Optional[int] = None,
    ) -> Tuple[List[DSRLeaveApplication], int]:
        base = DSRLeaveApplication.is_deleted == False
        if status:
            base = and_(base, DSRLeaveApplication.status == status)
        if user_id:
            base = and_(base, DSRLeaveApplication.user_id == user_id)
            
        count_query = select(func.count()).select_from(DSRLeaveApplication).where(base)
        query = select(DSRLeaveApplication).where(base).order_by(DSRLeaveApplication.start_date.desc()).offset(skip).limit(limit)
        
        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_overlapping_leaves(self, user_id: int, start_date: date, end_date: date) -> List[DSRLeaveApplication]:
        """Check for any approved or pending leaves that overlap with the given date range"""
        query = select(DSRLeaveApplication).where(
            and_(
                DSRLeaveApplication.user_id == user_id,
                DSRLeaveApplication.is_deleted == False,
                DSRLeaveApplication.status.in_([DSRLeaveStatus.PENDING, DSRLeaveStatus.APPROVED]),
                or_(
                    and_(DSRLeaveApplication.start_date <= start_date, DSRLeaveApplication.end_date >= start_date),
                    and_(DSRLeaveApplication.start_date <= end_date, DSRLeaveApplication.end_date >= end_date),
                    and_(DSRLeaveApplication.start_date >= start_date, DSRLeaveApplication.end_date <= end_date)
                )
            )
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_leaves_for_calendar(self, user_id: int, start_date: date, end_date: date) -> List[DSRLeaveApplication]:
        """Get all approved leaves for a user within a specific date range for calendar display"""
        query = select(DSRLeaveApplication).where(
            and_(
                DSRLeaveApplication.user_id == user_id,
                DSRLeaveApplication.is_deleted == False,
                DSRLeaveApplication.status == DSRLeaveStatus.APPROVED,
                DSRLeaveApplication.start_date <= end_date,
                DSRLeaveApplication.end_date >= start_date
            )
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
