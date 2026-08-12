"""Unified Report Service - Aggregates all candidate data across modules"""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_, case, String, text
from sqlalchemy.orm import selectinload, joinedload

from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_document import CandidateDocument
from app.models.candidate_assignment import CandidateAssignment
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_batch import TrainingBatch
from app.models.training_attendance import TrainingAttendance
from app.models.training_mock_interview import TrainingMockInterview
from app.models.training_candidate_analysis import TrainingCandidateAnalysis
from app.models.training_assignment import TrainingAssignment
from app.models.placement_mapping import PlacementMapping
from app.models.placement_offer import PlacementOffer
from app.models.job_role import JobRole
from app.models.company import Company
from app.models.user import User


class UnifiedReportService:
    """Service layer for unified report with comprehensive data aggregation."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_report(
        self,
        # Pagination
        skip: int = 0,
        limit: int = 25,
        search: Optional[str] = None,
        # Candidate filters
        gender: Optional[str] = None,
        disability_types: Optional[str] = None,
        education_levels: Optional[str] = None,
        cities: Optional[str] = None,
        disability_percentages: Optional[str] = None,
        year_of_passing: Optional[str] = None,
        year_of_experience: Optional[str] = None,
        is_experienced: Optional[bool] = None,
        currently_employed: Optional[bool] = None,
        registration_type: Optional[str] = None,
        status_of_beneficiary: Optional[str] = None,
        created_from: Optional[str] = None,
        created_to: Optional[str] = None,
        # Screening filters
        screening_status: Optional[str] = None,
        consent_status: Optional[str] = None,
        screening_reason: Optional[str] = None,
        # Counseling filters
        counseling_status: Optional[str] = None,
        # Document filters
        has_resume: Optional[bool] = None,
        has_disability_cert: Optional[bool] = None,
        # Training filters
        batch_ids: Optional[str] = None,
        batch_tag: Optional[str] = None,
        training_status: Optional[str] = None,
        is_dropout: Optional[bool] = None,
        # Mock interview filters
        mock_interview_status: Optional[str] = None,
        # Analysis filters
        recommendation: Optional[str] = None,
        analysis_status: Optional[str] = None,
        # Placement filters
        company_id: Optional[int] = None,
        job_role_id: Optional[str] = None,
        placement_status: Optional[str] = None,
        offer_response: Optional[str] = None,
        joining_status: Optional[str] = None,
        # Dynamic field filters
        extra_filters: Optional[dict] = None,
    ) -> dict:
        """
        Fetch unified report data — one row per candidate with all related data.
        One-to-many relationships (allocations, placements, mock interviews) are
        eagerly loaded and returned as arrays for the frontend to display as
        comma-separated values.
        """
        # Base query with all relationships eagerly loaded
        query = (
            select(Candidate)
            .outerjoin(CandidateScreening, Candidate.id == CandidateScreening.candidate_id)
            .outerjoin(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
            .outerjoin(CandidateAssignment, Candidate.id == CandidateAssignment.candidate_id)
            .options(
                selectinload(Candidate.screening).selectinload(CandidateScreening.screened_by),
                selectinload(Candidate.counseling).selectinload(CandidateCounseling.counselor),
                selectinload(Candidate.documents),
                selectinload(Candidate.assignment).selectinload(CandidateAssignment.user),
                selectinload(Candidate.allocations).selectinload(TrainingCandidateAllocation.batch),
                selectinload(Candidate.mock_interviews),
                selectinload(Candidate.assignments),
            )
        )

        # Count query
        count_query = (
            select(func.count(func.distinct(Candidate.id)))
            .select_from(Candidate)
            .outerjoin(CandidateScreening, Candidate.id == CandidateScreening.candidate_id)
            .outerjoin(CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id)
        )

        filters = []

        # Active candidate filter
        filters.append(Candidate.is_deleted == False)

        # Search
        if search:
            search_term = f"%{search}%"
            filters.append(
                or_(
                    Candidate.name.ilike(search_term),
                    Candidate.email.ilike(search_term),
                    Candidate.phone.ilike(search_term),
                    Candidate.city.ilike(search_term),
                )
            )

        # --- Candidate Filters ---
        if gender:
            filters.append(Candidate.gender == gender)

        if disability_types:
            dt_list = [d.strip() for d in disability_types.split(",")]
            filters.append(
                func.json_extract_path_text(Candidate.disability_details, "disability_type").in_(dt_list)
            )

        if education_levels:
            ed_list = [e.strip() for e in education_levels.split(",")]
            filters.append(
                func.json_extract_path_text(Candidate.education_details, "highest_education").in_(ed_list)
            )

        if cities:
            city_list = [c.strip() for c in cities.split(",")]
            filters.append(Candidate.city.in_(city_list))

        if disability_percentages:
            parts = disability_percentages.split("-")
            if len(parts) == 2:
                min_pct, max_pct = int(parts[0]), int(parts[1])
                filters.append(
                    func.cast(
                        func.json_extract_path_text(Candidate.disability_details, "disability_percentage"),
                        String
                    ).cast(func.integer).between(min_pct, max_pct)
                )

        if year_of_passing:
            yp_list = [y.strip() for y in year_of_passing.split(",")]
            filters.append(
                func.json_extract_path_text(Candidate.education_details, "year_of_passing").in_(yp_list)
            )

        if year_of_experience:
            parts = year_of_experience.split("-")
            if len(parts) == 2:
                min_exp, max_exp = int(parts[0]), int(parts[1])
                filters.append(
                    func.cast(
                        func.json_extract_path_text(Candidate.work_experience, "years"),
                        String
                    ).cast(func.integer).between(min_exp, max_exp)
                )

        if is_experienced is not None:
            filters.append(
                func.json_extract_path_text(Candidate.work_experience, "is_experienced") == str(is_experienced).lower()
            )

        if currently_employed is not None:
            filters.append(
                func.json_extract_path_text(Candidate.work_experience, "currently_employed") == str(currently_employed).lower()
            )

        if registration_type:
            filters.append(
                func.json_extract_path_text(Candidate.other, "registration_type") == registration_type
            )

        if status_of_beneficiary:
            sb_list = [s.strip() for s in status_of_beneficiary.split(",")]
            filters.append(
                func.json_extract_path_text(Candidate.other, "status_of_beneficiary").in_(sb_list)
            )

        if created_from:
            filters.append(Candidate.created_at >= created_from)
        if created_to:
            filters.append(Candidate.created_at <= created_to)

        # --- Screening Filters ---
        if screening_status:
            filters.append(CandidateScreening.status == screening_status)

        if consent_status:
            filters.append(CandidateScreening.consent_status == consent_status)

        if screening_reason:
            sr_list = [s.strip() for s in screening_reason.split(",")]
            filters.append(
                func.json_extract_path_text(CandidateScreening.others, "screening_reason").in_(sr_list)
            )

        # --- Counseling Filters ---
        if counseling_status:
            filters.append(CandidateCounseling.status == counseling_status)

        # --- Dynamic Field Filters ---
        if extra_filters:
            for key, value in extra_filters.items():
                if key.startswith("screening_others."):
                    field_name = key.replace("screening_others.", "")
                    if "," in value:
                        val_list = [v.strip() for v in value.split(",")]
                        filters.append(
                            func.json_extract_path_text(CandidateScreening.others, field_name).in_(val_list)
                        )
                    else:
                        filters.append(
                            func.json_extract_path_text(CandidateScreening.others, field_name) == value
                        )
                elif key.startswith("counseling_others."):
                    field_name = key.replace("counseling_others.", "")
                    if "," in value:
                        val_list = [v.strip() for v in value.split(",")]
                        filters.append(
                            func.json_extract_path_text(CandidateCounseling.others, field_name).in_(val_list)
                        )
                    else:
                        filters.append(
                            func.json_extract_path_text(CandidateCounseling.others, field_name) == value
                        )

        # Apply filters
        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        # Post-load filtering for training/placement (done in Python after fetching)
        # These are applied after the main query to avoid complex subquery joins

        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated data
        query = query.order_by(Candidate.created_at.desc())
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        candidates = result.unique().scalars().all()

        # Now fetch placement mappings for these candidates
        candidate_ids = [c.id for c in candidates]
        placement_data = {}
        analysis_data = {}

        if candidate_ids:
            # Fetch placement mappings with job role + company
            pm_query = (
                select(PlacementMapping)
                .where(
                    PlacementMapping.candidate_id.in_(candidate_ids),
                    PlacementMapping.is_active == True,
                    PlacementMapping.is_deleted == False,
                )
                .options(
                    selectinload(PlacementMapping.job_role).selectinload(JobRole.company),
                    selectinload(PlacementMapping.offer),
                )
                .order_by(PlacementMapping.created_at.desc())
            )
            pm_result = await self.db.execute(pm_query)
            all_mappings = pm_result.unique().scalars().all()

            for m in all_mappings:
                if m.candidate_id not in placement_data:
                    placement_data[m.candidate_id] = []
                placement_data[m.candidate_id].append(m)

            # Fetch training candidate analyses
            analysis_query = (
                select(TrainingCandidateAnalysis)
                .where(
                    TrainingCandidateAnalysis.candidate_id.in_(candidate_ids),
                    TrainingCandidateAnalysis.is_deleted == False,
                )
                .order_by(TrainingCandidateAnalysis.created_at.desc())
            )
            analysis_result = await self.db.execute(analysis_query)
            all_analyses = analysis_result.unique().scalars().all()

            for a in all_analyses:
                if a.candidate_id not in analysis_data:
                    analysis_data[a.candidate_id] = []
                analysis_data[a.candidate_id].append(a)

            # Fetch training attendance for candidates
            attendance_data = {}
            att_query = (
                select(TrainingAttendance)
                .where(
                    TrainingAttendance.candidate_id.in_(candidate_ids),
                    TrainingAttendance.is_deleted == False,
                )
            )
            att_result = await self.db.execute(att_query)
            all_attendance = att_result.scalars().all()

            for att in all_attendance:
                if att.candidate_id not in attendance_data:
                    attendance_data[att.candidate_id] = []
                attendance_data[att.candidate_id].append(att)

        # Build response items
        items = []
        for candidate in candidates:
            item = self._serialize_candidate(
                candidate,
                placement_data.get(candidate.id, []),
                analysis_data.get(candidate.id, []),
                attendance_data.get(candidate.id, []),
            )
            
            # Apply post-fetch filters for training/placement
            if not self._passes_post_filters(
                item,
                batch_ids=batch_ids,
                batch_tag=batch_tag,
                training_status=training_status,
                is_dropout=is_dropout,
                mock_interview_status=mock_interview_status,
                recommendation=recommendation,
                analysis_status=analysis_status,
                company_id=company_id,
                job_role_id=job_role_id,
                placement_status=placement_status,
                offer_response=offer_response,
                joining_status=joining_status,
                has_resume=has_resume,
                has_disability_cert=has_disability_cert,
            ):
                continue

            items.append(item)

        return {"items": items, "total": total}

    def _serialize_candidate(
        self,
        c: Candidate,
        placements: list,
        analyses: list,
        attendances: list = None,
    ) -> dict:
        """Serialize a candidate with all related data into a flat report row."""
        # === General Info ===
        disability_details = c.disability_details or {}
        education_details = c.education_details or {}
        work_experience = c.work_experience or {}
        other = c.other or {}

        item = {
            # Core
            "public_id": str(c.public_id),
            "name": c.name,
            "gender": c.gender,
            "email": c.email,
            "phone": c.phone,
            "whatsapp_number": c.whatsapp_number,
            "dob": str(c.dob) if c.dob else None,
            "city": c.city,
            "district": c.district,
            "state": c.state,
            "pincode": c.pincode,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,

            # Education
            "education_level": None,
            "specialization": education_details.get("specialization"),
            "year_of_passing": education_details.get("year_of_passing"),

            # Disability
            "disability_type": disability_details.get("disability_type") or disability_details.get("type"),
            "disability_percentage": disability_details.get("disability_percentage"),
            "disability_sub_category": disability_details.get("disability_sub_category"),

            # Experience
            "is_experienced": work_experience.get("is_experienced"),
            "year_of_experience": work_experience.get("years"),
            "currently_employed": work_experience.get("currently_employed"),

            # Other
            "registration_type": other.get("registration_type", "registered"),
            "status_of_beneficiary": other.get("status_of_beneficiary"),
            "company_placed": other.get("company_placed"),
            "date_of_joining": other.get("date_of_joining"),
            "designation": other.get("designation"),
            "ctc": other.get("ctc"),
            "donor": other.get("donor"),
            "batch_year": other.get("batch_year"),
        }

        # Education level from degrees array
        degrees = education_details.get("degrees", [])
        if degrees and len(degrees) > 0:
            item["education_level"] = degrees[0].get("degree_name") or degrees[0].get("degree")

        # === Screening ===
        screening = c.screening
        if screening:
            item.update({
                "screening_status": screening.status,
                "screening_skills": screening.skills,
                "consent_status": screening.consent_status,
                "screened_by_name": (screening.screened_by.full_name or screening.screened_by.username) if screening.screened_by else None,
                "screening_date": screening.created_at.isoformat() if screening.created_at else None,
                "screening_updated_at": screening.updated_at.isoformat() if screening.updated_at else None,
                "screening_created_at": screening.created_at.isoformat() if screening.created_at else None,
                "family_details": screening.family_details,
                "documents_uploaded": screening.documents_upload,
                "screening_comments": (screening.others or {}).get("comments"),
                "source_of_info": (screening.others or {}).get("source_of_info"),
                "family_annual_income": (screening.others or {}).get("family_annual_income"),
                "screening_reason": (screening.others or {}).get("screening_reason"),
                "screening_others": screening.others or {},
            })
        else:
            item.update({
                "screening_status": None,
                "screening_skills": None,
                "consent_status": None,
                "screened_by_name": None,
                "screening_date": None,
                "screening_updated_at": None,
                "screening_created_at": None,
                "family_details": None,
                "documents_uploaded": None,
                "screening_comments": None,
                "source_of_info": None,
                "family_annual_income": None,
                "screening_reason": None,
                "screening_others": {},
            })

        # === Counseling ===
        counseling = c.counseling
        if counseling:
            item.update({
                "counseling_status": counseling.status,
                "counseling_sub_status": counseling.sub_status,
                "counselor_name": counseling.counselor_name or ((counseling.counselor.full_name or counseling.counselor.username) if counseling.counselor else None),
                "counseling_date": counseling.counseling_date.isoformat() if counseling.counseling_date else None,
                "feedback": counseling.feedback,
                "skills": counseling.skills,
                "suitable_job_roles": counseling.suitable_job_roles,
                "questions": counseling.questions,
                "workexperience": counseling.workexperience,
                "counseling_created_at": counseling.created_at.isoformat() if counseling.created_at else None,
                "counseling_updated_at": counseling.updated_at.isoformat() if counseling.updated_at else None,
                "counseling_others": counseling.others or {},
            })
        else:
            item.update({
                "counseling_status": None,
                "counseling_sub_status": None,
                "counselor_name": None,
                "counseling_date": None,
                "feedback": None,
                "skills": None,
                "suitable_job_roles": None,
                "questions": None,
                "workexperience": None,
                "counseling_created_at": None,
                "counseling_updated_at": None,
                "counseling_others": {},
            })

        # === Assignment (Sourcing) ===
        assignment = c.assignment
        if assignment:
            item["assigned_to_name"] = (assignment.user.full_name or assignment.user.username) if assignment.user else None
        else:
            item["assigned_to_name"] = None

        # === Documents ===
        docs = c.documents or []
        active_docs = [d for d in docs if d.is_active and not d.is_deleted]
        doc_types = list(set(d.document_type for d in active_docs))
        item.update({
            "doc_types_uploaded": doc_types,
            "has_resume": any(d.document_type == "resume" for d in active_docs),
            "has_disability_cert": any(d.document_type == "disability_certificate" for d in active_docs),
            "total_documents": len(active_docs),
        })

        # === Training Allocations (all, comma-separated) ===
        allocations = sorted(
            [a for a in (c.allocations or []) if not a.is_deleted],
            key=lambda a: a.created_at or a.id,
            reverse=True
        )
        if allocations:
            item.update({
                "batch_names": ", ".join(a.batch.batch_name for a in allocations if a.batch),
                "batch_statuses": ", ".join(a.batch.status for a in allocations if a.batch),
                "batch_tags": ", ".join((a.batch.other or {}).get("tag", "-") for a in allocations if a.batch),
                "domains": ", ".join((a.batch.other or {}).get("domain", "-") for a in allocations if a.batch),
                "training_modes": ", ".join((a.batch.other or {}).get("training_mode", "-") for a in allocations if a.batch),
                "courses_list": ", ".join(
                    self._format_courses(a.batch.courses) for a in allocations if a.batch
                ),
                "durations": ", ".join(
                    self._format_duration(a.batch) for a in allocations if a.batch
                ),
                "training_statuses": ", ".join(a.status for a in allocations),
                "is_dropout": any(a.is_dropout for a in allocations),
                "dropout_remarks": ", ".join(a.dropout_remark or "" for a in allocations if a.dropout_remark),
                "allocation_dates": ", ".join(
                    a.created_at.strftime("%Y-%m-%d") if a.created_at else "-"
                    for a in allocations
                ),
                "training_summary": " | ".join(
                    f"{a.batch.batch_name if a.batch else 'N/A'} ({a.status})"
                    for a in allocations
                ),
                "allocation_created_at": allocations[0].created_at.isoformat() if allocations[0].created_at else None,
                "allocation_updated_at": allocations[0].updated_at.isoformat() if allocations[0].updated_at else None,
                # For backward compat - latest allocation fields
                "batch_name": allocations[0].batch.batch_name if allocations[0].batch else None,
                "batch_status": allocations[0].batch.status if allocations[0].batch else None,
                "batch_tag": (allocations[0].batch.other or {}).get("tag") if allocations[0].batch else None,
                "domain": (allocations[0].batch.other or {}).get("domain") if allocations[0].batch else None,
                "training_mode": (allocations[0].batch.other or {}).get("training_mode") if allocations[0].batch else None,
                "courses": self._format_courses(allocations[0].batch.courses) if allocations[0].batch else None,
                "duration": self._format_duration(allocations[0].batch) if allocations[0].batch else None,
                "training_status": allocations[0].status,
            })
        else:
            item.update({
                "batch_names": None, "batch_statuses": None, "batch_tags": None,
                "domains": None, "training_modes": None, "courses_list": None,
                "durations": None, "training_statuses": None, "is_dropout": None,
                "dropout_remarks": None, "allocation_dates": None,
                "allocation_created_at": None, "allocation_updated_at": None,
                "batch_name": None, "batch_status": None, "batch_tag": None,
                "domain": None, "training_mode": None, "courses": None,
                "duration": None, "training_status": None,
            })

        # === Attendance (calculated directly from TrainingAttendance table) ===
        cand_atts = attendances or []
        if cand_atts:
            present_count = sum(1 for a in cand_atts if a.status in ("present", "late", "half_day"))
            absent_count = sum(1 for a in cand_atts if a.status == "absent")
            total_days = len(cand_atts)
            att_pct = round((present_count / total_days) * 100, 1) if total_days > 0 else 0.0

            item.update({
                "attendance_percentage": att_pct,
                "total_present_days": present_count,
                "total_absent_days": absent_count,
            })
        elif allocations:
            attendance_pcts = []
            total_present = 0
            total_absent = 0
            for a in allocations:
                others = a.others or {}
                pct = others.get("attendance_percentage")
                if pct is not None:
                    attendance_pcts.append(str(pct))
                present = others.get("total_present_days", 0) or 0
                absent = others.get("total_absent_days", 0) or 0
                total_present += present
                total_absent += absent

            item.update({
                "attendance_percentage": ", ".join(attendance_pcts) if attendance_pcts else None,
                "total_present_days": total_present if total_present > 0 else None,
                "total_absent_days": total_absent if total_absent > 0 else None,
            })
        else:
            item.update({
                "attendance_percentage": None,
                "total_present_days": None,
                "total_absent_days": None,
            })

        # === Mock Interviews (all, formatted) ===
        mock_interviews = sorted(
            [m for m in (c.mock_interviews or []) if not m.is_deleted],
            key=lambda m: m.created_at or m.id,
            reverse=True
        )
        if mock_interviews:
            formatted_skills = [
                self._format_mock_skills(m.skills) for m in mock_interviews
            ]

            item.update({
                "mock_interview_statuses": ", ".join(m.status for m in mock_interviews),
                "mock_interview_ratings": ", ".join(
                    str(m.overall_rating) if m.overall_rating is not None else "-"
                    for m in mock_interviews
                ),
                "mock_interview_skills": " | ".join(formatted_skills),
                "mock_interview_dates": ", ".join(
                    m.interview_date.strftime("%Y-%m-%d") if m.interview_date else "-"
                    for m in mock_interviews
                ),
                "mock_interview_types": ", ".join(
                    m.interview_type or "-" for m in mock_interviews
                ),
                "mock_interview_feedbacks": " | ".join(
                    m.feedback or "" for m in mock_interviews if m.feedback
                ),
                # Latest
                "mock_interview_status": mock_interviews[0].status,
                "mock_interview_rating": mock_interviews[0].overall_rating,
                "mock_interview_skill": formatted_skills[0] if formatted_skills else None,
                "mock_interview_date": mock_interviews[0].interview_date.isoformat() if mock_interviews[0].interview_date else None,
                "mock_interview_type": mock_interviews[0].interview_type,
                "mock_interview_feedback": mock_interviews[0].feedback,
                "mock_interview_created_at": mock_interviews[0].created_at.isoformat() if mock_interviews[0].created_at else None,
                "mock_interview_updated_at": mock_interviews[0].updated_at.isoformat() if mock_interviews[0].updated_at else None,
            })
        else:
            item.update({
                "mock_interview_statuses": None, "mock_interview_ratings": None,
                "mock_interview_skills": None, "mock_interview_dates": None,
                "mock_interview_types": None, "mock_interview_feedbacks": None,
                "mock_interview_status": None, "mock_interview_rating": None,
                "mock_interview_skill": None, "mock_interview_date": None,
                "mock_interview_type": None, "mock_interview_feedback": None,
                "mock_interview_created_at": None, "mock_interview_updated_at": None,
            })

        # === Candidate Analysis / SWOT ===
        if analyses:
            latest_analysis = analyses[0]
            item.update({
                "analysis_recommendation": latest_analysis.recommendation,
                "analysis_status": latest_analysis.status,
                "analyst_name": latest_analysis.analyst_name,
                "analysis_date": latest_analysis.analysis_date.isoformat() if latest_analysis.analysis_date else None,
                "analysis_strengths": latest_analysis.strengths,
                "analysis_weaknesses": latest_analysis.weaknesses,
                "analysis_opportunities": latest_analysis.opportunities,
                "analysis_threats": latest_analysis.threats,
                "assessment_score": (latest_analysis.other or {}).get("assessment_score") or (latest_analysis.other or {}).get("score"),
                "analysis_skills": self._format_mock_skills(latest_analysis.skills),
                "analysis_created_at": latest_analysis.created_at.isoformat() if latest_analysis.created_at else None,
                "analysis_updated_at": latest_analysis.updated_at.isoformat() if latest_analysis.updated_at else None,
                # Multi-item aggregated fields
                "analysis_recommendations": ", ".join(a.recommendation for a in analyses if a.recommendation),
                "analysis_statuses": ", ".join(a.status for a in analyses if a.status),
                "analyst_names": ", ".join(a.analyst_name for a in analyses if a.analyst_name),
            })
        else:
            item.update({
                "analysis_recommendation": None, "analysis_status": None,
                "analyst_name": None, "analysis_date": None,
                "analysis_strengths": None, "analysis_weaknesses": None,
                "analysis_opportunities": None, "analysis_threats": None,
                "assessment_score": None, "analysis_skills": None,
                "analysis_created_at": None, "analysis_updated_at": None,
                "analysis_recommendations": None, "analysis_statuses": None,
                "analyst_names": None,
            })

        # === Training Assignments (avg marks) ===
        assignments = [a for a in (c.assignments or []) if not a.is_deleted]
        if assignments:
            total_marks = sum(a.marks_obtained for a in assignments)
            total_max = sum(a.max_marks for a in assignments)
            avg_pct = round((total_marks / total_max * 100), 1) if total_max > 0 else None
            item["assignment_avg_marks"] = avg_pct
        else:
            item["assignment_avg_marks"] = None

        # === Placement Mappings (all, comma-separated) ===
        if placements:
            item.update({
                "mapped_companies": ", ".join(
                    m.job_role.company.name if m.job_role and m.job_role.company else "-"
                    for m in placements
                ),
                "mapped_job_roles": ", ".join(
                    m.job_role.title if m.job_role else "-" for m in placements
                ),
                "placement_statuses": ", ".join(
                    m.status.value if hasattr(m.status, 'value') else str(m.status) for m in placements
                ),
                "placement_priorities": ", ".join(
                    m.priority or "-" for m in placements
                ),
                "match_scores": ", ".join(
                    str(m.match_score) if m.match_score else "-" for m in placements
                ),
                "mapped_at_dates": ", ".join(
                    m.mapped_at.strftime("%Y-%m-%d") if m.mapped_at else "-" for m in placements
                ),
                "job_role_statuses": ", ".join(
                    m.job_role.status.value if m.job_role and hasattr(m.job_role.status, 'value') else (m.job_role.status if m.job_role else "-")
                    for m in placements
                ),
                "placement_summary": " | ".join(
                    f"{m.job_role.company.name if m.job_role and m.job_role.company else 'N/A'} - {m.job_role.title if m.job_role else 'N/A'} ({m.status.value if hasattr(m.status, 'value') else str(m.status)})"
                    for m in placements
                ),
                # Latest
                "mapped_company": placements[0].job_role.company.name if placements[0].job_role and placements[0].job_role.company else None,
                "mapped_job_role": placements[0].job_role.title if placements[0].job_role else None,
                "placement_status": placements[0].status.value if hasattr(placements[0].status, 'value') else str(placements[0].status),
                "placement_priority": placements[0].priority,
                "match_score": placements[0].match_score,
                "mapped_at": placements[0].mapped_at.isoformat() if placements[0].mapped_at else None,
                "job_role_status": placements[0].job_role.status.value if placements[0].job_role and hasattr(placements[0].job_role.status, 'value') else None,
                "placement_created_at": placements[0].created_at.isoformat() if placements[0].created_at else None,
                "placement_updated_at": placements[0].updated_at.isoformat() if placements[0].updated_at else None,
            })

            # === Offer Data (from any placement mapping with an offer) ===
            active_offer = next((m.offer for m in placements if m.offer), None)

            # Build alignment lists per placement mapping
            offered_ctcs_list = []
            offered_designations_list = []
            work_locations_list = []
            joining_dates_list = []
            offer_responses_list = []
            actual_joining_dates_list = []
            joining_statuses_list = []
            offer_dates_list = []
            offer_created_ats_list = []
            offer_updated_ats_list = []

            for m in placements:
                o = m.offer
                if o:
                    offered_ctcs_list.append(str(o.offered_ctc) if o.offered_ctc is not None else "-")
                    offered_designations_list.append(o.offered_designation or "-")
                    work_locations_list.append(o.work_location or "-")
                    joining_dates_list.append(str(o.joining_date) if o.joining_date else "-")
                    offer_responses_list.append(
                        o.candidate_response.value if hasattr(o.candidate_response, 'value') else str(o.candidate_response)
                    )
                    actual_joining_dates_list.append(str(o.actual_joining_date) if o.actual_joining_date else "-")
                    joining_statuses_list.append(
                        o.joining_status.value if o.joining_status and hasattr(o.joining_status, 'value') else (str(o.joining_status) if o.joining_status else "-")
                    )
                    offer_dates_list.append(str(o.offer_date) if o.offer_date else "-")
                    offer_created_ats_list.append(o.created_at.strftime("%Y-%m-%d") if o.created_at else "-")
                    offer_updated_ats_list.append(o.updated_at.strftime("%Y-%m-%d") if o.updated_at else "-")
                else:
                    offered_ctcs_list.append("-")
                    offered_designations_list.append("-")
                    work_locations_list.append("-")
                    joining_dates_list.append("-")
                    offer_responses_list.append("-")
                    actual_joining_dates_list.append("-")
                    joining_statuses_list.append("-")
                    offer_dates_list.append("-")
                    offer_created_ats_list.append("-")
                    offer_updated_ats_list.append("-")

            item.update({
                "offered_ctcs": ", ".join(offered_ctcs_list),
                "offered_designations": ", ".join(offered_designations_list),
                "work_locations": ", ".join(work_locations_list),
                "joining_dates": ", ".join(joining_dates_list),
                "offer_responses": ", ".join(offer_responses_list),
                "actual_joining_dates": ", ".join(actual_joining_dates_list),
                "joining_statuses": ", ".join(joining_statuses_list),
                "offer_dates": ", ".join(offer_dates_list),
                "offer_created_ats": ", ".join(offer_created_ats_list),
                "offer_updated_ats": ", ".join(offer_updated_ats_list),
            })

            if active_offer:
                item.update({
                    "offered_ctc": active_offer.offered_ctc,
                    "offered_designation": active_offer.offered_designation,
                    "work_location": active_offer.work_location,
                    "joining_date": str(active_offer.joining_date) if active_offer.joining_date else None,
                    "offer_response": active_offer.candidate_response.value if hasattr(active_offer.candidate_response, 'value') else str(active_offer.candidate_response),
                    "actual_joining_date": str(active_offer.actual_joining_date) if active_offer.actual_joining_date else None,
                    "joining_status": active_offer.joining_status.value if active_offer.joining_status and hasattr(active_offer.joining_status, 'value') else str(active_offer.joining_status) if active_offer.joining_status else None,
                    "offer_date": str(active_offer.offer_date) if active_offer.offer_date else None,
                    "offer_created_at": active_offer.created_at.isoformat() if active_offer.created_at else None,
                    "offer_updated_at": active_offer.updated_at.isoformat() if active_offer.updated_at else None,
                })
            else:
                item.update({
                    "offered_ctc": None, "offered_designation": None,
                    "work_location": None, "joining_date": None,
                    "offer_response": None, "actual_joining_date": None,
                    "joining_status": None, "offer_date": None,
                    "offer_created_at": None, "offer_updated_at": None,
                })
        else:
            item.update({
                "mapped_companies": None, "mapped_job_roles": None,
                "placement_statuses": None, "placement_priorities": None,
                "match_scores": None, "mapped_at_dates": None,
                "job_role_statuses": None, "placement_summary": None,
                "mapped_company": None, "mapped_job_role": None,
                "placement_status": None, "placement_priority": None,
                "match_score": None, "mapped_at": None,
                "job_role_status": None,
                "placement_created_at": None, "placement_updated_at": None,
                "offered_ctcs": None, "offered_designations": None,
                "work_locations": None, "joining_dates": None,
                "offer_responses": None, "actual_joining_dates": None,
                "joining_statuses": None, "offer_dates": None,
                "offer_created_ats": None, "offer_updated_ats": None,
                "offered_ctc": None, "offered_designation": None,
                "work_location": None, "joining_date": None,
                "offer_response": None, "actual_joining_date": None,
                "joining_status": None, "offer_date": None,
                "offer_created_at": None, "offer_updated_at": None,
            })

        return item

    def _passes_post_filters(
        self,
        item: dict,
        batch_ids: Optional[str] = None,
        batch_tag: Optional[str] = None,
        training_status: Optional[str] = None,
        is_dropout: Optional[bool] = None,
        mock_interview_status: Optional[str] = None,
        recommendation: Optional[str] = None,
        analysis_status: Optional[str] = None,
        company_id: Optional[int] = None,
        job_role_id: Optional[str] = None,
        placement_status: Optional[str] = None,
        offer_response: Optional[str] = None,
        joining_status: Optional[str] = None,
        has_resume: Optional[bool] = None,
        has_disability_cert: Optional[bool] = None,
    ) -> bool:
        """Apply post-fetch filters for relationships loaded via selectin."""
        if has_resume is not None and item.get("has_resume") != has_resume:
            return False
        if has_disability_cert is not None and item.get("has_disability_cert") != has_disability_cert:
            return False

        if training_status and item.get("training_statuses"):
            if training_status not in (item.get("training_statuses") or ""):
                return False
        elif training_status and not item.get("training_statuses"):
            return False

        if is_dropout is not None:
            if is_dropout and not item.get("is_dropout"):
                return False

        if batch_tag and item.get("batch_tags"):
            if batch_tag.lower() not in (item.get("batch_tags") or "").lower():
                return False
        elif batch_tag and not item.get("batch_tags"):
            return False

        if mock_interview_status and item.get("mock_interview_statuses"):
            if mock_interview_status not in (item.get("mock_interview_statuses") or ""):
                return False
        elif mock_interview_status and not item.get("mock_interview_statuses"):
            return False

        if recommendation and item.get("analysis_recommendation") != recommendation:
            return False

        if analysis_status and item.get("analysis_status") != analysis_status:
            return False

        if placement_status and item.get("placement_statuses"):
            if placement_status not in (item.get("placement_statuses") or ""):
                return False
        elif placement_status and not item.get("placement_statuses"):
            return False

        if offer_response and item.get("offer_response") != offer_response:
            return False

        if joining_status and item.get("joining_status") != joining_status:
            return False

        return True

    @staticmethod
    def _format_mock_skills(skills) -> str:
        """Format mock interview skill ratings into a readable string."""
        if not skills:
            return "-"
        if isinstance(skills, str):
            try:
                import json
                skills = json.loads(skills)
            except Exception:
                return skills
        if isinstance(skills, list):
            parts = []
            for s in skills:
                if isinstance(s, dict):
                    name = s.get("skill") or s.get("skill_name") or s.get("name") or "Skill"
                    rating = s.get("rating")
                    level = s.get("level")
                    r_str = f"{rating}/10" if rating is not None else None
                    if level and r_str:
                        parts.append(f"{name} ({level}: {r_str})")
                    elif r_str:
                        parts.append(f"{name}: {r_str}")
                    elif level:
                        parts.append(f"{name} ({level})")
                    else:
                        parts.append(str(name))
                elif isinstance(s, str):
                    parts.append(s)
            return ", ".join(parts) if parts else "-"
        elif isinstance(skills, dict):
            return ", ".join(f"{k}: {v}" for k, v in skills.items())
        return "-"

    @staticmethod
    def _format_courses(courses) -> str:
        """Format courses JSON into a readable string."""
        if not courses:
            return "-"
        if isinstance(courses, list):
            return ", ".join(
                c if isinstance(c, str) else c.get("name", "-") for c in courses
            )
        return "-"

    @staticmethod
    def _format_duration(batch) -> str:
        """Format batch duration into a readable string."""
        if not batch:
            return "-"
        dur = batch.duration or {}
        parts = []
        if dur.get("weeks"):
            parts.append(f"{dur['weeks']}w")
        if dur.get("days"):
            parts.append(f"{dur['days']}d")
        if parts:
            return " ".join(parts)
        if batch.start_date:
            return str(batch.start_date)
        return "-"

    async def export_unified_report(
        self,
        user_email: str,
        user_name: str,
        columns: Optional[str] = None,
        **kwargs
    ) -> bool:
        """Fetch all filtered records, generate Excel workbook, and email to user."""
        import io
        import json
        from datetime import datetime, date
        from openpyxl import Workbook
        from openpyxl.styles import Font
        from app.utils.email import send_export_email

        # 1. Fetch all matching records
        res = await self.get_report(skip=0, limit=10000, **kwargs)
        items = res["items"]

        # 2. Parse column definitions
        column_defs = []
        if columns:
            try:
                column_defs = json.loads(columns)
            except Exception:
                column_defs = []

        if not column_defs:
            # Default columns if none specified
            column_defs = [
                {"id": "name", "label": "Candidate Name"},
                {"id": "gender", "label": "Gender"},
                {"id": "email", "label": "Email"},
                {"id": "phone", "label": "Phone"},
                {"id": "city", "label": "City"},
                {"id": "disability_type", "label": "Disability Type"},
                {"id": "education_level", "label": "Education Level"},
                {"id": "screening_status", "label": "Screening Status"},
                {"id": "counseling_status", "label": "Counseling Status"},
                {"id": "batch_names", "label": "Batch Name(s)"},
                {"id": "mapped_companies", "label": "Mapped Company(ies)"},
                {"id": "placement_statuses", "label": "Placement Status(es)"},
            ]

        # 3. Create Excel Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Unified CRM Report"

        # Headers
        for col_num, col_def in enumerate(column_defs, 1):
            cell = ws.cell(row=1, column=col_num, value=col_def["label"])
            cell.font = Font(bold=True)

        # Rows
        for row_num, item in enumerate(items, 2):
            for col_num, col_def in enumerate(column_defs, 1):
                col_id = col_def["id"]
                val = ""
                try:
                    if col_id.startswith("screening_others."):
                        fn = col_id.replace("screening_others.", "")
                        val = (item.get("screening_others") or {}).get(fn, "")
                    elif col_id.startswith("counseling_others."):
                        fn = col_id.replace("counseling_others.", "")
                        val = (item.get("counseling_others") or {}).get(fn, "")
                    else:
                        val = item.get(col_id, "")

                    # Formatting
                    if isinstance(val, (datetime, date)):
                        val = val.strftime("%Y-%m-%d")
                    elif isinstance(val, bool):
                        val = "Yes" if val else "No"
                    elif isinstance(val, list):
                        val = ", ".join(str(x) for x in val)
                    elif isinstance(val, dict):
                        val = json.dumps(val)
                    elif isinstance(val, str) and ("<" in val and ">" in val):
                        import re, html as py_html
                        v_clean = re.sub(r'<li[^>]*>', '• ', val)
                        v_clean = re.sub(r'</li>', '\n', v_clean)
                        v_clean = re.sub(r'</p>', '\n\n', v_clean)
                        v_clean = re.sub(r'<br\s*/?>', '\n', v_clean)
                        v_clean = re.sub(r'<[^>]+>', '', v_clean)
                        val = py_html.unescape(v_clean).strip()
                    elif val is None:
                        val = ""
                except Exception:
                    val = ""

                ws.cell(row=row_num, column=col_num, value=str(val) if val is not None else "")

        # Save to buffer
        excel_buffer = io.BytesIO()
        wb.save(excel_buffer)
        excel_buffer.seek(0)

        # 4. Send Email
        report_name = "Unified CRM Report"
        filename = f"Unified_CRM_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        return await send_export_email(
            to_email=user_email,
            user_name=user_name,
            report_name=report_name,
            file_content=excel_buffer.getvalue(),
            filename=filename
        )

