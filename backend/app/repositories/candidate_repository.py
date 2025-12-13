"""Candidate Repository"""

from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate import Candidate
from app.models.candidate_profile import CandidateProfile
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
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
    
    async def get_by_public_id(self, public_id: UUID) -> Optional[Candidate]:
        """Get candidate by public_id (UUID) without relationships"""
        result = await self.db.execute(
            select(Candidate).where(Candidate.public_id == public_id)
        )
        return result.scalars().first()
    
    async def get_by_public_id_with_details(self, public_id: UUID) -> Optional[Candidate]:
        """Get candidate by public_id with all related data (profile, documents, counseling)"""
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.public_id == public_id)
            .options(
                joinedload(Candidate.profile),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling)
            )
        )
        return result.scalars().first()

    async def get_stats(self) -> dict:
        """Get candidate statistics"""
        from sqlalchemy import func
        from datetime import datetime, time, timedelta
        
        # Helper to execute count query
        async def get_count(filter_expr=None):
            stmt = select(func.count(Candidate.id))
            if filter_expr is not None:
                stmt = stmt.where(filter_expr)
            result = await self.db.execute(stmt)
            return result.scalar() or 0

        async def get_weekly_stats():
            # Get stats for last 7 days
            today = datetime.now().date()
            stats = []
            # Loop for last 7 days including today (or 6 days + today)
            for i in range(6, -1, -1):
                day = today - timedelta(days=i)
                start = datetime.combine(day, time.min)
                end = datetime.combine(day, time.max)
                count = await get_count((Candidate.created_at >= start) & (Candidate.created_at <= end))
                stats.append(count)
            return stats

        total = await get_count()
        male = await get_count(func.lower(Candidate.gender) == 'male')
        female = await get_count(func.lower(Candidate.gender) == 'female')
        
        # All others that are not male/female (case insensitive)
        others = total - (male + female)
        
        # Candidates registered today
        today_start = datetime.combine(datetime.now().date(), time.min)
        today = await get_count(Candidate.created_at >= today_start)
        
        weekly = await get_weekly_stats()
        
        return {
            "total": total,
            "male": male,
            "female": female,
            "others": others,
            "today": today,
            "weekly": weekly
        }

