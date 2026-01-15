"""CRM Activity Endpoints"""

from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.user import User
from app.models.crm_activity_log import CRMEntityType
from app.schemas.crm_activity_log import CRMActivityLogRead
from app.services.crm_activity_log_service import CRMActivityLogService

router = APIRouter()


@router.get("/", response_model=List[CRMActivityLogRead])
async def get_recent_activities(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = Query(20, ge=1, le=100)
) -> Any:
    """Get global recent activities"""
    service = CRMActivityLogService(db)
    return await service.get_recent_activities(limit=limit)


@router.get("/entity/{entity_type}/{entity_id}", response_model=dict)
async def get_entity_activities(
    entity_type: CRMEntityType,
    entity_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
) -> Any:
    """Get history of activities for a specific entity"""
    service = CRMActivityLogService(db)
    items, total = await service.get_for_entity(
        entity_type=entity_type,
        entity_id=entity_id,
        skip=skip,
        limit=limit
    )
    return {"items": items, "total": total}


@router.get("/{public_id}", response_model=CRMActivityLogRead)
async def get_activity(
    public_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get activity log entry by public_id"""
    service = CRMActivityLogService(db)
    return await service.get_activity_log(public_id)
