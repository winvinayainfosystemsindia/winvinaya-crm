"""Unified Report API endpoint — single endpoint for all report data"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import json
from loguru import logger
import sys

from app.core.database import get_db, AsyncSessionLocal
from app.api.deps import get_current_user
from app.models.user import User
from app.services.unified_report_service import UnifiedReportService

router = APIRouter(prefix="/unified-report", tags=["Unified Report"])


async def _run_export_unified_report(
    user_id: int,
    user_email: str,
    user_name: str,
    columns: Optional[str] = None,
    **kwargs
):
    """Wrapper to run unified report export in background with its own DB session"""
    print(f"DEBUG: Background task STARTING for unified report export (User: {user_email})")
    sys.stdout.flush()
    logger.info(f"Background task STARTED for unified report export (User: {user_email})")
    try:
        async with AsyncSessionLocal() as db:
            service = UnifiedReportService(db)
            await service.export_unified_report(
                user_email=user_email,
                user_name=user_name,
                columns=columns,
                **kwargs
            )
        logger.info(f"Background task COMPLETED for unified report export (User: {user_email})")
        print(f"DEBUG: Background task COMPLETED for unified report export (User: {user_email})")
        sys.stdout.flush()
    except Exception as e:
        logger.error(f"Background task FAILED for unified report export: {str(e)}", exc_info=True)
        print(f"DEBUG: Background task FAILED for unified report export: {str(e)}")
        sys.stdout.flush()


@router.get("")
async def get_unified_report(
    # Pagination
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    # Candidate filters
    gender: Optional[str] = Query(None),
    disability_types: Optional[str] = Query(None),
    education_levels: Optional[str] = Query(None),
    cities: Optional[str] = Query(None),
    disability_percentages: Optional[str] = Query(None),
    year_of_passing: Optional[str] = Query(None),
    year_of_experience: Optional[str] = Query(None),
    is_experienced: Optional[bool] = Query(None),
    currently_employed: Optional[bool] = Query(None),
    registration_type: Optional[str] = Query(None),
    status_of_beneficiary: Optional[str] = Query(None),
    created_from: Optional[str] = Query(None),
    created_to: Optional[str] = Query(None),
    # Screening filters
    screening_status: Optional[str] = Query(None),
    consent_status: Optional[str] = Query(None),
    screening_reason: Optional[str] = Query(None),
    # Counseling filters
    counseling_status: Optional[str] = Query(None),
    # Document filters
    has_resume: Optional[bool] = Query(None),
    has_disability_cert: Optional[bool] = Query(None),
    # Training filters
    batch_ids: Optional[str] = Query(None),
    batch_tag: Optional[str] = Query(None),
    training_status: Optional[str] = Query(None),
    is_dropout: Optional[bool] = Query(None),
    # Mock interview filters
    mock_interview_status: Optional[str] = Query(None),
    # Analysis filters
    recommendation: Optional[str] = Query(None),
    # Placement filters
    company_id: Optional[int] = Query(None),
    job_role_id: Optional[str] = Query(None),
    placement_status: Optional[str] = Query(None),
    offer_response: Optional[str] = Query(None),
    joining_status: Optional[str] = Query(None),
    # Dynamic field filters (JSON string)
    extra_filters: Optional[str] = Query(None),
    # Auth
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get unified report data — one row per candidate with all module data.
    All one-to-many relationships (allocations, placements, mock interviews)
    are returned as comma-separated values per candidate row.
    """
    parsed_extra_filters = None
    if extra_filters:
        try:
            parsed_extra_filters = json.loads(extra_filters)
        except json.JSONDecodeError:
            parsed_extra_filters = {}
            for part in extra_filters.split("&"):
                if "=" in part:
                    k, v = part.split("=", 1)
                    parsed_extra_filters[k] = v

    service = UnifiedReportService(db)
    result = await service.get_report(
        skip=skip,
        limit=limit,
        search=search,
        gender=gender,
        disability_types=disability_types,
        education_levels=education_levels,
        cities=cities,
        disability_percentages=disability_percentages,
        year_of_passing=year_of_passing,
        year_of_experience=year_of_experience,
        is_experienced=is_experienced,
        currently_employed=currently_employed,
        registration_type=registration_type,
        status_of_beneficiary=status_of_beneficiary,
        created_from=created_from,
        created_to=created_to,
        screening_status=screening_status,
        consent_status=consent_status,
        screening_reason=screening_reason,
        counseling_status=counseling_status,
        has_resume=has_resume,
        has_disability_cert=has_disability_cert,
        batch_ids=batch_ids,
        batch_tag=batch_tag,
        training_status=training_status,
        is_dropout=is_dropout,
        mock_interview_status=mock_interview_status,
        recommendation=recommendation,
        company_id=company_id,
        job_role_id=job_role_id,
        placement_status=placement_status,
        offer_response=offer_response,
        joining_status=joining_status,
        extra_filters=parsed_extra_filters,
    )

    return result


