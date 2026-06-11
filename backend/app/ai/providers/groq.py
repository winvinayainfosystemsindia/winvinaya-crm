import httpx
import json
import logging
from typing import AsyncGenerator
from app.core.config import settings
from app.ai.brain.exceptions import LLMAuthError, LLMProviderError, LLMRateLimitError
from app.ai.providers.base import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)

class GroqProvider(LLMProvider):
    """Groq Adapter."""
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.GROQ_API_KEY
        self._model = model or settings.AI_MODEL_GROQ
        if not self._api_key:
            raise LLMAuthError("groq")

    @property
    def provider_name(self) -> str:
        return "groq"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        import asyncio
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        
        max_retries = 3
        backoff = 2.0
        delay = 2.0
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            for attempt in range(max_retries + 1):
                resp = await client.post(self.BASE_URL, json=payload, headers=headers)
                
                is_rate_limit = False
                if resp.status_code == 429:
                    is_rate_limit = True
                else:
                    try:
                        error_data = resp.json()
                        if error_data.get("error", {}).get("code") == "rate_limit_exceeded":
                            is_rate_limit = True
                    except:
                        pass
                        
                if is_rate_limit:
                    if attempt < max_retries:
                        logger.warning(f"Groq rate limit hit. Retrying in {delay} seconds... (Attempt {attempt+1}/{max_retries})")
                        await asyncio.sleep(delay)
                        delay *= backoff
                        continue
                    else:
                        raise LLMRateLimitError(provider="groq")
                        
                if not resp.is_success:
                    raise LLMProviderError(f"Groq error: {resp.text}", provider="groq")
                
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return LLMResponse(content=content, raw_response=data)

    async def stream_complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> AsyncGenerator[str, None]:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", self.BASE_URL, json=payload, headers=headers) as response:
                if not response.is_success:
                    error_text = await response.aread()
                    raise LLMProviderError(f"Groq streaming error: {error_text.decode()}", provider="groq")
                
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    
                    try:
                        data = json.loads(data_str)
                        delta = data["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield delta
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
