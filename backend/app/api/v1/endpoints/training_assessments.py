"""Training Assessment Endpoints"""

from typing import List
from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.training_assessment import TrainingAssessmentCreate, TrainingAssessmentResponse
from app.services.training_extension_service import TrainingExtensionService
from app.utils.activity_tracker import log_create, log_update, log_delete

router = APIRouter(prefix="/assessments", tags=["Training Assessments"])



@router.post("/", response_model=TrainingAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    request: Request,
    assessment_in: TrainingAssessmentCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new training assessment record.
    """
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


@router.post("/bulk", response_model=List[TrainingAssessmentResponse])
async def update_bulk_assessments(
    request: Request,
    assessments_in: List[TrainingAssessmentCreate],
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update bulk assessment records for a training batch.
    """
    service = TrainingExtensionService(db)
    records = await service.update_bulk_assessments(assessments_in)
    
    await log_update(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_assessment",
        resource_id=0, # Bulk updated
        before={"action": "bulk_update_start"},
        after={"count": len(records)}
    )
    
    return records


@router.get("/{batch_id}", response_model=List[TrainingAssessmentResponse])
async def get_assessments(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get assessments for a specific training batch.
    """
    service = TrainingExtensionService(db)
    return await service.get_assessments(batch_id)


@router.delete("/{batch_id}/{assessment_name}", status_code=status.HTTP_200_OK)
async def delete_assessments_by_name(
    request: Request,
    batch_id: int,
    assessment_name: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete all assessment records with a specific name in a batch.
    """
    service = TrainingExtensionService(db)
    result = await service.delete_assessments_by_name(batch_id, assessment_name)
    
    await log_delete(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_assessment",
        resource_id=batch_id, # Scoped to batch
        # We could add info in data if needed
    )
    
    return result
