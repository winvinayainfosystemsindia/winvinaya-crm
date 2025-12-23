from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from fastapi.encoders import jsonable_encoder

from app.api import deps
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_document import CandidateDocument

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/full-dump")
async def get_analytics_dump(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN])),
):
    """
    Get a full dump of all major tables for analytics (PowerBI).
    Restricted to Admins with JWT.
    """
    
    # Fetch all data asynchronously
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()

    candidates_result = await db.execute(select(Candidate))
    candidates = candidates_result.scalars().all()

    screenings_result = await db.execute(select(CandidateScreening))
    candidate_screenings = screenings_result.scalars().all()

    counseling_result = await db.execute(select(CandidateCounseling))
    candidate_counselings = counseling_result.scalars().all()
    
    documents_result = await db.execute(select(CandidateDocument))
    candidate_documents = documents_result.scalars().all()
    
    # Convert to JSON-friendly format
    return {
        "users": jsonable_encoder(users),
        "candidates": jsonable_encoder(candidates),
        "candidate_screenings": jsonable_encoder(candidate_screenings),
        "candidate_counselings": jsonable_encoder(candidate_counselings),
        "candidate_documents": jsonable_encoder(candidate_documents),
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
    users_result = await db.execute(select(User))
    users_data = users_result.scalars().all()

    candidates_result = await db.execute(select(Candidate))
    candidates_data = candidates_result.scalars().all()

    screenings_result = await db.execute(select(CandidateScreening))
    screenings_data = screenings_result.scalars().all()

    counseling_result = await db.execute(select(CandidateCounseling))
    counselings_data = counseling_result.scalars().all()
    
    documents_result = await db.execute(select(CandidateDocument))
    documents_data = documents_result.scalars().all()
    
    # Convert to JSON-friendly format
    return {
        "users": jsonable_encoder(users_data),
        "candidates": jsonable_encoder(candidates_data),
        "candidate_screenings": jsonable_encoder(screenings_data),
        "candidate_counselings": jsonable_encoder(counselings_data),
        "candidate_documents": jsonable_encoder(documents_data),
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
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING])),
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
