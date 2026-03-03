"""DSR Project Repository"""

from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dsr_project import DSRProject
from app.repositories.base import BaseRepository


class DSRProjectRepository(BaseRepository[DSRProject]):

    def __init__(self, db: AsyncSession):
        super().__init__(DSRProject, db)

    async def get_by_public_id(self, public_id: UUID) -> Optional[DSRProject]:
        result = await self.db.execute(
            select(DSRProject)
            .where(DSRProject.public_id == public_id)
            .where(DSRProject.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_active_projects(self) -> List[DSRProject]:
        result = await self.db.execute(
            select(DSRProject)
            .where(DSRProject.is_deleted == False)
            .where(DSRProject.is_active == True)
            .order_by(DSRProject.name)
        )
        return list(result.scalars().all())

    async def get_projects_owned_by(self, user_id: int) -> List[DSRProject]:
        result = await self.db.execute(
            select(DSRProject)
            .where(DSRProject.owner_id == user_id)
            .where(DSRProject.is_deleted == False)
            .order_by(DSRProject.name)
        )
        return list(result.scalars().all())

    async def get_multi_paginated(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
        search: Optional[str] = None,
    ) -> Tuple[List[DSRProject], int]:
        query = select(DSRProject).where(DSRProject.is_deleted == False)
        count_query = select(func.count()).select_from(DSRProject).where(DSRProject.is_deleted == False)

        if active_only:
            query = query.where(DSRProject.is_active == True)
            count_query = count_query.where(DSRProject.is_active == True)

        if search:
            query = query.where(DSRProject.name.ilike(f"%{search}%"))
            count_query = count_query.where(DSRProject.name.ilike(f"%{search}%"))

        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(DSRProject.name).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def get_by_name(self, name: str) -> Optional[DSRProject]:
        result = await self.db.execute(
            select(DSRProject)
            .where(DSRProject.name == name)
            .where(DSRProject.is_deleted == False)
        )
        return result.scalar_one_or_none()
