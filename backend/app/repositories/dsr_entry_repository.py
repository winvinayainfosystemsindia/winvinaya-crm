"""DSR Entry Repository"""

from datetime import date
from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dsr_entry import DSREntry, DSRStatus
from app.repositories.base import BaseRepository


class DSREntryRepository(BaseRepository[DSREntry]):

    def __init__(self, db: AsyncSession):
        super().__init__(DSREntry, db)

    async def get_by_public_id(self, public_id: UUID) -> Optional[DSREntry]:
        result = await self.db.execute(
            select(DSREntry)
            .where(DSREntry.public_id == public_id)
            .where(DSREntry.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_by_user_and_date(self, user_id: int, report_date: date) -> Optional[DSREntry]:
        """Get any (non-deleted) DSR entry for a specific user + date"""
        result = await self.db.execute(
            select(DSREntry)
            .where(DSREntry.user_id == user_id)
            .where(DSREntry.report_date == report_date)
            .where(DSREntry.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_entries_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status: Optional[DSRStatus] = None,
    ) -> Tuple[List[DSREntry], int]:
        base = and_(DSREntry.user_id == user_id, DSREntry.is_deleted == False)
        query = select(DSREntry).where(base)
        count_query = select(func.count()).select_from(DSREntry).where(base)

        if date_from:
            query = query.where(DSREntry.report_date >= date_from)
            count_query = count_query.where(DSREntry.report_date >= date_from)
        if date_to:
            query = query.where(DSREntry.report_date <= date_to)
            count_query = count_query.where(DSREntry.report_date <= date_to)
        if status:
            query = query.where(DSREntry.status == status)
            count_query = count_query.where(DSREntry.status == status)

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(DSREntry.report_date.desc()).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_all_entries(
        self,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status: Optional[DSRStatus] = None,
    ) -> Tuple[List[DSREntry], int]:
        """Admin view — all entries across all users"""
        base = DSREntry.is_deleted == False
        query = select(DSREntry).where(base)
        count_query = select(func.count()).select_from(DSREntry).where(base)

        if user_id:
            query = query.where(DSREntry.user_id == user_id)
            count_query = count_query.where(DSREntry.user_id == user_id)
        if date_from:
            query = query.where(DSREntry.report_date >= date_from)
            count_query = count_query.where(DSREntry.report_date >= date_from)
        if date_to:
            query = query.where(DSREntry.report_date <= date_to)
            count_query = count_query.where(DSREntry.report_date <= date_to)
        if status:
            query = query.where(DSREntry.status == status)
            count_query = count_query.where(DSREntry.status == status)

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(DSREntry.report_date.desc(), DSREntry.user_id).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_submitted_user_ids_for_date(self, report_date: date) -> List[int]:
        """Returns user_ids that have a SUBMITTED (or APPROVED) DSR for the given date"""
        result = await self.db.execute(
            select(DSREntry.user_id)
            .where(DSREntry.report_date == report_date)
            .where(DSREntry.status.in_([DSRStatus.SUBMITTED, DSRStatus.APPROVED]))
            .where(DSREntry.is_deleted == False)
        )
        return list(result.scalars().all())

    async def get_entries_by_status(
        self,
        status: DSRStatus,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[DSREntry], int]:
        """Get all entries across all users matching a given status, ordered oldest first."""
        base = and_(DSREntry.status == status, DSREntry.is_deleted == False)
        count_query = select(func.count()).select_from(DSREntry).where(base)
        total = (await self.db.execute(count_query)).scalar_one()

        query = (
            select(DSREntry)
            .where(base)
            .order_by(DSREntry.submitted_at.asc().nullsfirst())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def count_by_status_for_user(self, user_id: int) -> dict:
        """Return counts per status for a single user — used for the user dashboard cards."""
        from sqlalchemy import case
        result = await self.db.execute(
            select(
                func.count(DSREntry.id).filter(DSREntry.status == DSRStatus.SUBMITTED).label("pending_approval"),
                func.count(DSREntry.id).filter(
                    and_(DSREntry.status == DSRStatus.DRAFT, DSREntry.admin_notes.isnot(None))
                ).label("action_required"),
                func.count(DSREntry.id).filter(DSREntry.status == DSRStatus.APPROVED).label("approved"),
            )
            .where(DSREntry.user_id == user_id)
            .where(DSREntry.is_deleted == False)
        )
        row = result.first()
        return {
            "pending_approval": row.pending_approval if row else 0,
            "action_required": row.action_required if row else 0,
            "approved": row.approved if row else 0,
        }
