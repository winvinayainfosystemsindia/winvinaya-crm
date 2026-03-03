"""DSR Activity Repository"""

from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dsr_activity import DSRActivity, DSRActivityStatus
from app.repositories.base import BaseRepository


class DSRActivityRepository(BaseRepository[DSRActivity]):

    def __init__(self, db: AsyncSession):
        super().__init__(DSRActivity, db)

    async def get_by_public_id(self, public_id: UUID) -> Optional[DSRActivity]:
        result = await self.db.execute(
            select(DSRActivity)
            .where(DSRActivity.public_id == public_id)
            .where(DSRActivity.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_activities_for_project(
        self,
        project_id: int,
        active_only: bool = False,
    ) -> List[DSRActivity]:
        query = (
            select(DSRActivity)
            .where(DSRActivity.project_id == project_id)
            .where(DSRActivity.is_deleted == False)
        )
        if active_only:
            query = query.where(DSRActivity.is_active == True)
        query = query.order_by(DSRActivity.start_date)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_multi_paginated(
        self,
        skip: int = 0,
        limit: int = 100,
        project_id: Optional[int] = None,
        status: Optional[DSRActivityStatus] = None,
        active_only: bool = False,
        search: Optional[str] = None,
    ) -> Tuple[List[DSRActivity], int]:
        base_filter = DSRActivity.is_deleted == False
        query = select(DSRActivity).where(base_filter)
        count_query = select(func.count()).select_from(DSRActivity).where(base_filter)

        if project_id:
            query = query.where(DSRActivity.project_id == project_id)
            count_query = count_query.where(DSRActivity.project_id == project_id)
        if status:
            query = query.where(DSRActivity.status == status)
            count_query = count_query.where(DSRActivity.status == status)
        if active_only:
            query = query.where(DSRActivity.is_active == True)
            count_query = count_query.where(DSRActivity.is_active == True)
        if search:
            query = query.where(DSRActivity.name.ilike(f"%{search}%"))
            count_query = count_query.where(DSRActivity.name.ilike(f"%{search}%"))

        total = (await self.db.execute(count_query)).scalar_one()
        query = query.order_by(DSRActivity.start_date).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_by_public_ids(self, public_ids: List[UUID]) -> List[DSRActivity]:
        """Batch fetch activities by public_id list — used to enrich DSR entry items"""
        if not public_ids:
            return []
        result = await self.db.execute(
            select(DSRActivity)
            .where(DSRActivity.public_id.in_(public_ids))
            .where(DSRActivity.is_deleted == False)
        )
        return list(result.scalars().all())
