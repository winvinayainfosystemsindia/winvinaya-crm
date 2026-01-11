"""Training Extensions Endpoints (Attendance, Assessments, Mock Interviews)"""

from typing import List
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.training_attendance import TrainingAttendanceCreate, TrainingAttendanceResponse
from app.schemas.training_assessment import TrainingAssessmentCreate, TrainingAssessmentResponse
from app.schemas.training_mock_interview import TrainingMockInterviewCreate, TrainingMockInterviewUpdate, TrainingMockInterviewResponse
from app.schemas.training_batch_event import TrainingBatchEventCreate, TrainingBatchEventResponse
from app.services.training_extension_service import TrainingExtensionService
from app.utils.activity_tracker import log_create

router = APIRouter(prefix="/training-extensions", tags=["Training Extensions"])


# Attendance
@router.post("/attendance/bulk", response_model=List[TrainingAttendanceResponse])
async def update_bulk_attendance(
    attendance_in: List[TrainingAttendanceCreate],
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.update_bulk_attendance(attendance_in)


@router.get("/attendance/{batch_id}", response_model=List[TrainingAttendanceResponse])
async def get_attendance(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_attendance(batch_id)


# Assessments
@router.post("/assessments", response_model=TrainingAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    request: Request,
    assessment_in: TrainingAssessmentCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    assessment = await service.create_assessment(assessment_in)
    
    await log_create(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_assessment",
        resource_id=assessment.id,
        created_object=assessment
    )
    return assessment


@router.post("/assessments/bulk", response_model=List[TrainingAssessmentResponse])
async def update_bulk_assessments(
    assessments_in: List[TrainingAssessmentCreate],
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.update_bulk_assessments(assessments_in)


@router.get("/assessments/{batch_id}", response_model=List[TrainingAssessmentResponse])
async def get_assessments(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_assessments(batch_id)


@router.delete("/assessments/{batch_id}/{assessment_name}", status_code=status.HTTP_200_OK)
async def delete_assessments_by_name(
    batch_id: int,
    assessment_name: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.delete_assessments_by_name(batch_id, assessment_name)


# Mock Interviews
@router.post("/mock-interviews", response_model=TrainingMockInterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_mock_interview(
    request: Request,
    mock_in: TrainingMockInterviewCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    mock = await service.create_mock_interview(mock_in)
    
    await log_create(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_mock_interview",
        resource_id=mock.id,
        created_object=mock
    )
    return mock


@router.get("/mock-interviews/batch/{batch_id}", response_model=List[TrainingMockInterviewResponse])
async def get_mock_interviews_by_batch(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_mock_interviews(batch_id)


@router.get("/mock-interviews/{id}", response_model=TrainingMockInterviewResponse)
async def get_mock_interview(
    id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    mock = await service.get_mock_interview(id)
    if not mock:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Mock interview not found")
    return mock


@router.put("/mock-interviews/{id}", response_model=TrainingMockInterviewResponse)
async def update_mock_interview(
    request: Request,
    id: int,
    mock_in: TrainingMockInterviewUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    
    # Fetch current object before update for logging
    original_mock = await service.get_mock_interview(id)
    if not original_mock:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Mock interview not found")
        
    mock = await service.update_mock_interview(id, mock_in)
    
    from app.utils.activity_tracker import log_update
    await log_update(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_mock_interview",
        resource_id=id,
        before=original_mock,
        after=mock
    )
    return mock


@router.delete("/mock-interviews/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mock_interview(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    success = await service.delete_mock_interview(id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Mock interview not found")
    
    from app.utils.activity_tracker import log_delete
    await log_delete(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_mock_interview",
        resource_id=id
    )
    return None


# Batch Events (Holidays)
@router.post("/events", response_model=TrainingBatchEventResponse, status_code=status.HTTP_201_CREATED)
async def create_batch_event(
    event_in: TrainingBatchEventCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.create_batch_event(event_in)


@router.get("/events/{batch_id}", response_model=List[TrainingBatchEventResponse])
async def get_batch_events(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_batch_events(batch_id)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_batch_event(
    event_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    await service.delete_batch_event(event_id)
    return None
