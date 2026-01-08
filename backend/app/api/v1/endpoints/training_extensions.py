"""Training Extensions Endpoints (Attendance, Assessments, Mock Interviews)"""

from typing import List
from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.training_attendance import TrainingAttendanceCreate, TrainingAttendanceResponse
from app.schemas.training_assessment import TrainingAssessmentCreate, TrainingAssessmentResponse
from app.schemas.training_mock_interview import TrainingMockInterviewCreate, TrainingMockInterviewResponse
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


@router.get("/assessments/{batch_id}", response_model=List[TrainingAssessmentResponse])
async def get_assessments(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_assessments(batch_id)


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


@router.get("/mock-interviews/{batch_id}", response_model=List[TrainingMockInterviewResponse])
async def get_mock_interviews(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    service = TrainingExtensionService(db)
    return await service.get_mock_interviews(batch_id)
