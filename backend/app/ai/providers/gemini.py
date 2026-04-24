import httpx
import logging
from typing import AsyncGenerator
from app.core.config import settings
from app.ai.exceptions import LLMAuthError, LLMProviderError, LLMRateLimitError
from app.ai.providers.base import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)

class GeminiProvider(LLMProvider):
    """Google Gemini Adapter."""
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model = model or settings.AI_MODEL_GEMINI
        if not self._api_key:
            raise LLMAuthError("gemini")

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        url = f"{self.BASE_URL}/{self._model}:generateContent?key={self._api_key}"
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_message}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "responseMimeType": "application/json",
            },
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if not resp.is_success:
                raise LLMProviderError(f"Gemini error: {resp.text}", provider="gemini")
            data = resp.json()
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            return LLMResponse(content=content, raw_response=data)

    async def stream_complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> AsyncGenerator[str, None]:
        yield "Not implemented"
