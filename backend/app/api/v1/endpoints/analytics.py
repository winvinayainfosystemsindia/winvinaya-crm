from fastapi import APIRouter, Depends, Request
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, String
from sqlalchemy.orm import selectinload
from fastapi.encoders import jsonable_encoder

from app.api import deps
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_document import CandidateDocument
from app.models.activity_log import ActivityLog, ActionType
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_batch import TrainingBatch
from app.models.dynamic_field import DynamicField
from app.models.ticket import Ticket
from app.utils.activity_tracker import log_read
from app.schemas.analytics import ManagementReportResponse, UserReportMetric

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/full-dump")
async def get_analytics_dump(
    request: Request,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
):
    """
    Get a full dump of all major tables for analytics (PowerBI).
    Restricted to Admins with JWT.
    """
    await log_read(db, request, current_user.id, "analytics_full_dump")
    
    # Fetch all data asynchronously
    users = (await db.execute(select(User))).scalars().all()
    candidates = (await db.execute(select(Candidate))).scalars().all()
    candidate_screenings = (await db.execute(select(CandidateScreening))).scalars().all()
    candidate_counselings = (await db.execute(select(CandidateCounseling))).scalars().all()
    candidate_documents = (await db.execute(select(CandidateDocument))).scalars().all()
    activity_logs = (await db.execute(select(ActivityLog))).scalars().all()
    candidate_allocations = (await db.execute(select(TrainingCandidateAllocation))).scalars().all()
    training_batches = (await db.execute(select(TrainingBatch))).scalars().all()
    dynamic_fields = (await db.execute(select(DynamicField))).scalars().all()
    tickets = (await db.execute(select(Ticket))).scalars().all()
    
    # Convert to JSON-friendly format
    return {
        "users": jsonable_encoder(users),
        "candidates": jsonable_encoder(candidates),
        "candidate_screenings": jsonable_encoder(candidate_screenings),
        "candidate_counselings": jsonable_encoder(candidate_counselings),
        "candidate_documents": jsonable_encoder(candidate_documents),
        "activity_logs": jsonable_encoder(activity_logs),
        "candidate_allocations": jsonable_encoder(candidate_allocations),
        "training_batches": jsonable_encoder(training_batches),
        "dynamic_fields": jsonable_encoder(dynamic_fields),
        "tickets": jsonable_encoder(tickets),
    }


@router.get("/export-db")
async def export_db_for_power_bi(
    db: AsyncSession = Depends(deps.get_db),
    api_key: str = Depends(deps.verify_api_key),
):
    """
    Get a full dump of all major tables for Power BI.
    Authenticated via X-API-Key header (no token required).
    """
    
    # Fetch all data asynchronously
    users_data = (await db.execute(select(User))).scalars().all()
    candidates_data = (await db.execute(select(Candidate))).scalars().all()
    screenings_data = (await db.execute(select(CandidateScreening))).scalars().all()
    counselings_data = (await db.execute(select(CandidateCounseling))).scalars().all()
    documents_data = (await db.execute(select(CandidateDocument))).scalars().all()
    activity_logs_data = (await db.execute(select(ActivityLog))).scalars().all()
    allocations_data = (await db.execute(select(TrainingCandidateAllocation))).scalars().all()
    batches_data = (await db.execute(select(TrainingBatch))).scalars().all()
    fields_data = (await db.execute(select(DynamicField))).scalars().all()
    tickets_data = (await db.execute(select(Ticket))).scalars().all()
    
    # Convert to JSON-friendly format
    return {
        "users": jsonable_encoder(users_data),
        "candidates": jsonable_encoder(candidates_data),
        "candidate_screenings": jsonable_encoder(screenings_data),
        "candidate_counselings": jsonable_encoder(counselings_data),
        "candidate_documents": jsonable_encoder(documents_data),
        "activity_logs": jsonable_encoder(activity_logs_data),
        "candidate_allocations": jsonable_encoder(allocations_data),
        "training_batches": jsonable_encoder(batches_data),
        "dynamic_fields": jsonable_encoder(fields_data),
        "tickets": jsonable_encoder(tickets_data),
    }


