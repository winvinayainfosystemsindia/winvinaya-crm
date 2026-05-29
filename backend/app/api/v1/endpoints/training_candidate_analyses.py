"""Training Candidate Analysis Endpoints"""

from typing import List
from fastapi import APIRouter, Depends, status, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.schemas.training_candidate_analysis import (
    TrainingCandidateAnalysisCreate,
    TrainingCandidateAnalysisUpdate,
    TrainingCandidateAnalysisResponse,
)
from app.services.training_extension_service import TrainingExtensionService
from app.utils.activity_tracker import log_create, log_update, log_delete

router = APIRouter(prefix="/candidate-analyses", tags=["Training Candidate Analyses"])


@router.post("/", response_model=TrainingCandidateAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate_analysis(
    request: Request,
    analysis_in: TrainingCandidateAnalysisCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new candidate analysis record.
    """
    service = TrainingExtensionService(db)
    analysis = await service.create_candidate_analysis(analysis_in)
    
    await log_create(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_candidate_analysis",
        resource_id=analysis.id,
        created_object=analysis
    )
    return analysis


@router.get("/batch/{batch_id}", response_model=List[TrainingCandidateAnalysisResponse])
async def get_candidate_analyses_by_batch(
    batch_id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get candidate analysis records for a specific training batch.
    """
    service = TrainingExtensionService(db)
    return await service.get_candidate_analyses(batch_id)


@router.get("/{id}", response_model=TrainingCandidateAnalysisResponse)
async def get_candidate_analysis(
    id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a candidate analysis record by ID.
    """
    service = TrainingExtensionService(db)
    analysis = await service.get_candidate_analysis(id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Candidate analysis not found")
    return analysis


@router.put("/{id}", response_model=TrainingCandidateAnalysisResponse)
async def update_candidate_analysis(
    request: Request,
    id: int,
    analysis_in: TrainingCandidateAnalysisUpdate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a candidate analysis record.
    """
    service = TrainingExtensionService(db)
    
    original_analysis = await service.get_candidate_analysis(id)
    if not original_analysis:
        raise HTTPException(status_code=404, detail="Candidate analysis not found")
        
    analysis = await service.update_candidate_analysis(id, analysis_in)
    
    await log_update(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_candidate_analysis",
        resource_id=id,
        before=original_analysis,
        after=analysis
    )
    return analysis


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate_analysis(
    request: Request,
    id: int,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER])),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a candidate analysis record.
    """
    service = TrainingExtensionService(db)
    
    analysis = await service.get_candidate_analysis(id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Candidate analysis not found")
        
    await service.delete_candidate_analysis(id)
    
    await log_delete(
        db=db,
        request=request,
        user_id=current_user.id,
        resource_type="training_candidate_analysis",
        resource_id=id
    )
    return None
