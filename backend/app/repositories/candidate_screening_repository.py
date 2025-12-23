"""Candidate Screening Repository"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_screening import CandidateScreening
from app.repositories.base import BaseRepository


class CandidateScreeningRepository(BaseRepository[CandidateScreening]):
    """Repository for CandidateScreening model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(CandidateScreening, db)
    
    async def get_by_candidate_id(self, candidate_id: int) -> Optional[CandidateScreening]:
        """Get screening by candidate_id"""
        result = await self.db.execute(
            select(CandidateScreening).where(CandidateScreening.candidate_id == candidate_id)
        )
        return result.scalars().first()
