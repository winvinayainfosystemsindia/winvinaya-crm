from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.ai_service import AIService
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> Any:
    """
    Send a message to the AI chatbot and receive a response.
    """
    ai_service = AIService(db)
    await ai_service.initialize()
    
    # Convert ChatMessage models to list of dicts for the service
    history_dicts = [{"role": h.role, "content": h.content} for h in request.history]
    
    response_text = await ai_service.chat(request.message, history_dicts)
    
    return ChatResponse(response=response_text)


@router.get("/test-connection")
async def test_ai_connection(
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> Any:
    """
    Test the AI connection with current settings.
    """
    ai_service = AIService(db)
    await ai_service.initialize()
    
    if not ai_service.enabled:
        return {"status": "error", "message": "AI is disabled or API key is missing."}
        
    # Simple ping test
    try:
        response = await ai_service.chat("Ping")
        if "Sorry" in response or "error" in response.lower():
            return {"status": "error", "message": response}
        return {"status": "success", "message": f"Connection successful! Provider: {ai_service.provider}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