@router.post("/export")
async def export_unified_report(
    background_tasks: BackgroundTasks,
    # All the same filters
    search: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    disability_types: Optional[str] = Query(None),
    education_levels: Optional[str] = Query(None),
    cities: Optional[str] = Query(None),
    disability_percentages: Optional[str] = Query(None),
    year_of_passing: Optional[str] = Query(None),
    year_of_experience: Optional[str] = Query(None),
    is_experienced: Optional[bool] = Query(None),
    currently_employed: Optional[bool] = Query(None),
    registration_type: Optional[str] = Query(None),
    status_of_beneficiary: Optional[str] = Query(None),
    created_from: Optional[str] = Query(None),
    created_to: Optional[str] = Query(None),
    screening_status: Optional[str] = Query(None),
    consent_status: Optional[str] = Query(None),
    screening_reason: Optional[str] = Query(None),
    counseling_status: Optional[str] = Query(None),
    has_resume: Optional[bool] = Query(None),
    has_disability_cert: Optional[bool] = Query(None),
    batch_ids: Optional[str] = Query(None),
    batch_tag: Optional[str] = Query(None),
    training_status: Optional[str] = Query(None),
    is_dropout: Optional[bool] = Query(None),
    mock_interview_status: Optional[str] = Query(None),
    recommendation: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    job_role_id: Optional[str] = Query(None),
    placement_status: Optional[str] = Query(None),
    offer_response: Optional[str] = Query(None),
    joining_status: Optional[str] = Query(None),
    extra_filters: Optional[str] = Query(None),
    columns: Optional[str] = Query(None),
    # Auth
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Triggers export of all matching unified report records in a background task
    and sends the Excel file as an email attachment to the user's email address.
    """
    parsed_extra_filters = None
    if extra_filters:
        try:
            parsed_extra_filters = json.loads(extra_filters)
        except json.JSONDecodeError:
            parsed_extra_filters = {}

    background_tasks.add_task(
        _run_export_unified_report,
        user_id=current_user.id,
        user_email=current_user.email,
        user_name=current_user.full_name or current_user.username,
        columns=columns,
        search=search,
        gender=gender,
        disability_types=disability_types,
        education_levels=education_levels,
        cities=cities,
        disability_percentages=disability_percentages,
        year_of_passing=year_of_passing,
        year_of_experience=year_of_experience,
        is_experienced=is_experienced,
        currently_employed=currently_employed,
        registration_type=registration_type,
        status_of_beneficiary=status_of_beneficiary,
        created_from=created_from,
        created_to=created_to,
        screening_status=screening_status,
        consent_status=consent_status,
        screening_reason=screening_reason,
        counseling_status=counseling_status,
        has_resume=has_resume,
        has_disability_cert=has_disability_cert,
        batch_ids=batch_ids,
        batch_tag=batch_tag,
        training_status=training_status,
        is_dropout=is_dropout,
        mock_interview_status=mock_interview_status,
        recommendation=recommendation,
        company_id=company_id,
        job_role_id=job_role_id,
        placement_status=placement_status,
        offer_response=offer_response,
        joining_status=joining_status,
        extra_filters=parsed_extra_filters,
    )

    return {
        "message": f"Export process started. The Excel report will be sent to {current_user.email} shortly."
    }
