from datetime import datetime, time, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, String, or_
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_document import CandidateDocument
from app.models.activity_log import ActivityLog, ActionType
from app.schemas.analytics import ManagementReportResponse, UserReportMetric, AnalyticsSummary

async def get_management_report_data(db: AsyncSession) -> ManagementReportResponse:
    """
    Get candidate management status report data grouped by user.
    """
    # 0. Define today's time range
    today_start = datetime.combine(datetime.now().date(), time.min)
    today_end = datetime.combine(datetime.now().date(), time.max)
    report_date = datetime.now().date()

    # 1. Fetch relevant users
    users_query = select(User).where(
        func.cast(User.role, String).in_([
            UserRole.SOURCING.value, 
            UserRole.MANAGER.value,  
            UserRole.TRAINER.value, 
            UserRole.COUNSELOR.value
        ]),
        User.is_deleted == False
    )
    users_result = await db.execute(users_query)
    users = users_result.scalars().all()

    # 2. Registration stats
    total_candidates_query = select(func.count(Candidate.id)).where(Candidate.is_deleted == False)
    today_candidates_query = select(func.count(Candidate.id)).where(
        Candidate.created_at >= today_start,
        Candidate.created_at <= today_end,
        Candidate.is_deleted == False
    )
    total_candidates = (await db.execute(total_candidates_query)).scalar() or 0
    today_candidates = (await db.execute(today_candidates_query)).scalar() or 0

    # 3. Aggregate Screening counts (Overall and Today)
    screening_query = select(
        CandidateScreening.screened_by_id, 
        CandidateScreening.status, 
        func.count(CandidateScreening.id)
    ).where(
        CandidateScreening.is_deleted == False
    ).group_by(
        CandidateScreening.screened_by_id, 
        CandidateScreening.status
    )
    screening_result = await db.execute(screening_query)
    screening_data = screening_result.all()

    today_screening_query = select(
        CandidateScreening.screened_by_id, 
        CandidateScreening.status, 
        func.count(CandidateScreening.id)
    ).where(
        CandidateScreening.updated_at >= today_start,
        CandidateScreening.updated_at <= today_end,
        CandidateScreening.is_deleted == False
    ).group_by(
        CandidateScreening.screened_by_id, 
        CandidateScreening.status
    )
    today_screening_result = await db.execute(today_screening_query)
    today_screening_data = today_screening_result.all()

    # 4. Aggregate Counseling counts (Overall and Today)
    counseling_query = select(
        CandidateCounseling.counselor_id, 
        CandidateCounseling.status, 
        func.count(CandidateCounseling.id)
    ).where(
        CandidateCounseling.is_deleted == False
    ).group_by(
        CandidateCounseling.counselor_id, 
        CandidateCounseling.status
    )
    counseling_result = await db.execute(counseling_query)
    counseling_data = counseling_result.all()

    today_counseling_query = select(
        CandidateCounseling.counselor_id, 
        CandidateCounseling.status, 
        func.count(CandidateCounseling.id)
    ).where(
        CandidateCounseling.updated_at >= today_start,
        CandidateCounseling.updated_at <= today_end,
        CandidateCounseling.is_deleted == False
    ).group_by(
        CandidateCounseling.counselor_id, 
        CandidateCounseling.status
    )
    today_counseling_result = await db.execute(today_counseling_query)
    today_counseling_data = today_counseling_result.all()

    # 5. Aggregate Documents Collected counts (Per User via Activity Log)
    doc_query = select(
        ActivityLog.user_id,
        func.count(func.distinct(ActivityLog.resource_id))
    ).where(
        ActivityLog.action_type == ActionType.CREATE,
        ActivityLog.resource_type == "candidate_document"
    ).group_by(
        ActivityLog.user_id
    )
    doc_result = await db.execute(doc_query)
    doc_data = dict(doc_result.all())

    # --- New Metrics Calculations ---

    # Overall Yet to Screen: Active Candidates with NO Screening record
    yet_to_screen_query = select(func.count(Candidate.id)).outerjoin(
        CandidateScreening, Candidate.id == CandidateScreening.candidate_id
    ).where(
        Candidate.is_deleted == False,
        CandidateScreening.id == None
    )
    overall_yet_to_screen = (await db.execute(yet_to_screen_query)).scalar() or 0

    # Overall Yet to Counsel: Screened & Selected, but No Counseling (or Pending)
    yet_to_counsel_query = select(func.count(Candidate.id)).join(
        CandidateScreening, Candidate.id == CandidateScreening.candidate_id
    ).outerjoin(
        CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id
    ).where(
        Candidate.is_deleted == False,
        CandidateScreening.is_deleted == False,
        CandidateScreening.status == 'Selected',
        or_(
            CandidateCounseling.id == None,
            CandidateCounseling.status == 'pending'
        )
    )
    overall_yet_to_counsel = (await db.execute(yet_to_counsel_query)).scalar() or 0

    # Overall Documents Collected (Actual count from Documents table)
    docs_collected_query = select(func.count(CandidateDocument.id)).join(
        Candidate, CandidateDocument.candidate_id == Candidate.id
    ).where(
        Candidate.is_deleted == False
    )
    overall_documents_collected = (await db.execute(docs_collected_query)).scalar() or 0

    # Overall Documents Yet to Collect
    # 7 required documents per candidate
    REQUIRED_DOCS_COUNT = 7
    total_required_docs = total_candidates * REQUIRED_DOCS_COUNT
    overall_documents_yet_to_collect = max(0, total_required_docs - overall_documents_collected)

    # --------------------------------

    # Map data to users
    user_metrics = []
    
    # helper maps
    screening_map = {}
    for user_id, status, count in screening_data:
        if user_id not in screening_map:
            screening_map[user_id] = {}
        screening_map[user_id][status or "Unknown"] = count

    today_screening_map = {}
    for user_id, status, count in today_screening_data:
        if user_id not in today_screening_map:
            today_screening_map[user_id] = {}
        today_screening_map[user_id][status or "Unknown"] = count

    counseling_map = {}
    for user_id, status, count in counseling_data:
        if user_id not in counseling_map:
            counseling_map[user_id] = {}
        counseling_map[user_id][status] = count

    today_counseling_map = {}
    for user_id, status, count in today_counseling_data:
        if user_id not in today_counseling_map:
            today_counseling_map[user_id] = {}
        today_counseling_map[user_id][status] = count

    for user in users:
        metric = UserReportMetric(
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            role=user.role.value,
            screening_counts=screening_map.get(user.id, {}),
            today_screening_counts=today_screening_map.get(user.id, {}),
            counseling_counts=counseling_map.get(user.id, {}),
            today_counseling_counts=today_counseling_map.get(user.id, {}),
            documents_collected_count=doc_data.get(user.id, 0)
        )
        user_metrics.append(metric)

    # 6. Summary
    summary = AnalyticsSummary(
        total_candidates=total_candidates,
        today_candidates=today_candidates,
        total_screened=sum(count for _, _, count in screening_data),
        total_counseled=sum(count for _, _, count in counseling_data),
        # Note: 'total_docs_collected' in simple summary vs 'overall_documents_collected'
        # We use the accurate table count for the new 'overall_' field. 
        # For consistency, let's use the same table count for 'total_docs_collected' if it represents the global state.
        total_docs_collected=overall_documents_collected,
        
        report_date=report_date,
        overall_yet_to_screen=overall_yet_to_screen,
        overall_yet_to_counsel=overall_yet_to_counsel,
        overall_documents_collected=overall_documents_collected,
        overall_documents_yet_to_collect=overall_documents_yet_to_collect
    )

    return ManagementReportResponse(
        users=user_metrics,
        summary=summary
    )
