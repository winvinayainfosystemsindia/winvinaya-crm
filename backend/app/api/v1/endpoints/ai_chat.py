"""AI Engine — Chat API Endpoints"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.ai.chat_service import AIChatService
from app.models.user import User
from app.schemas.ai_chat import (
    AIChatSessionRead,
    AIChatSessionCreate,
    AIChatSessionDetail,
    AIChatMessageCreate,
    AIChatMessageRead,
    AIChatResponse,
)

router = APIRouter()


@router.post("/sessions", response_model=AIChatSessionRead)
async def create_chat_session(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    session_in: AIChatSessionCreate,
) -> Any:
    """Start a new conversation with the AI Coworker."""
    service = AIChatService(db, current_user)
    return await service.create_session(session_in)


@router.get("/sessions", response_model=list[AIChatSessionRead])
async def list_chat_sessions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve history of AI conversations."""
    service = AIChatService(db, current_user)
    return await service.get_sessions()


@router.get("/sessions/{session_id}", response_model=AIChatSessionDetail)
async def get_chat_session(
    session_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get full details and message history of a chat session."""
    service = AIChatService(db, current_user)
    session = await service.get_session_details(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/messages", response_model=AIChatResponse)
async def send_chat_message(
    session_id: int,
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    message_in: AIChatMessageCreate,
) -> Any:
    """
    Send a message to the AI and get an agentic response.
    The response may include metadata about background tasks/tools triggered.
    """
    service = AIChatService(db, current_user)
    
    # handle_message returns the assistant's message object
    assistant_msg = await service.handle_message(session_id, message_in)
    
    # Build response including the task log public_id if available
    task_public_id = None
    if assistant_msg.task_log:
        task_public_id = assistant_msg.task_log.public_id
        
    return AIChatResponse(
        session_id=uuid.uuid4(), # Placeholder or actual session UUID
        reply=assistant_msg,
        task_id=task_public_id
    )
