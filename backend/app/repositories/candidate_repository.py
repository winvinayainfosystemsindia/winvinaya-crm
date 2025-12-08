"""Candidate Repository"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate import Candidate
from app.repositories.base import BaseRepository


class CandidateRepository(BaseRepository[Candidate]):
    """Repository for Candidate model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Candidate, db)
    
    async def get_by_email(self, email: str) -> Optional[Candidate]:
        """Get candidate by email"""
        result = await self.db.execute(select(Candidate).where(Candidate.email == email))
        return result.scalars().first()
    
    async def get_by_phone(self, phone: str) -> Optional[Candidate]:
        """Get candidate by phone"""
        result = await self.db.execute(select(Candidate).where(Candidate.phone == phone))
        return result.scalars().first()
