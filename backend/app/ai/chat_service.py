"""
AI Engine — Chat Service
========================

Orchestrates multi-turn conversations between users and the AI Coworker.
Handles session persistence, message history retrieval, and agentic response generation.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.ai.engine import AIEngine
from app.ai.schemas import AITaskRunRequest
from app.models.ai_chat import AIChatSession, AIChatMessage
from app.models.ai_task_log import AITaskTrigger
from app.schemas.ai_chat import AIChatSessionCreate, AIChatMessageCreate

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.models.user import User

logger = logging.getLogger(__name__)


class AIChatService:
    """
    Coordinates the AI Chatbot's lifecycle.
    """

    def __init__(self, db: "AsyncSession", current_user: "User"):
        self._db = db
        self._user = current_user

    async def create_session(self, schema: AIChatSessionCreate) -> AIChatSession:
        """Initialize a new chat thread."""
        session = AIChatSession(
            user_id=self._user.id,
            title=schema.title
        )
        self._db.add(session)
        await self._db.flush() # Get ID before commit

        # Add initial greeting message
        greeting = AIChatMessage(
            session_id=session.id,
            role="assistant",
            content="Hello! I am ARIA, your AI coworker. How can I help you today?"
        )
        self._db.add(greeting)
        
        await self._db.commit()
        
        # Re-fetch with messages pre-loaded to avoid greenlet_spawn error
        return await self.get_session_details(session.id)

    async def get_sessions(self) -> list[AIChatSession]:
        """Retrieve the user's conversation history."""
        result = await self._db.execute(
            select(AIChatSession)
            .where(AIChatSession.user_id == self._user.id)
            .order_by(AIChatSession.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_session_details(self, session_id: int) -> AIChatSession | None:
        """Fetch a specific session with all its messages."""
        result = await self._db.execute(
            select(AIChatSession)
            .where(AIChatSession.id == session_id, AIChatSession.user_id == self._user.id)
            .options(selectinload(AIChatSession.messages))
        )
        return result.scalar_one_or_none()

    async def handle_message(self, session_id: int, schema: AIChatMessageCreate) -> AIChatMessage:
        """
        The main interaction point. 
        1. Persists the user message.
        2. Retrieves history for LLM context.
        3. Invokes AIEngine for an agentic response.
        4. Persists the assistant message (linked to tool logs).
        """
        # 1. Load context
        session = await self.get_session_details(session_id)
        if not session:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Chat session not found")

        # 2. Persist User Message
        user_msg = AIChatMessage(
            session_id=session_id,
            role="user",
            content=schema.content
        )
        self._db.add(user_msg)
        await self._db.flush()

        # 3. Build Conversation History Context for AI
        history = [
            {"role": m.role, "content": m.content}
            for m in session.messages[-10:] # Last 10 messages for context
        ]

        # 4. Invoke Agentic Engine
        # We wrap the chat request into an AITaskRunRequest
        engine = AIEngine(db=self._db, triggered_by_user_id=self._user.id)
        
        # We pass the history as part of the context_snapshot or similar
        # For now, let's update AIEngine to handle this properly
        ai_response = await engine.run_chat(
            user_input=schema.content,
            history=history,
            session_id=session_id
        )

        # 5. Persist Assistant Message
        # If the engine failed (e.g. LLMAuthError), we show the error message to the user
        content = ai_response.summary or "I've processed your request."
        if ai_response.status == "failed" and ai_response.error:
            if ai_response.error.startswith("AUTH_ERROR:"):
                clean_err = ai_response.error.replace("AUTH_ERROR:", "").strip()
                content = f"❌ **Configuration Error:** {clean_err}. Please check your AI Settings."
            elif ai_response.error.startswith("RATE_LIMIT:"):
                clean_err = ai_response.error.replace("RATE_LIMIT:", "").strip()
                content = f"⏳ **Rate Limit Exceeded:** {clean_err}"
            elif ai_response.error.startswith("SERVICE_ERROR:"):
                clean_err = ai_response.error.replace("SERVICE_ERROR:", "").strip()
                content = f"⚠️ **Service Provider Error:** {clean_err}"
            else:
                content = f"💥 **Unexpected Error:** {ai_response.error}"
            
        assistant_msg = AIChatMessage(
            session_id=session_id,
            role="assistant",
            content=content,
            task_log_id=ai_response.task_db_id 
        )
        self._db.add(assistant_msg)
        await self._db.commit()
        await self._db.refresh(assistant_msg)

        return assistant_msg

    async def delete_session(self, session_id: int) -> bool:
        """Permanently remove a chat thread and its messages."""
        session = await self.get_session_details(session_id)
        if not session:
            return False
            
        await self._db.delete(session)
        await self._db.commit()
        return True
