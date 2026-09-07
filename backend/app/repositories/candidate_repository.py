"""Candidate Repository"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, func, Integer, or_, and_, case, cast, Numeric
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_assignment import CandidateAssignment
from app.repositories.base import BaseRepository


MAIN_STATUSES = ['Completed', 'In Progress', 'Rejected', 'Pending']


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
        screening_status: Optional[str] = None,
        disability_percentages: Optional[list] = None,
        screening_reasons: Optional[list] = None,
        gender: Optional[str] = None,
        year_of_passing: Optional[list] = None,
        year_of_experience: Optional[str] = None,
        currently_employed: Optional[bool] = None,
        assigned_to_id: Optional[int] = None,
        extra_filters: Optional[dict] = None,
        registration_type: Optional[str] = None,
        status_of_beneficiary: Optional[list] = None
    ):
        """Get multiples candidates with counseling loaded for list view, with optional search filtering, category filters, and sorting"""
        from sqlalchemy import or_, and_
        stmt = (
            select(Candidate)
            .outerjoin(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .outerjoin(Candidate.assignment)
            .options(
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                selectinload(Candidate.documents),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor),
                joinedload(Candidate.assignment).joinedload(CandidateAssignment.user)
            )
        )

        if assigned_to_id is not None:
            # If assigned_to_id is 0 or -1 (depending on convention), we might want to filter for unassigned
            if assigned_to_id == 0:
                stmt = stmt.where(CandidateAssignment.id.is_(None))
            else:
                stmt = stmt.where(CandidateAssignment.user_id == assigned_to_id)

        
        if not include_deleted:
            stmt = stmt.where(Candidate.is_deleted == False) 
        
        # Base count query
        count_stmt = select(func.count(Candidate.id)).select_from(Candidate).outerjoin(Candidate.screening).outerjoin(Candidate.counseling).outerjoin(Candidate.assignment)
        if not include_deleted:
            count_stmt = count_stmt.where(Candidate.is_deleted == False)
        
        if assigned_to_id is not None:
            if assigned_to_id == 0:
                count_stmt = count_stmt.where(CandidateAssignment.id.is_(None))
            else:
                count_stmt = count_stmt.where(CandidateAssignment.user_id == assigned_to_id)
        
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
        
        if disability_percentages and len(disability_percentages) > 0:
            # Filter by disability_percentage range (min-max)
            # Expecting format "min-max" e.g. "40-80" in the first element if passed as list of strings from query param
            # Or handle if it's passed as a single string argument in the controller (it's passed as list here but likely contains one range string)
            
            percentage_filters = []
            for d_range in disability_percentages:
                if d_range and '-' in d_range:
                    try:
                        min_val, max_val = map(float, d_range.split('-'))
                        # Use Float type for casting
                        from sqlalchemy import Float
                        
                        percentage_filters.append(
                            Candidate.disability_details['disability_percentage'].as_string().cast(Float) >= min_val
                        )
                        percentage_filters.append(
                            Candidate.disability_details['disability_percentage'].as_string().cast(Float) <= max_val
                        )
                    except ValueError:
                        pass # Ignore invalid format

            if percentage_filters:
                # Use AND for range bounds (min AND max)
                # But if multiple ranges were supported (unlikely here), they'd be OR'd.
                # Here we have one range effectively.
                stmt = stmt.where(and_(*percentage_filters))
                count_stmt = count_stmt.where(and_(*percentage_filters))

        if gender:
            stmt = stmt.where(Candidate.gender == gender)
            count_stmt = count_stmt.where(Candidate.gender == gender)

        if registration_type:
            if registration_type.lower() == 'registered':
                reg_filter = or_(
                    Candidate.other.is_(None),
                    Candidate.other['registration_type'].is_(None),
                    Candidate.other['registration_type'].as_string() == '',
                    Candidate.other['registration_type'].as_string().ilike('registered')
                )
            else:
                reg_filter = Candidate.other['registration_type'].as_string().ilike(registration_type)
            
            stmt = stmt.where(reg_filter)
            count_stmt = count_stmt.where(reg_filter)

        if status_of_beneficiary and len(status_of_beneficiary) > 0:
            beneficiary_filters = []
            for b_status in status_of_beneficiary:
                if b_status:
                    beneficiary_filters.append(
                        Candidate.other['status_of_beneficiary'].as_string() == b_status
                    )
            if beneficiary_filters:
                stmt = stmt.where(or_(*beneficiary_filters))
                count_stmt = count_stmt.where(or_(*beneficiary_filters))

        if extra_filters:
            # Handle dynamic JSON filters for screening/counseling 'others' field
            # Values may be comma-separated for multi-select filter selections (e.g. "option1,option2")
            # Storage formats differ by field type:
            #   single_choice  -> stored as plain string: "Yes"
            #   multiple_choice -> stored as JSON array:  ["Yes","No"]
            # Using ilike '%value%' handles BOTH cases without needing to know the field type.
            for key, value in extra_filters.items():
                if not value:
                    continue

                selected_values = [v.strip() for v in str(value).split(',') if v.strip()]
                if not selected_values:
                    continue

                print(f"[DEBUG] Dynamic filter: key={key}, selected_values={selected_values}")

                if key.startswith('screening_others.'):
                    field_name = key.replace('screening_others.', '')
                    conditions = [
                        func.json_extract_path_text(CandidateScreening.others, field_name).ilike(f'%{v}%')
                        for v in selected_values
                    ]
                    filter_clause = or_(*conditions) if len(conditions) > 1 else conditions[0]
                    stmt = stmt.where(filter_clause)
                    count_stmt = count_stmt.where(filter_clause)
                elif key.startswith('counseling_others.'):
                    field_name = key.replace('counseling_others.', '')
                    conditions = [
                        func.json_extract_path_text(CandidateCounseling.others, field_name).ilike(f'%{v}%')
                        for v in selected_values
                    ]
                    filter_clause = or_(*conditions) if len(conditions) > 1 else conditions[0]
                    stmt = stmt.where(filter_clause)
                    count_stmt = count_stmt.where(filter_clause)



        
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
            if is_experienced:
                stmt = stmt.where(Candidate.work_experience['is_experienced'].as_string() == 'true')
                count_stmt = count_stmt.where(Candidate.work_experience['is_experienced'].as_string() == 'true')
            else:
                stmt = stmt.where(or_(
                    Candidate.work_experience['is_experienced'].as_string() == 'false',
                    Candidate.work_experience['is_experienced'].as_string().is_(None),
                    Candidate.work_experience.is_(None)
                ))
                count_stmt = count_stmt.where(or_(
                    Candidate.work_experience['is_experienced'].as_string() == 'false',
                    Candidate.work_experience['is_experienced'].as_string().is_(None),
                    Candidate.work_experience.is_(None)
                ))
        
        if currently_employed is not None:
            if currently_employed:
                stmt = stmt.where(Candidate.work_experience['currently_employed'].as_string() == 'true')
                count_stmt = count_stmt.where(Candidate.work_experience['currently_employed'].as_string() == 'true')
            else:
                stmt = stmt.where(or_(
                    Candidate.work_experience['currently_employed'].as_string() == 'false',
                    Candidate.work_experience['currently_employed'].as_string().is_(None),
                    Candidate.work_experience.is_(None)
                ))
                count_stmt = count_stmt.where(or_(
                    Candidate.work_experience['currently_employed'].as_string() == 'false',
                    Candidate.work_experience['currently_employed'].as_string().is_(None),
                    Candidate.work_experience.is_(None)
                ))

        if year_of_experience:
            print(f"[DEBUG] Experience Filter: {year_of_experience}")
            if '-' in year_of_experience:
                try:
                    min_exp, max_exp = map(float, year_of_experience.split('-'))
                    # Extract numeric part and cast to numeric for range comparison
                    # astext is used for Postgres JSON access. Use NULLIF for safety if regex returns empty.
                    numeric_expr = cast(
                        func.nullif(
                            func.regexp_replace(Candidate.work_experience['year_of_experience'].as_string(), '[^0-9.]', '', 'g'),
                            ''
                        ),
                        Numeric
                    )
                    stmt = stmt.where(numeric_expr >= min_exp).where(numeric_expr <= max_exp)
                    count_stmt = count_stmt.where(numeric_expr >= min_exp).where(numeric_expr <= max_exp)
                except (ValueError, TypeError):
                    stmt = stmt.where(Candidate.work_experience['year_of_experience'].as_string().ilike(f"%{year_of_experience}%"))
                    count_stmt = count_stmt.where(Candidate.work_experience['year_of_experience'].as_string().ilike(f"%{year_of_experience}%"))
            else:
                stmt = stmt.where(Candidate.work_experience['year_of_experience'].as_string().ilike(f"%{year_of_experience}%"))
                count_stmt = count_stmt.where(Candidate.work_experience['year_of_experience'].as_string().ilike(f"%{year_of_experience}%"))

        if year_of_passing and len(year_of_passing) > 0:
            yop_filters = []
            for yop in year_of_passing:
                if yop:
                    yop_filters.append(
                        Candidate.education_details['degrees'].as_string().ilike(f'%"year_of_passing": {yop}%')
                    )
            if yop_filters:
                stmt = stmt.where(or_(*yop_filters))
                count_stmt = count_stmt.where(or_(*yop_filters))
        
        if screening_status:
            if screening_status == 'Pending':
                stmt = stmt.where(CandidateScreening.id.is_(None))
                count_stmt = count_stmt.where(CandidateScreening.id.is_(None))
            elif screening_status == 'In Progress':
                # Treat empty/null as In Progress
                stmt = stmt.where(or_(
                    CandidateScreening.status == 'In Progress',
                    CandidateScreening.status.is_(None),
                    CandidateScreening.status == ''
                ), CandidateScreening.id.isnot(None))
                count_stmt = count_stmt.where(or_(
                    CandidateScreening.status == 'In Progress',
                    CandidateScreening.status.is_(None),
                    CandidateScreening.status == ''
                ), CandidateScreening.id.isnot(None))
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

    async def get_new_candidates_by_date(self, start_date: datetime, end_date: datetime) -> List[Candidate]:
        """Get candidates created within a date range"""
        stmt = (
            select(Candidate)
            .where(Candidate.created_at >= start_date)
            .where(Candidate.created_at <= end_date)
            .where(Candidate.is_deleted == False)
            .order_by(Candidate.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


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
        counseling_status: Optional[str] = None,
        gender: Optional[str] = None,
        assigned_to_id: Optional[int] = None,
        extra_filters: Optional[dict] = None
    ):
        """Get candidates without screening records or with non-completed screening, with optional search filtering, category filters, and sorting"""
        # A candidate is "unscreened" ONLY if they have no screening record at all
        unscreened_filter = CandidateScreening.id.is_(None)

        stmt = (
            select(Candidate)
            .outerjoin(Candidate.screening)
            .outerjoin(Candidate.counseling)
            .outerjoin(Candidate.assignment)
            .where(unscreened_filter)
            .options(
                joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor),
                joinedload(Candidate.assignment).joinedload(CandidateAssignment.user)
            )
        )
        
        if assigned_to_id is not None:
            if assigned_to_id == 0:
                stmt = stmt.where(CandidateAssignment.id.is_(None))
            else:
                stmt = stmt.where(CandidateAssignment.user_id == assigned_to_id)

        # Base count query
        count_stmt = select(func.count(Candidate.id)).outerjoin(Candidate.screening).outerjoin(Candidate.assignment).where(unscreened_filter)

        if assigned_to_id is not None:
            if assigned_to_id == 0:
                count_stmt = count_stmt.where(CandidateAssignment.id.is_(None))
            else:
                count_stmt = count_stmt.where(CandidateAssignment.user_id == assigned_to_id)
        
        # Apply screening status filter if provided
        if screening_status:
            if screening_status == 'Pending':
                stmt = stmt.where(CandidateScreening.id.is_(None))
                count_stmt = count_stmt.where(CandidateScreening.id.is_(None))
            elif screening_status == 'Other':
                # Explicitly 'Other' or something else not in main list
                stmt = stmt.where(or_(
                    CandidateScreening.status.notin_(MAIN_STATUSES),
                    CandidateScreening.status.is_(None),
                    CandidateScreening.status == ''
                ), CandidateScreening.id.isnot(None))
                count_stmt = count_stmt.where(or_(
                    CandidateScreening.status.notin_(MAIN_STATUSES),
                    CandidateScreening.status.is_(None),
                    CandidateScreening.status == ''
                ), CandidateScreening.id.isnot(None))
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
                sel_filter = or_(CandidateCounseling.id.is_(None), func.lower(CandidateCounseling.status).in_(['selected', 'pending', 'counseled', '']))
                stmt = stmt.where(sel_filter)
                count_stmt = count_stmt.outerjoin(Candidate.counseling).where(sel_filter)

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
        limit: Optional[int] = 100, 
        counseling_status: Optional[str] = None, 
        search: Optional[str] = None, 
        document_status: Optional[str] = None, 
        sort_by: Optional[str] = None, 
        sort_order: str = "desc",
        disability_types: Optional[list] = None,
        education_levels: Optional[list] = None,
        cities: Optional[list] = None,
        screening_status: Optional[str] = None,
        is_experienced: Optional[bool] = None,
        gender: Optional[str] = None,
        assigned_to_id: Optional[int] = None,
        extra_filters: Optional[dict] = None
    ):
        """Get candidates with 'Completed' screening records loaded, with optional counseling status filter, document status filter, search filtering, category filters, and sorting"""

        from sqlalchemy import or_
        registered_filter = or_(
            Candidate.other.is_(None),
            Candidate.other['registration_type'].is_(None),
            Candidate.other['registration_type'].as_string() == '',
            Candidate.other['registration_type'].as_string().ilike('registered')
        )
        base_filter = (Candidate.is_deleted == False) & registered_filter
        
        if document_status:
            # Document collection view covers all registered candidates
            stmt = (
                select(Candidate)
                .outerjoin(Candidate.screening)
                .outerjoin(Candidate.counseling)
                .outerjoin(Candidate.assignment)
                .where(base_filter)
                .options(
                    joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                    selectinload(Candidate.documents),
                    joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor),
                    joinedload(Candidate.assignment).joinedload(CandidateAssignment.user)
                )
            )
            count_stmt = select(func.count(Candidate.id)).outerjoin(Candidate.screening).outerjoin(Candidate.counseling).outerjoin(Candidate.assignment).where(base_filter)
        else:
            stmt = (
                select(Candidate)
                .join(Candidate.screening)
                .outerjoin(Candidate.counseling)
                .outerjoin(Candidate.assignment)
                .where(CandidateScreening.id.isnot(None))
                .where(base_filter)
                .options(
                    joinedload(Candidate.screening).joinedload(CandidateScreening.screened_by),
                    selectinload(Candidate.documents),
                    joinedload(Candidate.counseling).joinedload(CandidateCounseling.counselor),
                    joinedload(Candidate.assignment).joinedload(CandidateAssignment.user)
                )
            )
            count_stmt = select(func.count(Candidate.id)).join(Candidate.screening).outerjoin(Candidate.counseling).outerjoin(Candidate.assignment).where(CandidateScreening.id.isnot(None)).where(base_filter)
        
        if assigned_to_id is not None:
            if assigned_to_id == 0:
                stmt = stmt.where(CandidateAssignment.id.is_(None))
            else:
                stmt = stmt.where(CandidateAssignment.user_id == assigned_to_id)
        
        if assigned_to_id is not None:
            if assigned_to_id == 0:
                count_stmt = count_stmt.where(CandidateAssignment.id.is_(None))
            else:
                count_stmt = count_stmt.where(CandidateAssignment.user_id == assigned_to_id)
        
        # Apply screening status filter if provided
        if screening_status:
            if screening_status == 'Other':
                excluded_statuses = MAIN_STATUSES
                
                stmt = stmt.where(
                    and_(
                        CandidateScreening.status.notin_(excluded_statuses),
                        CandidateScreening.status.isnot(None),
                        CandidateScreening.status != ''
                    )
                )
                count_stmt = count_stmt.where(
                    and_(
                        CandidateScreening.status.notin_(excluded_statuses),
                        CandidateScreening.status.isnot(None),
                        CandidateScreening.status != ''
                    )
                )
            elif screening_status == 'In Progress':
                in_progress_filter = or_(
                    CandidateScreening.status == 'In Progress',
                    CandidateScreening.status.is_(None),
                    CandidateScreening.status == ''
                )
                stmt = stmt.where(in_progress_filter)
                count_stmt = count_stmt.where(in_progress_filter)
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
            elif counseling_status == 'selected':
                # Only counseling-selected candidates
                stmt = stmt.where(func.lower(CandidateCounseling.status) == 'selected')
                count_stmt = count_stmt.where(func.lower(CandidateCounseling.status) == 'selected')
            elif counseling_status == 'counseled':
                # Counseled includes 'selected' or 'rejected'
                stmt = stmt.where(CandidateCounseling.status.in_(['selected', 'rejected']))
                count_stmt = count_stmt.where(CandidateCounseling.status.in_(['selected', 'rejected']))
            else:
                sel_filter = or_(CandidateCounseling.id.is_(None), func.lower(CandidateCounseling.status).in_(['selected', 'pending', 'counseled', '']))
                stmt = stmt.where(sel_filter)
                count_stmt = count_stmt.where(sel_filter)

        # Apply document status filter
        if document_status:
            CORE_DOCS = ['resume', '10th_certificate', '12th_certificate', 'degree_certificate',
                         'pan_card', 'aadhar_card', 'passport_photo', 'consent_form']

            doc_counts_sub = (
                select(
                    Candidate.id.label('c_id'),
                    func.count(func.distinct(
                        case(
                            (CandidateDocument.document_type.in_(CORE_DOCS), CandidateDocument.document_type),
                            (and_(
                                CandidateDocument.document_type == 'disability_certificate',
                                Candidate.disability_details['is_disabled'].as_boolean() == True
                            ), CandidateDocument.document_type),
                            else_=None
                        )
                    )).label('uploaded_count'),
                    (len(CORE_DOCS) + case(
                        (Candidate.disability_details['is_disabled'].as_boolean() == True, 1),
                        else_=0
                    )).label('target_count')
                )
                .outerjoin(CandidateDocument, and_(Candidate.id == CandidateDocument.candidate_id, CandidateDocument.is_active == True))
                .where(base_filter)
                .group_by(Candidate.id)
            ).subquery()

            if document_status == 'collected':
                stmt = stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(doc_counts_sub.c.uploaded_count == doc_counts_sub.c.target_count)
                count_stmt = count_stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(doc_counts_sub.c.uploaded_count == doc_counts_sub.c.target_count)
            elif document_status == 'pending':
                stmt = stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(and_(doc_counts_sub.c.uploaded_count > 0, doc_counts_sub.c.uploaded_count < doc_counts_sub.c.target_count))
                count_stmt = count_stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(and_(doc_counts_sub.c.uploaded_count > 0, doc_counts_sub.c.uploaded_count < doc_counts_sub.c.target_count))
            elif document_status == 'not_collected':
                stmt = stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(doc_counts_sub.c.uploaded_count == 0)
                count_stmt = count_stmt.join(doc_counts_sub, Candidate.id == doc_counts_sub.c.c_id).where(doc_counts_sub.c.uploaded_count == 0)

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
        if limit is not None:
            stmt = stmt.offset(skip).limit(limit)
        else:
            stmt = stmt.offset(skip)
            
        result = await self.db.execute(stmt)
        return result.scalars().unique().all(), total

    async def get_stats(self) -> dict:
        """Get counts for dashboard statistics"""
        from sqlalchemy import or_, and_, case
        registered_filter = or_(
            Candidate.other.is_(None),
            Candidate.other['registration_type'].is_(None),
            Candidate.other['registration_type'].as_string() == '',
            Candidate.other['registration_type'].as_string().ilike('registered')
        )
        
        async def get_weekly_stats():
            # Get start of today (midnight)
            now = datetime.now()
            today_start = datetime(now.year, now.month, now.day)
            
            # Query for the last 7 days
            days = []
            for i in range(6, -1, -1):
                day_start = today_start - timedelta(days=i)
                day_end = day_start + timedelta(days=1) - timedelta(microseconds=1)
                
                stmt = (
                    select(func.count(Candidate.id))
                    .where(
                        (Candidate.is_deleted == False) &
                        registered_filter &
                        (Candidate.created_at >= day_start) &
                        (Candidate.created_at <= day_end)
                    )
                )
                result = await self.db.execute(stmt)
                count = result.scalar() or 0
                
                days.append({
                    "date": day_start.strftime("%Y-%m-%d"),
                    "day": day_start.strftime("%a"),
                    "count": count
                })
            return days

        try:
            # Total candidates (registered only)
            stmt = select(func.count(Candidate.id)).where(
                (Candidate.is_deleted == False) & registered_filter
            )
            result = await self.db.execute(stmt)
            total_candidates = result.scalar() or 0

            # Screened candidates (candidates with screening completed)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateScreening, Candidate.id == CandidateScreening.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateScreening.status == 'Completed')
            )
            result = await self.db.execute(stmt)
            screened_candidates = result.scalar() or 0

            # Unscreened candidates (candidates without screening records)
            stmt = (
                select(func.count(Candidate.id))
                .outerjoin(CandidateScreening, Candidate.id == CandidateScreening.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateScreening.id.is_(None))
            )
            result = await self.db.execute(stmt)
            unscreened_candidates = result.scalar() or 0

            # Counseled candidates (candidates with counseling status != pending)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateCounseling.status.in_(['selected', 'rejected']))
            )
            result = await self.db.execute(stmt)
            counseled_candidates = result.scalar() or 0

            # Pending counseling candidates (counseled status is pending)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateCounseling.status == 'pending')
            )
            result = await self.db.execute(stmt)
            pending_counseling = result.scalar() or 0

            # Not counseled candidates (candidates with screening completed but no counseling record)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateScreening, Candidate.id == CandidateScreening.candidate_id)
                .outerjoin(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateScreening.status == 'Completed')
                .where(CandidateCounseling.id.is_(None))
            )
            result = await self.db.execute(stmt)
            not_counseled = result.scalar() or 0

            # Selected candidates (counseling status == selected)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateCounseling.status == 'selected')
            )
            result = await self.db.execute(stmt)
            selected_candidates = result.scalar() or 0

            # Rejected candidates (counseling status == rejected)
            stmt = (
                select(func.count(Candidate.id))
                .join(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
                .where((Candidate.is_deleted == False) & registered_filter)
                .where(CandidateCounseling.status == 'rejected')
            )
            result = await self.db.execute(stmt)
            rejected_candidates = result.scalar() or 0

            # ------ Document Collection stats for ALL registered candidates -------
            DOCS_BASE = {'resume', '10th_certificate', '12th_certificate', 'degree_certificate',
                         'pan_card', 'aadhar_card', 'passport_photo', 'consent_form'}

            stmt_docs = (
                select(Candidate.id, Candidate.disability_details, func.array_agg(CandidateDocument.document_type))
                .outerjoin(CandidateDocument, and_(Candidate.id == CandidateDocument.candidate_id, CandidateDocument.is_active == True))
                .where((Candidate.is_deleted == False) & registered_filter)
                .group_by(Candidate.id)
            )
            res_docs = await self.db.execute(stmt_docs)
            doc_rows = res_docs.all()

            docs_total = len(doc_rows)
            pwd_candidates = 0
            non_pwd_candidates = 0
            files_collected = 0
            files_to_collect = 0
            pwd_files_collected = 0
            pwd_files_to_collect = 0
            non_pwd_files_collected = 0
            non_pwd_files_to_collect = 0
            candidates_fully_submitted = 0
            candidates_partially_submitted = 0
            candidates_not_submitted = 0

            for row in doc_rows:
                c_id, disp_details, doc_types = row
                uploaded = set(filter(None, doc_types))
                is_disabled = False
                if disp_details and isinstance(disp_details, dict):
                    is_disabled = disp_details.get('is_disabled', False)

                required = set(DOCS_BASE)
                if is_disabled:
                    required.add('disability_certificate')

                uploaded_count = len(uploaded.intersection(required))
                target_count = len(required)

                files_collected += uploaded_count
                files_to_collect += target_count

                if is_disabled:
                    pwd_candidates += 1
                    pwd_files_collected += uploaded_count
                    pwd_files_to_collect += target_count
                else:
                    non_pwd_candidates += 1
                    non_pwd_files_collected += uploaded_count
                    non_pwd_files_to_collect += target_count

                if uploaded_count == target_count:
                    candidates_fully_submitted += 1
                elif uploaded_count > 0:
                    candidates_partially_submitted += 1
                else:
                    candidates_not_submitted += 1

            pwd_files_pending = max(0, pwd_files_to_collect - pwd_files_collected)
            non_pwd_files_pending = max(0, non_pwd_files_to_collect - non_pwd_files_collected)
            docs_completed = candidates_fully_submitted
            docs_pending = docs_total - candidates_fully_submitted

            weekly = await get_weekly_stats()

            # New metrics for dashboard
            # 1. In Training: count distinct candidates assigned to active batches who have not dropped out
            stmt_training = select(func.count(func.distinct(TrainingCandidateAllocation.candidate_id))).join(
                TrainingBatch, TrainingCandidateAllocation.batch_id == TrainingBatch.id
            ).join(Candidate, TrainingCandidateAllocation.candidate_id == Candidate.id).where(
                and_(
                    TrainingBatch.status.in_(['planned', 'running', 'extended']),
                    TrainingCandidateAllocation.is_deleted == False,
                    TrainingCandidateAllocation.is_dropout == False,
                    TrainingBatch.is_deleted == False,
                    Candidate.is_deleted == False,
                    or_(Candidate.other.is_(None), Candidate.other['registration_type'].as_string() == 'Registered')
                )
            )
            result_training = await self.db.execute(stmt_training)
            in_training_count = result_training.scalar() or 0

            # 2. Moved to Placement: count distinct candidates in placement_mappings 
            # (any candidate who has reached the placement stage)
            stmt_moved_placement = select(func.count(func.distinct(PlacementMapping.candidate_id))).join(
                Candidate, PlacementMapping.candidate_id == Candidate.id
            ).where(
                and_(
                    Candidate.is_deleted == False,
                    or_(Candidate.other.is_(None), Candidate.other['registration_type'].as_string() == 'Registered')
                )
            )
            result_moved_placement = await self.db.execute(stmt_moved_placement)
            moved_to_placement_count = result_moved_placement.scalar() or 0

            # 3. Got Job: count distinct candidates who have accepted offers or joined, including Excel imports
            stmt_got_job = select(func.count(func.distinct(Candidate.id))).outerjoin(
                PlacementMapping, PlacementMapping.candidate_id == Candidate.id
            ).where(
                and_(
                    Candidate.is_deleted == False,
                    or_(
                        Candidate.other.is_(None), 
                        Candidate.other['registration_type'].as_string().in_(['Registered', 'Excel'])
                    ),
                    or_(
                        PlacementMapping.status.in_(['offered', 'offer_made', 'offer_accepted', 'joined'])
                    )
                )
            )
            result_got_job = await self.db.execute(stmt_got_job)
            got_job_count = result_got_job.scalar() or 0
            
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
                # Legacy/flat doc stats (Stage 2 values, kept for backward compat)
                "docs_total": docs_total,
                "docs_completed": docs_completed,
                "docs_pending": docs_pending,
                "files_collected": files_collected,
                "files_to_collect": files_to_collect,
                "candidates_fully_submitted": candidates_fully_submitted,
                "candidates_partially_submitted": candidates_partially_submitted,
                "candidates_not_submitted": candidates_not_submitted,
                "pwd_candidates": pwd_candidates,
                "pwd_files_collected": pwd_files_collected,
                "pwd_files_to_collect": pwd_files_to_collect,
                "pwd_files_pending": pwd_files_pending,
                "non_pwd_candidates": non_pwd_candidates,
                "non_pwd_files_collected": non_pwd_files_collected,
                "non_pwd_files_to_collect": non_pwd_files_to_collect,
                "non_pwd_files_pending": non_pwd_files_pending,
                # Stage 1: ALL screened registered candidates (resume + consent_form)
                "stage1_total": stage1_total,
                "stage1_pwd_count": stage1_pwd_count,
                "stage1_non_pwd_count": stage1_non_pwd_count,
                "stage1_files_collected": stage1_files_collected,
                "stage1_files_to_collect": stage1_files_to_collect,
                "stage1_files_pending": stage1_files_pending,
                "stage1_pwd_files_collected": stage1_pwd_files_collected,
                "stage1_pwd_files_to_collect": stage1_pwd_files_to_collect,
                "stage1_pwd_files_pending": stage1_pwd_files_pending,
                "stage1_non_pwd_files_collected": stage1_non_pwd_files_collected,
                "stage1_non_pwd_files_to_collect": stage1_non_pwd_files_to_collect,
                "stage1_non_pwd_files_pending": stage1_non_pwd_files_pending,
                "stage1_fully_submitted": stage1_fully_submitted,
                "stage1_partially_submitted": stage1_partially_submitted,
                "stage1_not_submitted": stage1_not_submitted,
                # Stage 2: ONLY counseling-SELECTED candidates (full 9/10 docs)
                "stage2_total": stage2_total,
                "stage2_pwd_count": stage2_pwd_count,
                "stage2_non_pwd_count": stage2_non_pwd_count,
                "stage2_files_collected": stage2_files_collected,
                "stage2_files_to_collect": stage2_files_to_collect,
                "stage2_files_pending": stage2_files_pending,
                "stage2_pwd_files_collected": stage2_pwd_files_collected,
                "stage2_pwd_files_to_collect": stage2_pwd_files_to_collect,
                "stage2_pwd_files_pending": stage2_pwd_files_pending,
                "stage2_non_pwd_files_collected": stage2_non_pwd_files_collected,
                "stage2_non_pwd_files_to_collect": stage2_non_pwd_files_to_collect,
                "stage2_non_pwd_files_pending": stage2_non_pwd_files_pending,
                "stage2_fully_submitted": stage2_fully_submitted,
                "stage2_partially_submitted": stage2_partially_submitted,
                "stage2_not_submitted": stage2_not_submitted,
                "screening_distribution": screening_distribution,
                "counseling_distribution": counseling_counts,
                "in_training": in_training_count,
                "moved_to_placement": moved_to_placement_count,
                "got_job": got_job_count
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
            stmt_disability = select(Candidate.disability_details).where(
                Candidate.disability_details.isnot(None),
                Candidate.is_deleted == False
            )
            result_disability = await self.db.execute(stmt_disability)
            disability_types = set()
            for row in result_disability.scalars().all():
                if row and isinstance(row, dict):
                    disability_type = row.get('disability_type')
                    if disability_type:
                        disability_types.add(disability_type)
            
            # Get unique education levels (from degree names)
            stmt_education = select(Candidate.education_details).where(
                Candidate.education_details.isnot(None),
                Candidate.is_deleted == False
            )
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
            
            # Get unique years of passing
            result_education_yop = await self.db.execute(stmt_education)
            years_of_passing = set()
            for row in result_education_yop.scalars().all():
                if row and isinstance(row, dict):
                    degrees = row.get('degrees', [])
                    for degree in degrees:
                        if isinstance(degree, dict):
                            yop = degree.get('year_of_passing')
                            if yop:
                                years_of_passing.add(str(yop))
            
            # Get unique cities
            stmt_cities = select(func.distinct(Candidate.city)).where(
                Candidate.city.isnot(None),
                Candidate.city != '',
                Candidate.is_deleted == False
            )
            result_cities = await self.db.execute(stmt_cities)
            cities = sorted([city for city in result_cities.scalars().all() if city])
            
            # Get unique registration types
            stmt_reg_types = select(Candidate.other).where(
                Candidate.other.isnot(None),
                Candidate.is_deleted == False
            )
            result_reg_types = await self.db.execute(stmt_reg_types)
            registration_types = set()
            beneficiary_statuses = set()
            for row in result_reg_types.scalars().all():
                if row and isinstance(row, dict):
                    reg_type = row.get('registration_type')
                    if reg_type:
                        normalized_reg_type = reg_type.strip().capitalize()
                        if normalized_reg_type:
                            registration_types.add(normalized_reg_type)
                    else:
                        registration_types.add("Registered")
                    
                    status_of_beneficiary = row.get('status_of_beneficiary')
                    if status_of_beneficiary:
                        beneficiary_statuses.add(status_of_beneficiary)
                else:
                    registration_types.add("Registered")
            
            # Ensure at least "Registered" and "Excel" are present
            registration_types.add("Registered")
            registration_types.add("Excel")
            
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

            # Get unique disability percentages
            stmt_disability_perc = select(Candidate.disability_details).where(Candidate.disability_details.isnot(None))
            result_disability_perc = await self.db.execute(stmt_disability_perc)
            disability_percentages = set()
            for row in result_disability_perc.scalars().all():
                if row and isinstance(row, dict):
                    perc = row.get('disability_percentage')
                    if perc is not None:
                        disability_percentages.add(perc)

            # Get unique screening reasons
            stmt_screening_reasons = select(CandidateScreening.others).where(CandidateScreening.others.isnot(None))
            result_screening_reasons = await self.db.execute(stmt_screening_reasons)
            screening_reasons = set()
            for row in result_screening_reasons.scalars().all():
                if row and isinstance(row, dict):
                    reason = row.get('reason')
                    if reason:
                        screening_reasons.add(reason)
            
            return {
                "disability_types": sorted(list(disability_types)),
                "education_levels": sorted(list(education_levels)),
                "cities": cities,
                "counseling_statuses": counseling_statuses,
                "screening_statuses": sorted(screening_statuses),
                "disability_percentages": sorted(list(disability_percentages)),
                "screening_reasons": sorted(list(screening_reasons)),
                "years_of_passing": sorted(list(years_of_passing), reverse=True),
                "registration_types": sorted(list(registration_types)),
                "beneficiary_statuses": sorted(list(beneficiary_statuses))
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



    async def get_screening_stats(self, assigned_to_id: Optional[int] = None) -> dict:
        """Get candidate screening statistics for tabs, with optional assignment filter"""
        from sqlalchemy import func, or_
        from app.models.candidate_screening import CandidateScreening
        from app.models.candidate_assignment import CandidateAssignment
        
        try:
            # Helper to execute count query
            async def get_count(filter_expr=None):
                stmt = select(func.count(Candidate.id)).select_from(Candidate)
                if assigned_to_id is not None:
                    stmt = stmt.join(Candidate.assignment).where(CandidateAssignment.user_id == assigned_to_id)
                
                start_filter = (Candidate.is_deleted == False) & (or_(Candidate.other.is_(None), Candidate.other['registration_type'].as_string() == 'Registered'))
                if filter_expr is not None:
                    stmt = stmt.where(start_filter, filter_expr)
                else:
                    stmt = stmt.where(start_filter)
                result = await self.db.execute(stmt)
                return result.scalar() or 0

            total = await get_count()
            
            # Screening stats
            stmt_screened = select(func.count(CandidateScreening.id)).join(Candidate).where(
                (Candidate.is_deleted == False) & (or_(Candidate.other.is_(None), Candidate.other['registration_type'].as_string() == 'Registered'))
            )
            if assigned_to_id is not None:
                stmt_screened = stmt_screened.join(Candidate.assignment).where(CandidateAssignment.user_id == assigned_to_id)
                
            result_screened = await self.db.execute(stmt_screened)
            screened = result_screened.scalar() or 0
            
            # Screening distribution
            stmt_dist = select(CandidateScreening.status, func.count(CandidateScreening.id)).join(Candidate).where(
                (Candidate.is_deleted == False) & (or_(Candidate.other.is_(None), Candidate.other['registration_type'].as_string() == 'Registered'))
            )
            if assigned_to_id is not None:
                stmt_dist = stmt_dist.join(Candidate.assignment).where(CandidateAssignment.user_id == assigned_to_id)
            stmt_dist = stmt_dist.group_by(CandidateScreening.status)
            res_dist = await self.db.execute(stmt_dist)
            raw_dist = dict(res_dist.all())
            
            screening_distribution = {}
            for status_key, count in raw_dist.items():
                target_key = status_key
                if status_key is None or status_key == '':
                    target_key = 'In Progress'
                screening_distribution[target_key] = screening_distribution.get(target_key, 0) + count
            
            not_screened = max(0, total - screened)

            return {
                "not_screened": not_screened,
                "screening_distribution": screening_distribution
            }
        except Exception as e:
            # Log error
            import logging
            logging.error(f"Error in get_screening_stats: {e}")
            return {
                "not_screened": 0,
                "screening_distribution": {}
            }
