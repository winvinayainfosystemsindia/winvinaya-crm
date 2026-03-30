from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.placement_mapping import PlacementStatus
from app.schemas.placement_pipeline_history import PlacementPipelineHistoryResponse
from app.schemas.placement_mapping import PlacementMapping, PlacementMappingInDBBase
from app.services.placement_pipeline_service import PlacementPipelineService

router = APIRouter()


@router.post("/{mapping_id}/status", response_model=PlacementMappingInDBBase)
async def update_pipeline_status(
    mapping_id: int,
    to_status: PlacementStatus,
    remarks: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the pipeline status of a placement mapping and record it in history.
    """
    service = PlacementPipelineService(db)
    updated_mapping = await service.update_status(
        mapping_id=mapping_id,
        to_status=to_status,
        changed_by_id=current_user.id,
        remarks=remarks
    )
    if not updated_mapping:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Placement mapping not found"
        )
    return updated_mapping


@router.get("/{mapping_id}/history", response_model=List[PlacementPipelineHistoryResponse])
async def get_pipeline_history(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the status transition history for a specific placement mapping.
    """
    service = PlacementPipelineService(db)
    return await service.get_history(mapping_id)


@router.get("/candidate/{candidate_id}/history", response_model=List[PlacementPipelineHistoryResponse])
async def get_candidate_pipeline_history(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all status transitions for a specific candidate across all job roles.
    """
    service = PlacementPipelineService(db)
    return await service.get_candidate_history(candidate_id)
