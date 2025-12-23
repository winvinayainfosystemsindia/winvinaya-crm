"""Candidate Repository"""

from typing import Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
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
        """Get candidate by public_id with all related data (screening, documents, counseling)"""
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.public_id == public_id)
            .options(
                joinedload(Candidate.screening),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling)
            )
        )
        return result.scalars().first()

    async def get_multi(self, skip: int = 0, limit: int = 100, include_deleted: bool = False):
        """Get multiples candidates with counseling loaded for list view"""
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.counseling)
            .options(
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
            .offset(skip)
            .limit(limit)
        )
        
        if not include_deleted:
            stmt = stmt.where(Candidate.is_deleted == False) 
        
        # Count total matching records WITHOUT offset/limit
        count_stmt = select(func.count(Candidate.id))
        if not include_deleted:
            count_stmt = count_stmt.where(Candidate.is_deleted == False)
        
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Now apply pagination for the data fetch
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total

    async def get_unscreened(self, skip: int = 0, limit: int = 100):
        """Get candidates without screening records"""
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .where(CandidateScreening.id.is_(None))
            .options(
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
        )
        
        # Count total unscreened
        count_stmt = select(func.count(Candidate.id)).outerjoin(Candidate.screening).where(CandidateScreening.id.is_(None))
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total

    async def get_screened(self, skip: int = 0, limit: int = 100):
        """Get candidates with screening records loaded"""
        stmt = (
            select(Candidate)
            .join(Candidate.screening)
            .options(
                joinedload(Candidate.screening),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
        )
        
        # Count total screened
        count_stmt = select(func.count(Candidate.id)).join(Candidate.screening)
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total


    async def get_stats(self) -> dict:
        """Get candidate statistics"""
        # Lazy imports to avoid circular dependency
        # Lazy imports to avoid circular dependency
        from sqlalchemy import func
        from datetime import datetime, time, timedelta
        from app.models.candidate_counseling import CandidateCounseling
        from app.models.candidate_screening import CandidateScreening
        
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
            
            # Screening stats - count only candidates with formal screening records
            stmt_screened = select(func.count(CandidateScreening.id))
            result_screened = await self.db.execute(stmt_screened)
            screened = result_screened.scalar() or 0
            
            not_screened = total - screened

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
            # 2. Screened candidates who have NOT started counseling yet
            # So: Pending = Total Screened - (Selected + Rejected)
            counseling_pending = max(0, screened - (raw_selected + raw_rejected))
            
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
                "screened": screened,
                "not_screened": not_screened,
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
                "today": 0, "weekly": [], "screened": 0, "not_screened": 0,
                "total_counseled": 0, "counseling_pending": 0,
                "counseling_selected": 0, "counseling_rejected": 0
            }

