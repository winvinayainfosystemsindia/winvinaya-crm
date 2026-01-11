from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.core.database import get_db
from app.models.user import User
from app.schemas.mock_interview import MockInterview, MockInterviewCreate, MockInterviewUpdate
from app.services.mock_interview_service import MockInterviewService

router = APIRouter()

@router.get("/", response_model=List[MockInterview])
async def read_mock_interviews(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve mock interviews.
    """
    service = MockInterviewService(db)
    return await service.get_mock_interviews(skip=skip, limit=limit)

@router.get("/batch/{batch_id}", response_model=List[MockInterview])
async def read_mock_interviews_by_batch(
    batch_id: int,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve mock interviews for a specific batch.
    """
    service = MockInterviewService(db)
    return await service.get_mock_interviews_by_batch(batch_id, skip=skip, limit=limit)

@router.post("/", response_model=MockInterview)
async def create_mock_interview(
    *,
    db: AsyncSession = Depends(get_db),
    mock_interview_in: MockInterviewCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new mock interview.
    """
    service = MockInterviewService(db)
    return await service.create_mock_interview(mock_interview_in)

@router.put("/{id}", response_model=MockInterview)
async def update_mock_interview(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    mock_interview_in: MockInterviewUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a mock interview.
    """
    service = MockInterviewService(db)
    return await service.update_mock_interview(id, mock_interview_in)

@router.delete("/{id}")
async def delete_mock_interview(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a mock interview.
    """
    service = MockInterviewService(db)
    await service.delete_mock_interview(id)
    return {"message": "Mock interview deleted successfully"}
