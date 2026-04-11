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
import json
import asyncio
from typing import AsyncGenerator

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

    async def stream_message(self, session_id: int, schema: AIChatMessageCreate) -> AsyncGenerator[str, None]:
        """
        Stream the assistant response token by token via SSE.
        Persists both user and final assistant response to DB.
        """
        # 1. Load context
        session = await self.get_session_details(session_id)
        if not session:
            yield f"data: {json.dumps({'error': 'Session not found', 'status': 'failed'})}\n\n"
            return

        # 2. Persist User Message
        user_msg = AIChatMessage(
            session_id=session_id,
            role="user",
            content=schema.content
        )
        self._db.add(user_msg)
        await self._db.flush()

        # 3. History — cap at 6 messages to avoid TPM exhaustion in the planner
        history = [{
            "role": m.role, "content": m.content
        } for m in session.messages[-6:]]

        # 4. Stream from Engine
        engine = AIEngine(db=self._db, user=self._user)
        full_content = ""
        task_db_id = None

        async for event in engine.stream_chat(schema.content, history, session_id):
            # event is already formatted as "data: ...\n\n" by the engine's new impl
            # (Wait, check engine.py again - I left it yielding formatted strings)
            yield event

            # Parse for buffering
            if event.startswith("data: "):
                try:
                    payload = json.loads(event[6:])
                    if "token" in payload:
                        full_content += payload["token"]
                    if "task_db_id" in payload:
                        task_db_id = payload["task_db_id"]
                except:
                    pass

        # 5. Persist Assistant Message (once done)
        if full_content:
            assistant_msg = AIChatMessage(
                session_id=session_id,
                role="assistant",
                content=full_content,
                task_log_id=task_db_id
            )
            self._db.add(assistant_msg)
            await self._db.commit()

    async def delete_session(self, session_id: int) -> bool:
        """Permanently remove a chat thread and its messages."""
        session = await self.get_session_details(session_id)
        if not session:
            return False
            
        await self._db.delete(session)
        await self._db.commit()
        return True
