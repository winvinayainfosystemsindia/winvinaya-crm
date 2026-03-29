from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.placement_mapping import PlacementMapping
from app.repositories.base import BaseRepository


class PlacementMappingRepository(BaseRepository[PlacementMapping]):
    def __init__(self, db: AsyncSession):
        from app.models.job_role import JobRole
        super().__init__(PlacementMapping, db)
        self.JobRole = JobRole

    async def get_by_candidate_and_job_role(
        self, candidate_id: int, job_role_id: int
    ) -> Optional[PlacementMapping]:
        stmt = select(self.model).where(
            and_(
                self.model.candidate_id == candidate_id,
                self.model.job_role_id == job_role_id,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_job_role_active(self, job_role_id: int) -> List[PlacementMapping]:
        stmt = (
            select(self.model)
            .where(
                and_(
                    self.model.job_role_id == job_role_id,
                    self.model.is_active == True
                )
            )
            .options(selectinload(self.model.candidate))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_candidate_active(self, candidate_id: int) -> List[PlacementMapping]:
        stmt = (
            select(self.model)
            .where(
                and_(
                    self.model.candidate_id == candidate_id,
                    self.model.is_active == True
                )
            )
            .options(
                selectinload(self.model.job_role).selectinload(self.JobRole.company),
                selectinload(self.model.mapped_by)
            )
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
    
    async def update_status(self, id: int, status: str) -> Optional[PlacementMapping]:
        mapping = await self.get(id)
        if mapping:
            mapping.status = status
            await self.db.commit()
            await self.db.refresh(mapping)
        return mapping