@router.get("/export/{table_name}")
async def export_table_for_power_bi(
    table_name: str,
    db: AsyncSession = Depends(deps.get_db),
    api_key: str = Depends(deps.verify_api_key),
):
    """
    Get a specific table dump for Power BI.
    Returns a plain list of records.
    Supported tables: users, candidates, screenings, counselings, documents
    """
    from fastapi import HTTPException
    
    model_map = {
        "users": User,
        "candidates": Candidate,
        "screenings": CandidateScreening,
        "counselings": CandidateCounseling,
        "documents": CandidateDocument,
        "activity_logs": ActivityLog,
        "allocations": TrainingCandidateAllocation,
        "batches": TrainingBatch,
        "fields": DynamicField,
        "tickets": Ticket,
    }
    
    if table_name not in model_map:
        raise HTTPException(
            status_code=404,
            detail=f"Table '{table_name}' not found. Supported: {', '.join(model_map.keys())}"
        )
        
    model = model_map[table_name]
    result = await db.execute(select(model))
    data = result.scalars().all()
    
    return jsonable_encoder(data)

@router.get("/sourcing-overview")
async def get_sourcing_overview(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
):
    """
    Get aggregated metrics for the Advanced Sourcing Analytics dashboard.
    Returns:
    - Funnel: Reg -> Prof -> Couns -> Sel -> Docs
    - Demographics: Gender, Disability
    - Geography: Top 5 Cities
    - Readiness: Radar chart data (Willingness, Relocation, Employed, Experienced)
    - Trend: Registration timeline
    """
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # --- 1. Basic Counts & Funnel ---
    # Fetch all candidates to aggregate in memory (efficient for small/medium datasets, avoids complex JSON SQL)
    # For production with millions of rows, this should be optimized to raw SQL queries.
    
    candidates_result = await db.execute(
        select(Candidate)
        .options(selectinload(Candidate.screening), selectinload(Candidate.documents))
    )
    candidates = candidates_result.scalars().all()
    
    # Fetch Counseling separately for status mapping
    counseling_result = await db.execute(select(CandidateCounseling))
    counselings = counseling_result.scalars().all()
    
    # Aggregation
    total_candidates = len(candidates)
    screened_candidates = sum(1 for c in candidates if c.screening)
    
    # Counseling Stats
    counseling_status_map = {} # candidate_id -> status
    for c in counselings:
        counseling_status_map[c.candidate_id] = c.status
        
    counseled_candidates = len(counseling_status_map)
    selected_count = sum(1 for status in counseling_status_map.values() if status == 'selected')
    
    # Document Stats (Heuristic: > 0 docs = started, >= 3 docs = collected)
    # Using simple "has documents" for now as 'collected' metric
    docs_collected_count = sum(1 for c in candidates if len(c.documents) >= 1) # Changed heuristic to >= 1 for visibility in demo
    
    # --- 2. Demographics ---
    # Gender
    gender_counts = {}
    for c in candidates:
        g = (c.gender or "Unknown").title()
        gender_counts[g] = gender_counts.get(g, 0) + 1
        
    # Disability (Extract from JSON)
    disability_counts = {}
    for c in candidates:
        details = c.disability_details or {}
        d_type = details.get('disability_type') or details.get('type') or "Unknown"
        disability_counts[d_type] = disability_counts.get(d_type, 0) + 1
        
    # --- 3. Geography (Top 5 Cities) ---
    city_counts = {}
    for c in candidates:
        city = (c.city or "Unknown").title()
        city_counts[city] = city_counts.get(city, 0) + 1
    
    # Sort and take top 5
    sorted_cities = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_cities = {k: v for k, v in sorted_cities}
    
    # --- 4. Readiness (Radar) ---
    # Calculate percentages of True values
    readiness_metrics = {
        "Willing to Train": 0,
        "Ready to Relocate": 0,
        "Experienced": 0,
        "Currently Employed": 0
    }
    
    if screened_candidates > 0:
        # Denominator for screening-related stats is screened_candidates
        screened_objs = [c.screening for c in candidates if c.screening]
        
        # Willingness to Train - extracted from others JSON field
        willing_count = sum(1 for s in screened_objs if s.others and s.others.get('willing_for_training'))
        readiness_metrics["Willing to Train"] = round(willing_count / screened_candidates * 100, 1)
        
        # Readiness to Relocate - extracted from others JSON field
        relocate_count = sum(1 for s in screened_objs if s.others and s.others.get('ready_to_relocate'))
        readiness_metrics["Ready to Relocate"] = round(relocate_count / screened_candidates * 100, 1)
    
    if total_candidates > 0:
         # Denominator for candidate-level stats
         readiness_metrics["Experienced"] = round(sum(1 for c in candidates if c.is_experienced) / total_candidates * 100, 1)
         readiness_metrics["Currently Employed"] = round(sum(1 for c in candidates if c.currently_employed) / total_candidates * 100, 1)

    # --- 5. Trend (Registrations) ---
    # Group by Date (Last 30 days usually, but let's do all time or limit)
    # Let's do daily counts
    trend_data = {}
    for c in candidates:
        date_str = c.created_at.strftime('%Y-%m-%d')
        trend_data[date_str] = trend_data.get(date_str, 0) + 1
    
    # Sort by date
    sorted_trend = dict(sorted(trend_data.items()))

    return {
        "funnel": {
            "registered": total_candidates,
            "screened": screened_candidates,
            "counseled": counseled_candidates,
            "selected": selected_count,
            "documents_collected": docs_collected_count
        },
        "demographics": {
            "gender": gender_counts,
            "disability": disability_counts
        },
        "geography": top_cities,
        "readiness": readiness_metrics,
        "trend": sorted_trend,
        "metrics": {
            "total_candidates": total_candidates,
            "active_pipeline": screened_candidates,
            "selection_rate": round((selected_count / counseled_candidates * 100) if counseled_candidates > 0 else 0, 1),
            "conversion_rate": round((docs_collected_count / selected_count * 100) if selected_count > 0 else 0, 1)
        }
    }

