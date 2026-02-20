"""Candidate Endpoints"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status, Request, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.rate_limiter import rate_limit_medium
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.candidate import CandidateCreate, CandidateResponse, CandidateUpdate, CandidateListResponse, CandidateStats, CandidatePaginatedResponse, CandidateCheck
from app.services.candidate_service import CandidateService
from app.utils.activity_tracker import log_create, log_update, log_delete
from app.utils.email import send_registration_emails


router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
@rate_limit_medium()
async def register_candidate(
    request: Request,
    candidate_in: CandidateCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new candidate (Public access)
    """
    # No auth dependency here - public self-registration
    service = CandidateService(db)
    candidate = await service.create_candidate(candidate_in)
    
    # Send registration emails in background
    background_tasks.add_task(send_registration_emails, candidate)
    
    # Log the registration
    await log_create(
        db=db,
        request=request,
        user_id=None, # Public self-registration
        resource_type="candidate",
        resource_id=candidate.id,
        created_object=candidate
    )
    
    return candidate


@router.post("/check-availability")
@rate_limit_medium()
async def check_candidate_availability(
    request: Request,
    check_in: CandidateCheck,
    db: AsyncSession = Depends(get_db)
):
    """
    Check if email/phone are available and validate pincode (Public access)
    """
    service = CandidateService(db)
    # This will raise HTTPException if invalid/duplicate
    address_details = await service.validate_personal_info(
        check_in.email, 
        check_in.phone, 
        check_in.pincode
    )
    return {"status": "available", "address": address_details}


