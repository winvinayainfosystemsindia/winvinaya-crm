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

    async def get_multi(self, skip: int = 0, limit: int = 100, include_deleted: bool = False):
        """Get multiples candidates with counseling loaded for list view"""
        stmt = (
            select(Candidate)
            .options(
                selectinload(Candidate.counseling).selectinload(CandidateCounseling.counselor)
            )
            .offset(skip)
            .limit(limit)
        )
        
        if not include_deleted:
            stmt = stmt.where(Candidate.is_deleted == False) 
            
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_unprofiled(self, skip: int = 0, limit: int = 100):
        """Get candidates without profile records"""
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.profile)
            .where(CandidateProfile.id.is_(None))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_profiled(self, skip: int = 0, limit: int = 100):
        """Get candidates with profile records loaded"""
        stmt = (
            select(Candidate)
            .join(Candidate.profile)
            .options(
                joinedload(Candidate.profile),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().unique().all()


    async def get_stats(self) -> dict:
        """Get candidate statistics"""
        # Lazy imports to avoid circular dependency
        # Lazy imports to avoid circular dependency
        from sqlalchemy import func
        from datetime import datetime, time, timedelta
        from app.models.candidate_counseling import CandidateCounseling
        from app.models.candidate_profile import CandidateProfile
        
        try:
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
            today_count = await get_count(Candidate.created_at >= today_start)
            
            # Profiling stats - count only candidates with formal profile records
            stmt_profiled = select(func.count(CandidateProfile.id))
            result_profiled = await self.db.execute(stmt_profiled)
            profiled = result_profiled.scalar() or 0
            
            not_profiled = total - profiled

            # Counseling stats
            # Normalize status to lowercase for consistent counting
            stmt_counseling = select(func.lower(CandidateCounseling.status), func.count(CandidateCounseling.id)).group_by(func.lower(CandidateCounseling.status))
            result_counseling = await self.db.execute(stmt_counseling)
            counseling_counts = dict(result_counseling.all())
            
            # Get raw counts
            raw_selected = counseling_counts.get('selected', 0)
            raw_rejected = counseling_counts.get('rejected', 0)
            
            # Pending counseling should include:
            # 1. Candidates with explicit 'pending' status
            # 2. Profiled candidates who have NOT started counseling yet
            # So: Pending = Total Profiled - (Selected + Rejected)
            counseling_pending = max(0, profiled - (raw_selected + raw_rejected))
            
            counseling_selected = raw_selected
            counseling_rejected = raw_rejected
            total_counseled = sum(counseling_counts.values())

            weekly = await get_weekly_stats()
            
            return {
                "total": total,
                "male": male,
                "female": female,
                "others": others,
                "today": today_count,
                "weekly": weekly,
                "profiled": profiled,
                "not_profiled": not_profiled,
                "total_counseled": total_counseled,
                "counseling_pending": counseling_pending,
                "counseling_selected": counseling_selected,
                "counseling_rejected": counseling_rejected
            }
        except Exception as e:
            import traceback
            print(f"Error getting stats: {e}")
            print(traceback.format_exc())
            return {
                "total": 0, "male": 0, "female": 0, "others": 0,
                "today": 0, "weekly": [], "profiled": 0, "not_profiled": 0,
                "total_counseled": 0, "counseling_pending": 0,
                "counseling_selected": 0, "counseling_rejected": 0
            }

