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
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

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


@router.get("/management-report", response_model=ManagementReportResponse)
async def get_management_report(
    db: AsyncSession = Depends(deps.get_db),
    api_key: str = Depends(deps.verify_api_key)
):
    """
    Get candidate management status report grouped by user.
    Metrics: screened, counseled, documents collected, registrations.
    Includes today's progress per user.
    """
    return await analytics_service.get_management_report_data(db)