@router.get("/", response_model=CandidatePaginatedResponse)
@rate_limit_medium()
async def get_candidates(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    sort_by: str = None,
    sort_order: str = "desc",
    disability_types: str = None,  # Comma-separated list
    education_levels: str = None,  # Comma-separated list
    cities: str = None,  # Comma-separated list
    counseling_status: str = None,
    is_experienced: bool = None,
    screening_status: str = None,
    disability_percentages: str = None, # Comma-separated list (or single range string)
    screening_reasons: str = None, # Comma-separated list
    gender: str = None,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of candidates (Restricted)
    Returns simplified candidate list without nested relationships.
    Supports filtering by disability_types, education_levels, cities, and counseling_status.
    """
    # Parse comma-separated filters into lists
    disability_types_list = disability_types.split(',') if disability_types else None
    education_levels_list = education_levels.split(',') if education_levels else None
    cities_list = cities.split(',') if cities else None
    disability_percentages_list = disability_percentages.split(',') if disability_percentages else None
    screening_reasons_list = screening_reasons.split(',') if screening_reasons else None
    
    # Collect dynamic filters from query params
    extra_filters = {}
    for key, value in request.query_params.items():
        if key.startswith(('screening_others.', 'counseling_others.')):
            extra_filters[key] = value

    service = CandidateService(db)
    return await service.get_candidates(
        skip=skip, 
        limit=limit, 
        search=search, 
        sort_by=sort_by, 
        sort_order=sort_order,
        disability_types=disability_types_list,
        education_levels=education_levels_list,
        cities=cities_list,
        counseling_status=counseling_status,
        is_experienced=is_experienced,
        screening_status=screening_status,
        disability_percentages=disability_percentages_list,
        screening_reasons=screening_reasons_list,
        gender=gender,
        extra_filters=extra_filters
    )





@router.get("/filter-options")
@rate_limit_medium()
async def get_filter_options(
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all unique values for filterable fields (Restricted)
    Returns disability types, education levels, cities, and counseling statuses
    from ALL candidates in the database (not just current page)
    """
    service = CandidateService(db)
    return await service.get_filter_options()


@router.get("/stats", response_model=CandidateStats)
@rate_limit_medium()
async def get_candidate_stats(
    request: Request,
    assigned_to_user_id: Optional[int] = Query(None),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get candidate statistics (Restricted)
    """
    service = CandidateService(db)
    return await service.get_stats(assigned_to_user_id=assigned_to_user_id)


@router.get("/unscreened", response_model=CandidatePaginatedResponse)
@rate_limit_medium()
async def get_unscreened_candidates(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    sort_by: str = None,
    sort_order: str = "desc",
    disability_types: str = None,
    education_levels: str = None,
    cities: str = None,
    screening_status: str = None,
    is_experienced: bool = None,
    counseling_status: str = None,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),

    db: AsyncSession = Depends(get_db)
):
    """
    Get list of candidates without screening records (Restricted)
    """
    disability_types_list = disability_types.split(',') if disability_types else None
    education_levels_list = education_levels.split(',') if education_levels else None
    cities_list = cities.split(',') if cities else None

    # Role-based assignment filtering
    assigned_to_user_id = None
    if current_user.role in [UserRole.TRAINER, UserRole.SOURCING]:
        assigned_to_user_id = current_user.id

    service = CandidateService(db)
    return await service.get_unscreened_candidates(
        skip=skip, 
        limit=limit, 
        search=search, 
        sort_by=sort_by, 
        sort_order=sort_order,
        disability_types=disability_types_list,
        education_levels=education_levels_list,
        cities=cities_list,
        screening_status=screening_status,
        is_experienced=is_experienced,
        counseling_status=counseling_status,
        assigned_to_user_id=assigned_to_user_id
    )



@router.get("/screened", response_model=CandidatePaginatedResponse)
@rate_limit_medium()
async def get_screened_candidates(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    counseling_status: str = None, # 'pending' or 'counseled'
    document_status: str = None, # 'pending' or 'collected'
    search: str = None,
    sort_by: str = None,
    sort_order: str = "desc",
    disability_types: str = None,
    education_levels: str = None,
    cities: str = None,
    screening_status: str = None,
    is_experienced: bool = None,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of candidates with screening records (Restricted)
    Returns list with basic candidate info.
    """
    disability_types_list = disability_types.split(',') if disability_types else None
    education_levels_list = education_levels.split(',') if education_levels else None
    cities_list = cities.split(',') if cities else None

    # Role-based assignment filtering
    assigned_to_user_id = None
    if current_user.role in [UserRole.TRAINER, UserRole.SOURCING]:
        assigned_to_user_id = current_user.id

    service = CandidateService(db)
    return await service.get_screened_candidates(
        skip=skip, 
        limit=limit, 
        counseling_status=counseling_status, 
        search=search, 
        document_status=document_status, 
        sort_by=sort_by, 
        sort_order=sort_order,
        disability_types=disability_types_list,
        education_levels=education_levels_list,
        cities=cities_list,
        screening_status=screening_status,
        is_experienced=is_experienced,
        assigned_to_user_id=assigned_to_user_id
    )




@router.get("/{public_id}", response_model=CandidateResponse)
@rate_limit_medium()
async def get_candidate(
    request: Request,
    public_id: UUID,
    with_details: bool = True,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get candidate details by public_id (UUID) (Restricted)
    Set with_details=true to include screening, documents, and counseling data.
    """
    service = CandidateService(db)
    return await service.get_candidate(public_id, with_details=with_details)


@router.put("/{public_id}", response_model=CandidateResponse)
@rate_limit_medium()
async def update_candidate(
    request: Request,
    public_id: UUID,
    candidate_in: CandidateUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.SOURCING, UserRole.TRAINER, UserRole.PLACEMENT, UserRole.COUNSELOR])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update candidate by public_id (UUID) (Admin/Manager only)
    """
    service = CandidateService(db)
    
    # Get before state
    existing_candidate = await service.get_candidate(public_id)
    
    updated_candidate = await service.update_candidate(public_id, candidate_in)
    
    # Log the update
    await log_update(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="candidate",
        resource_id=updated_candidate.id,
        before=existing_candidate,
        after=updated_candidate
    )
    
    return updated_candidate


@router.delete("/{public_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit_medium()
async def delete_candidate(
    request: Request,
    public_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete candidate by public_id (UUID) (Admin only)
    """
    service = CandidateService(db)
    # Get candidate info before deleting for logging if needed
    candidate = await service.get_candidate(public_id)
    
    await service.delete_candidate(public_id)
    
    # Log the deletion
    await log_delete(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="candidate",
        resource_id=candidate.id
    )
    
    return None

