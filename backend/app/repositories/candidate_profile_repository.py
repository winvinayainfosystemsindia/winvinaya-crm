"""Candidate Profile Repository"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_profile import CandidateProfile
from app.repositories.base import BaseRepository


class CandidateProfileRepository(BaseRepository[CandidateProfile]):
    """Repository for CandidateProfile model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(CandidateProfile, db)
    
    async def get_by_candidate_id(self, candidate_id: int) -> Optional[CandidateProfile]:
        """Get profile by candidate_id"""
        result = await self.db.execute(
            select(CandidateProfile).where(CandidateProfile.candidate_id == candidate_id)
        )
        return result.scalars().first()
    
    async def get_by_batch_number(self, batch_number: str) -> list[CandidateProfile]:
        """Get all profiles in a batch"""
        result = await self.db.execute(
            select(CandidateProfile).where(CandidateProfile.batch_number == batch_number)
        )
        return result.scalars().all()
    
    async def get_by_training_domain(self, domain: str) -> list[CandidateProfile]:
        """Get all profiles by training domain"""
        result = await self.db.execute(
            select(CandidateProfile).where(CandidateProfile.training_domain == domain)
        )
        return result.scalars().all()
