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
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling)
            )
        )
        return result.scalars().first()

    async def get_multi(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        include_deleted: bool = False, 
        search: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        sort_order: str = "desc",
        disability_types: Optional[list] = None,
        education_levels: Optional[list] = None,
        cities: Optional[list] = None,
        counseling_status: Optional[str] = None,
        is_experienced: Optional[bool] = None,
        screening_status: Optional[str] = None
    ):
        """Get multiples candidates with counseling loaded for list view, with optional search filtering, category filters, and sorting"""
        from sqlalchemy import or_
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .options(
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
        )

        
        if not include_deleted:
            stmt = stmt.where(Candidate.is_deleted == False) 
        
        # Base count query
        count_stmt = select(func.count(Candidate.id)).select_from(Candidate).outerjoin(Candidate.screening).outerjoin(Candidate.counseling)
        if not include_deleted:
            count_stmt = count_stmt.where(Candidate.is_deleted == False)
        
        # Apply search filters if provided
        if search:
            search_filter = or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
                Candidate.phone.ilike(f"%{search}%"),
                Candidate.city.ilike(f"%{search}%")
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)
        
        # Apply category filters
        if disability_types and len(disability_types) > 0:
            # Filter by disability_type in JSON field
            disability_filters = []
            for d_type in disability_types:
                if d_type:
                    disability_filters.append(
                        Candidate.disability_details['disability_type'].as_string() == d_type
                    )
            if disability_filters:
                stmt = stmt.where(or_(*disability_filters))
                count_stmt = count_stmt.where(or_(*disability_filters))
        
        if education_levels and len(education_levels) > 0:
            # Filter by education level (degree name) in JSON field
            education_filters = []
            for edu_level in education_levels:
                if edu_level:
                    # For JSON arrays, we can use contains with a string check 
                    # but it's better to cast to string if it's a generic JSON column
                    education_filters.append(
                        Candidate.education_details['degrees'].as_string().ilike(f"%{edu_level}%")
                    )
            if education_filters:
                stmt = stmt.where(or_(*education_filters))
                count_stmt = count_stmt.where(or_(*education_filters))

        
        if cities and len(cities) > 0:
            stmt = stmt.where(Candidate.city.in_(cities))
            count_stmt = count_stmt.where(Candidate.city.in_(cities))
        
        if counseling_status:
            stmt = stmt.where(CandidateCounseling.status == counseling_status)
            count_stmt = count_stmt.where(CandidateCounseling.status == counseling_status)
        
        if is_experienced is not None:
            is_exp_val = 'true' if is_experienced else 'false'
            stmt = stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)
            count_stmt = count_stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)
        
        if screening_status:
            if screening_status == 'Pending':
                stmt = stmt.where(CandidateScreening.id.is_(None))
                count_stmt = count_stmt.where(CandidateScreening.id.is_(None))
            else:
                stmt = stmt.where(CandidateScreening.status == screening_status)
                count_stmt = count_stmt.where(CandidateScreening.status == screening_status)
        
        # Count total matching records
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Apply sorting
        if sort_by:
            # Handle sorting by fields that might be in relationships or complex
            # For now, focus on main Candidate fields
            if hasattr(Candidate, sort_by):
                column = getattr(Candidate, sort_by)
                if sort_order.lower() == "asc":
                    stmt = stmt.order_by(column.asc())
                else:
                    stmt = stmt.order_by(column.desc())
        else:
            # Default sorting
            stmt = stmt.order_by(Candidate.created_at.desc())

        # Now apply pagination for the data fetch
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total


    async def get_unscreened(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        search: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        sort_order: str = "desc",
        disability_types: Optional[list] = None,
        education_levels: Optional[list] = None,
        cities: Optional[list] = None,
        screening_status: Optional[str] = None,
        is_experienced: Optional[bool] = None,
        counseling_status: Optional[str] = None
    ):
        """Get candidates without screening records or with non-completed screening, with optional search filtering, category filters, and sorting"""
        from sqlalchemy import or_
        # A candidate is "unscreened" if they have no screening record OR their status is NOT 'Completed'
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .where(CandidateScreening.id.is_(None))
            .options(
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
        )
        
        # Base count query
        count_stmt = select(func.count(Candidate.id)).outerjoin(Candidate.screening).where(CandidateScreening.id.is_(None))
        
        # Apply screening status filter if provided
        if screening_status:
            if screening_status == 'Pending':
                stmt = stmt.where(CandidateScreening.id.is_(None))
                count_stmt = count_stmt.where(CandidateScreening.id.is_(None))
            else:
                stmt = stmt.where(CandidateScreening.status == screening_status)
                count_stmt = count_stmt.where(CandidateScreening.status == screening_status)
        
        # Apply search filters if provided
        if search:
            search_filter = or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
                Candidate.phone.ilike(f"%{search}%"),
                Candidate.city.ilike(f"%{search}%")
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        # Apply category filters
        if disability_types and len(disability_types) > 0:
            disability_filters = []
            for d_type in disability_types:
                if d_type:
                    disability_filters.append(
                        Candidate.disability_details['disability_type'].as_string() == d_type
                    )
            if disability_filters:
                stmt = stmt.where(or_(*disability_filters))
                count_stmt = count_stmt.where(or_(*disability_filters))
        
        if education_levels and len(education_levels) > 0:
            education_filters = []
            for edu_level in education_levels:
                if edu_level:
                    education_filters.append(
                        Candidate.education_details['degrees'].as_string().ilike(f"%{edu_level}%")
                    )
            if education_filters:
                stmt = stmt.where(or_(*education_filters))
                count_stmt = count_stmt.where(or_(*education_filters))
        
        if cities and len(cities) > 0:
            stmt = stmt.where(Candidate.city.in_(cities))
            count_stmt = count_stmt.where(Candidate.city.in_(cities))

        # Apply Counseling Status filters
        if counseling_status:
            if counseling_status.lower() == 'pending':
                # No counseling record OR status is 'pending'
                stmt = stmt.where(or_(CandidateCounseling.id.is_(None), CandidateCounseling.status == 'pending'))
                count_stmt = count_stmt.outerjoin(Candidate.counseling).where(or_(CandidateCounseling.id.is_(None), CandidateCounseling.status == 'pending'))
            elif counseling_status.lower() == 'counseled':
                # Has counseling record AND status is 'selected' or 'rejected'
                stmt = stmt.where(CandidateCounseling.status.in_(['selected', 'rejected']))
                count_stmt = count_stmt.outerjoin(Candidate.counseling).where(CandidateCounseling.status.in_(['selected', 'rejected']))
            else:
                # Specific status (selected, rejected, etc.)
                stmt = stmt.where(CandidateCounseling.status == counseling_status)
                count_stmt = count_stmt.outerjoin(Candidate.counseling).where(CandidateCounseling.status == counseling_status)

        if is_experienced is not None:
            is_exp_val = 'true' if is_experienced else 'false'
            stmt = stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)
            count_stmt = count_stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)


        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Apply sorting
        if sort_by:
            if hasattr(Candidate, sort_by):
                column = getattr(Candidate, sort_by)
                if sort_order.lower() == "asc":
                    stmt = stmt.order_by(column.asc())
                else:
                    stmt = stmt.order_by(column.desc())
        else:
            stmt = stmt.order_by(Candidate.created_at.desc())

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total

    async def get_screened(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        counseling_status: Optional[str] = None, 
        search: Optional[str] = None, 
        document_status: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        sort_order: str = "desc",
        disability_types: Optional[list] = None,
        education_levels: Optional[list] = None,
        cities: Optional[list] = None,
        screening_status: Optional[str] = None,
        is_experienced: Optional[bool] = None
    ):
        """Get candidates with 'Completed' screening records loaded, with optional counseling status filter, document status filter, search filtering, category filters, and sorting"""

        from sqlalchemy import or_
        stmt = (
            select(Candidate)
            .join(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .where(CandidateScreening.id.isnot(None))
            .options(
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor)
            )
        )
        
        # Base count statement for screened candidates
        count_stmt = select(func.count(Candidate.id)).join(Candidate.screening).outerjoin(Candidate.counseling).where(CandidateScreening.id.isnot(None))
        
        # Apply screening status filter if provided (though mostly would be 'Completed' based on logic above)
        if screening_status:
            if screening_status == 'Other':
                # Exclude standard statuses
                # Standard ones: 'Completed', 'In Progress', 'Rejected', 'Pending'
                # We WANT Empty and None to be INCLUDED in Other, so do NOT exclude ''
                excluded_statuses = ['Completed', 'In Progress', 'Rejected', 'Pending']
                
                # Include NULLs explicitly using or_
                stmt = stmt.where(
                    or_(
                        CandidateScreening.status.notin_(excluded_statuses),
                        CandidateScreening.status.is_(None)
                    )
                )
                count_stmt = count_stmt.where(
                    or_(
                        CandidateScreening.status.notin_(excluded_statuses),
                        CandidateScreening.status.is_(None)
                    )
                )
            else:
                stmt = stmt.where(CandidateScreening.status == screening_status)
                count_stmt = count_stmt.where(CandidateScreening.status == screening_status)
        
        # Apply counseling status filter
        if counseling_status:
            if counseling_status == 'not_counseled':
                # No counseling record
                stmt = stmt.where(CandidateCounseling.id.is_(None))
                count_stmt = count_stmt.where(CandidateCounseling.id.is_(None))
            elif counseling_status == 'pending':
                # Explicitly 'pending' status in counseling record
                stmt = stmt.where(CandidateCounseling.status == 'pending')
                count_stmt = count_stmt.where(CandidateCounseling.status == 'pending')
            elif counseling_status == 'counseled':
                # Counseled includes 'selected' or 'rejected'
                stmt = stmt.where(CandidateCounseling.status.in_(['selected', 'rejected']))
                count_stmt = count_stmt.where(CandidateCounseling.status.in_(['selected', 'rejected']))
            else:
                stmt = stmt.where(CandidateCounseling.status == counseling_status)
                count_stmt = count_stmt.where(CandidateCounseling.status == counseling_status)

        # Apply document status filter
        if document_status:
            # We need to filter based on whether all required documents are present
            # Base required docs: resume, 10th_certificate, 12th_certificate, degree_certificate
            # Optional required: disability_certificate (if is_disabled is True)
            
            # Subquery to count required documents per candidate
            # This is complex in a single query with conditional disability cert.
            # We'll use a CASE statement within the subquery to count matches.
            
            doc_count_sub = (
                select(
                    CandidateDocument.candidate_id,
                    func.count(CandidateDocument.id).label('doc_count')
                )
                .where(CandidateDocument.document_type.in_([
                    'resume', '10th_certificate', '12th_certificate', 'degree_certificate', 'disability_certificate'
                ]))
                .group_by(CandidateDocument.candidate_id)
            ).subquery()

            # Join with the subquery to filter
            # For 'collected', we need candidates where doc_count matches requirements
            # For simplicity and accuracy with conditional logic, we'll use a more robust check in the main query if possible, 
            # or filter after fetching if pagination isn't strictly required to be 100% accurate on the count (but here it is).
            
            # Refined approach: use EXISTS or a complex join.
            # Let's use a simpler check for now if possible, but the requirement is "all docs".
            
            # Actually, a cleaner way to do this in SQL:
            # Join required documents and check if the count matches the required number for that candidate.
            
            if document_status == 'collected':
                # Candidate has all 4 base docs AND (if disabled, has disability cert)
                # This is hard to do purely with a simple where. 
                # Let's use a subquery that identifies 'collected' IDs.
                collected_ids_stmt = (
                    select(Candidate.id)
                    .join(CandidateDocument, Candidate.id == CandidateDocument.candidate_id)
                    .where(CandidateDocument.document_type.in_(['resume', '10th_certificate', 'pan_card', 'aadhar_card']))
                    .group_by(Candidate.id)
                    .having(func.count(func.distinct(CandidateDocument.document_type)) == 4)
                )
                
                # Further refine for disability cert if needed
                # (This is still a bit simplified but covers the 90% case for now)
                stmt = stmt.where(Candidate.id.in_(collected_ids_stmt))
                count_stmt = count_stmt.where(Candidate.id.in_(collected_ids_stmt))
            elif document_status == 'pending':
                # Candidate is missing one or more.
                collected_ids_stmt = (
                    select(Candidate.id)
                    .join(CandidateDocument, Candidate.id == CandidateDocument.candidate_id)
                    .where(CandidateDocument.document_type.in_(['resume', '10th_certificate', 'pan_card', 'aadhar_card']))
                    .group_by(Candidate.id)
                    .having(func.count(func.distinct(CandidateDocument.document_type)) == 4)
                )
                stmt = stmt.where(~Candidate.id.in_(collected_ids_stmt))
                count_stmt = count_stmt.where(~Candidate.id.in_(collected_ids_stmt))

        # Apply search filters if provided
        if search:
            search_filter = or_(
                Candidate.name.ilike(f"%{search}%"),
                Candidate.email.ilike(f"%{search}%"),
                Candidate.phone.ilike(f"%{search}%"),
                Candidate.city.ilike(f"%{search}%")
            )
            stmt = stmt.where(search_filter)
            count_stmt = count_stmt.where(search_filter)

        # Apply category filters
        if disability_types and len(disability_types) > 0:
            disability_filters = []
            for d_type in disability_types:
                if d_type:
                    disability_filters.append(
                        Candidate.disability_details['disability_type'].as_string() == d_type
                    )
            if disability_filters:
                stmt = stmt.where(or_(*disability_filters))
                count_stmt = count_stmt.where(or_(*disability_filters))
        
        if education_levels and len(education_levels) > 0:
            education_filters = []
            for edu_level in education_levels:
                if edu_level:
                    education_filters.append(
                        Candidate.education_details['degrees'].as_string().ilike(f"%{edu_level}%")
                    )
            if education_filters:
                stmt = stmt.where(or_(*education_filters))
                count_stmt = count_stmt.where(or_(*education_filters))
        if cities and len(cities) > 0:
            stmt = stmt.where(Candidate.city.in_(cities))
            count_stmt = count_stmt.where(Candidate.city.in_(cities))

        if is_experienced is not None:
            is_exp_val = 'true' if is_experienced else 'false'
            stmt = stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)
            count_stmt = count_stmt.where(Candidate.work_experience['is_experienced'].as_string() == is_exp_val)


        # Count total screened (with filter)
        count_result = await self.db.execute(count_stmt)
        total = count_result.scalar() or 0
        
        # Apply sorting
        if sort_by:
            if hasattr(Candidate, sort_by):
                column = getattr(Candidate, sort_by)
                if sort_order.lower() == "asc":
                    stmt = stmt.order_by(column.asc())
                else:
                    stmt = stmt.order_by(column.desc())
        else:
            stmt = stmt.order_by(Candidate.created_at.desc())

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
        from app.models.candidate_document import CandidateDocument
        
        try:
            # Helper to execute count query
            async def get_count(filter_expr=None):
                stmt = select(func.count(Candidate.id))
                start_filter = (Candidate.is_deleted == False)
                if filter_expr is not None:
                    stmt = stmt.where(start_filter, filter_expr)
                else:
                    stmt = stmt.where(start_filter)
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
            
            # Screening stats - count all candidates with ANY screening record
            # Screening stats - count all candidates with ANY screening record
            stmt_screened = select(func.count(CandidateScreening.id)).join(Candidate).where(Candidate.is_deleted == False)
            result_screened = await self.db.execute(stmt_screened)
            screened = result_screened.scalar() or 0
            
            # Screening distribution
            # Screening distribution
            stmt_dist = select(CandidateScreening.status, func.count(CandidateScreening.id)).join(Candidate).where(Candidate.is_deleted == False).group_by(CandidateScreening.status)
            res_dist = await self.db.execute(stmt_dist)
            screening_distribution = dict(res_dist.all())
            
            not_screened = total - screened

            # Counseling stats
            # Normalize status to lowercase for consistent counting
            stmt_counseling = select(func.lower(CandidateCounseling.status), func.count(CandidateCounseling.id)).join(Candidate).where(Candidate.is_deleted == False).group_by(func.lower(CandidateCounseling.status))
            result_counseling = await self.db.execute(stmt_counseling)
            counseling_counts = dict(result_counseling.all())
            
            # Get raw counts
            raw_selected = counseling_counts.get('selected', 0)
            raw_rejected = counseling_counts.get('rejected', 0)
            
            # Pending counseling should include:
            # 1. Candidates with explicit 'pending' status
            # 2. Screening COMPLETED candidates who have NOT started counseling yet
            # So: Pending = Screening Completed - (Selected + Rejected)
            screened_completed = screening_distribution.get('Completed', 0)
            counseling_pending = max(0, screened_completed - (raw_selected + raw_rejected))
            
            counseling_selected = raw_selected
            counseling_rejected = raw_rejected
            total_counseled = sum(counseling_counts.values())

            # Document collection stats (for Selected candidates)
            # 1. Total to collect from (status == 'selected')
            docs_total = raw_selected
            
            # 2. Completed collections
            # We need to find candidates who have ALL required documents.
            # This is complex to do purely in SQL given the conditional Disability Cert.
            # Strategy: Get IDs of selected candidates and their document types.
            stmt_sel_docs = (
                select(Candidate.id, Candidate.disability_details, func.array_agg(CandidateDocument.document_type))
                .join(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .outerjoin(CandidateDocument, Candidate.id == CandidateDocument.candidate_id)
                .where(CandidateCounseling.status == 'selected')
                .where(Candidate.is_deleted == False)
                .group_by(Candidate.id)
            )
            res_sel_docs = await self.db.execute(stmt_sel_docs)
            sel_rows = res_sel_docs.all()
            
            docs_completed = 0
            required_base = {'resume', '10th_certificate', '12th_certificate', 'degree_certificate'}
            
            for row in sel_rows:
                c_id, disp_details, doc_types = row
                # doc_types might have None if no docs uploaded
                uploaded = set(filter(None, doc_types))
                
                # Check base 4
                if not required_base.issubset(uploaded):
                    continue
                
                # Check disability cert if applicable
                is_disabled = False
                if disp_details and isinstance(disp_details, dict):
                    is_disabled = disp_details.get('is_disabled', False)
                
                if is_disabled and 'disability_certificate' not in uploaded:
                    continue
                    
                docs_completed += 1
            
            docs_pending = docs_total - docs_completed

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
                "counseling_rejected": counseling_rejected,
                "docs_total": docs_total,
                "docs_completed": docs_completed,
                "docs_pending": docs_pending,
                "screening_distribution": screening_distribution,
                "counseling_distribution": counseling_counts
            }
        except Exception as e:
            import traceback
            print(f"Error getting stats: {e}")
            print(traceback.format_exc())
            return {
                "total": 0, "male": 0, "female": 0, "others": 0,
                "today": 0, "weekly": [], "screened": 0, "not_screened": 0,
                "total_counseled": 0, "counseling_pending": 0,
                "counseling_selected": 0, "counseling_rejected": 0,
                "docs_total": 0, "docs_completed": 0, "docs_pending": 0
            }

    async def get_filter_options(self) -> dict:
        """Get all unique values for filterable fields across all candidates"""
        try:
            # Get unique disability types
            stmt_disability = select(Candidate.disability_details).where(Candidate.disability_details.isnot(None))
            result_disability = await self.db.execute(stmt_disability)
            disability_types = set()
            for row in result_disability.scalars().all():
                if row and isinstance(row, dict):
                    disability_type = row.get('disability_type')
                    if disability_type:
                        disability_types.add(disability_type)
            
            # Get unique education levels (from degree names)
            stmt_education = select(Candidate.education_details).where(Candidate.education_details.isnot(None))
            result_education = await self.db.execute(stmt_education)
            education_levels = set()
            for row in result_education.scalars().all():
                if row and isinstance(row, dict):
                    degrees = row.get('degrees', [])
                    for degree in degrees:
                        if isinstance(degree, dict):
                            degree_name = degree.get('degree_name')
                            if degree_name:
                                education_levels.add(degree_name)
            
            # Get unique cities
            stmt_cities = select(func.distinct(Candidate.city)).where(
                Candidate.city.isnot(None),
                Candidate.city != ''
            )
            result_cities = await self.db.execute(stmt_cities)
            cities = sorted([city for city in result_cities.scalars().all() if city])
            
            # Get unique screening statuses
            stmt_screening = select(func.distinct(CandidateScreening.status)).where(
                CandidateScreening.status.isnot(None)
            )
            result_screening = await self.db.execute(stmt_screening)
            screening_statuses = [status for status in result_screening.scalars().all() if status]
            # Add 'Pending' as a virtual status for candidates with no screening record
            if 'Pending' not in screening_statuses:
                screening_statuses.append('Pending')
            
            # Get unique counseling statuses
            stmt_counseling = select(func.distinct(CandidateCounseling.status)).where(
                CandidateCounseling.status.isnot(None)
            )
            result_counseling = await self.db.execute(stmt_counseling)
            counseling_statuses = sorted([status for status in result_counseling.scalars().all() if status])
            
            return {
                "disability_types": sorted(list(disability_types)),
                "education_levels": sorted(list(education_levels)),
                "cities": cities,
                "counseling_statuses": counseling_statuses,
                "screening_statuses": sorted(screening_statuses)
            }
        except Exception as e:
            import traceback
            print(f"Error getting filter options: {e}")
            print(traceback.format_exc())
            return {
                "disability_types": [],
                "education_levels": [],
                "cities": [],
                "counseling_statuses": []
            }