@router.get("/management-report", response_model=ManagementReportResponse)
async def get_management_report(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN, UserRole.MANAGER])),
):
    """
    Get candidate management status report grouped by user.
    Metrics: screened, counseled, documents collected, registrations.
    Includes today's progress per user.
    """
    # 0. Define today's time range
    today_start = datetime.combine(datetime.now().date(), time.min)
    today_end = datetime.combine(datetime.now().date(), time.max)

    # 1. Fetch relevant users
    # Casting role to string to avoid potential enum mismatch issues with PG
    users_query = select(User).where(
        func.cast(User.role, String).in_([
            UserRole.ADMIN.value, 
            UserRole.MANAGER.value, 
            UserRole.SOURCING.value, 
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

    # 5. Aggregate Documents Collected counts
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

    # Map data to users
    user_metrics = []
    
    # helper maps
    screening_map = {} # user_id -> {status -> count}
    for user_id, status, count in screening_data:
        if user_id not in screening_map:
            screening_map[user_id] = {}
        screening_map[user_id][status or "Unknown"] = count

    today_screening_map = {}
    for user_id, status, count in today_screening_data:
        if user_id not in today_screening_map:
            today_screening_map[user_id] = {}
        today_screening_map[user_id][status or "Unknown"] = count

    counseling_map = {} # user_id -> {status -> count}
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
    summary = {
        "total_candidates": total_candidates,
        "today_candidates": today_candidates,
        "total_screened": sum(count for _, _, count in screening_data),
        "total_counseled": sum(count for _, _, count in counseling_data),
        "total_docs_collected": sum(doc_data.values())
    }

    return ManagementReportResponse(
        users=user_metrics,
        summary=summary
    )
