"""
AI Engine — Multi-Provider LLM Adapters
=========================================

Supports all major LLM providers via a single clean interface.
Add a new provider by subclassing LLMProvider and registering
it in the PROVIDER_REGISTRY at the bottom of this file.

Supported Providers:
  - gemini     → Google Gemini (Flash / Pro)
  - openai     → OpenAI ChatGPT (GPT-4o, GPT-4o-mini)
  - anthropic  → Anthropic Claude (claude-3-5-haiku, claude-3-5-sonnet)
  - groq       → Groq (llama3, mixtral — ultra-fast inference)
  - mistral    → Mistral AI (mistral-small, mistral-large)
  - together   → Together AI (open-source models)
  - cohere     → Cohere Command
  - ollama     → Ollama (local / self-hosted)

Selection via environment variable: AI_PROVIDER=groq
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Any

import httpx

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.ai.exceptions import LLMAuthError, LLMProviderError, LLMRateLimitError
from app.repositories.system_setting_repository import SystemSettingRepository

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# LLM Response Container
# ─────────────────────────────────────────────────────────────────────────────

class LLMResponse:
    """Structured response from any LLM provider."""

    def __init__(
        self,
        content: str,
        tokens_used: int | None = None,
        cost_usd: float | None = None,
        raw_response: Any = None,
    ):
        self.content = content
        self.tokens_used = tokens_used
        self.cost_usd = cost_usd
        self.raw_response = raw_response


# ─────────────────────────────────────────────────────────────────────────────
# Base Provider Interface
# ─────────────────────────────────────────────────────────────────────────────

class LLMProvider(ABC):
    """Abstract interface every LLM provider adapter must implement."""

    @abstractmethod
    async def complete(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Send a prompt and return a structured LLMResponse."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Identifier: 'gemini', 'openai', 'anthropic', 'groq', etc."""
        ...

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Exact model version string logged in the task journal."""
        ...

    # ── Shared HTTP helper ────────────────────────────────────────────────────
    async def _post(
        self,
        url: str,
        payload: dict,
        headers: dict,
        timeout: float = 60.0,
    ) -> dict:
        """
        Shared POST helper with standard error handling.
        Raises LLMRateLimitError, LLMAuthError, or LLMProviderError on failures.
        """
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                resp = await client.post(url, json=payload, headers=headers)
            except httpx.RequestError as e:
                raise LLMProviderError(
                    f"Network error contacting {self.provider_name}: {e}",
                    provider=self.provider_name,
                )

        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 60))
            raise LLMRateLimitError(provider=self.provider_name, retry_after=retry_after)
        if resp.status_code in (401, 403):
            raise LLMAuthError(self.provider_name)
        if not resp.is_success:
            raise LLMProviderError(
                f"{self.provider_name} API error {resp.status_code}: {resp.text[:500]}",
                provider=self.provider_name,
            )
        return resp.json()


# ─────────────────────────────────────────────────────────────────────────────
# Google Gemini
# ─────────────────────────────────────────────────────────────────────────────

class GeminiProvider(LLMProvider):
    """Google Gemini via REST API. Supports Flash and Pro models."""

    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
    _COST_INPUT_PER_1M = 0.075   # gemini-1.5-flash pricing
    _COST_OUTPUT_PER_1M = 0.30

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
        data = await self._post(url, payload, headers={})
        content = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {})
        input_tokens = usage.get("promptTokenCount", 0)
        output_tokens = usage.get("candidatesTokenCount", 0)
        total = input_tokens + output_tokens
        cost = (input_tokens / 1_000_000) * self._COST_INPUT_PER_1M + (output_tokens / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=total, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# OpenAI (ChatGPT)
# ─────────────────────────────────────────────────────────────────────────────

class OpenAIProvider(LLMProvider):
    """OpenAI Chat Completions — GPT-4o / GPT-4o-mini."""

    BASE_URL = "https://api.openai.com/v1/chat/completions"
    _COST_INPUT_PER_1M = 0.15    # gpt-4o-mini
    _COST_OUTPUT_PER_1M = 0.60

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.OPENAI_API_KEY
        self._model = model or settings.AI_MODEL_OPENAI
        
        if not self._api_key:
            raise LLMAuthError("openai")

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        input_t = usage.get("prompt_tokens", 0)
        output_t = usage.get("completion_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Anthropic Claude
# ─────────────────────────────────────────────────────────────────────────────

class AnthropicProvider(LLMProvider):
    """
    Anthropic Claude via Messages API.
    Supports claude-3-5-haiku, claude-3-5-sonnet, claude-3-opus.
    """

    BASE_URL = "https://api.anthropic.com/v1/messages"
    API_VERSION = "2023-06-01"
    _COST_INPUT_PER_1M = 0.80    # claude-3-5-haiku pricing
    _COST_OUTPUT_PER_1M = 4.00

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.ANTHROPIC_API_KEY
        self._model = model or settings.AI_MODEL_ANTHROPIC
        
        if not self._api_key:
            raise LLMAuthError("anthropic")

    @property
    def provider_name(self) -> str:
        return "anthropic"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        headers = {
            "x-api-key": self._api_key,
            "anthropic-version": self.API_VERSION,
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["content"][0]["text"]
        usage = data.get("usage", {})
        input_t = usage.get("input_tokens", 0)
        output_t = usage.get("output_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Groq (Ultra-fast inference)
# ─────────────────────────────────────────────────────────────────────────────

class GroqProvider(LLMProvider):
    """
    Groq Cloud — OpenAI-compatible API with extremely fast inference.
    Best models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768.
    Groq is FREE tier available, making it ideal for development.
    """

    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
    _COST_INPUT_PER_1M = 0.05    # llama-3.1-8b-instant pricing
    _COST_OUTPUT_PER_1M = 0.08

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
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        # Groq does not support response_format=json_object for all models, 
        # so we instruct JSON via system prompt and parse it ourselves
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        input_t = usage.get("prompt_tokens", 0)
        output_t = usage.get("completion_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Mistral AI
# ─────────────────────────────────────────────────────────────────────────────

class MistralProvider(LLMProvider):
    """
    Mistral AI — European LLM (GDPR-friendly option).
    Models: mistral-small-latest, mistral-large-latest, codestral-mamba.
    """

    BASE_URL = "https://api.mistral.ai/v1/chat/completions"
    _COST_INPUT_PER_1M = 0.20    # mistral-small pricing
    _COST_OUTPUT_PER_1M = 0.60

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.MISTRAL_API_KEY
        self._model = model or settings.AI_MODEL_MISTRAL
        
        if not self._api_key:
            raise LLMAuthError("mistral")

    @property
    def provider_name(self) -> str:
        return "mistral"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        input_t = usage.get("prompt_tokens", 0)
        output_t = usage.get("completion_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Together AI (Open-source models)
# ─────────────────────────────────────────────────────────────────────────────

class TogetherProvider(LLMProvider):
    """
    Together AI — runs open-source models (Llama, Mixtral, Qwen, etc.)
    at scale. Good for cost control + model variety.
    """

    BASE_URL = "https://api.together.xyz/v1/chat/completions"
    _COST_INPUT_PER_1M = 0.10
    _COST_OUTPUT_PER_1M = 0.10

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.TOGETHER_API_KEY
        self._model = model or settings.AI_MODEL_TOGETHER
        
        if not self._api_key:
            raise LLMAuthError("together")

    @property
    def provider_name(self) -> str:
        return "together"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        input_t = usage.get("prompt_tokens", 0)
        output_t = usage.get("completion_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Cohere
# ─────────────────────────────────────────────────────────────────────────────

class CohereProvider(LLMProvider):
    """
    Cohere Command models.
    Supports command-r, command-r-plus.
    """

    BASE_URL = "https://api.cohere.com/v2/chat"
    _COST_INPUT_PER_1M = 0.15    # command-r pricing
    _COST_OUTPUT_PER_1M = 0.60

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self._api_key = api_key or settings.COHERE_API_KEY
        self._model = model or settings.AI_MODEL_COHERE
        
        if not self._api_key:
            raise LLMAuthError("cohere")

    @property
    def provider_name(self) -> str:
        return "cohere"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": max_tokens,
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }
        data = await self._post(self.BASE_URL, payload, headers)
        content = data["message"]["content"][0]["text"]
        usage = data.get("usage", {})
        input_t = usage.get("billed_units", {}).get("input_tokens", 0)
        output_t = usage.get("billed_units", {}).get("output_tokens", 0)
        cost = (input_t / 1_000_000) * self._COST_INPUT_PER_1M + (output_t / 1_000_000) * self._COST_OUTPUT_PER_1M
        return LLMResponse(content=content, tokens_used=input_t + output_t, cost_usd=cost, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Ollama (Local / Self-hosted)
# ─────────────────────────────────────────────────────────────────────────────

class OllamaProvider(LLMProvider):
    """
    Ollama — runs models locally (llama3.1, mistral, phi3, etc.).
    Zero cost, full privacy. Ideal for sensitive data environments.
    """

    def __init__(self, base_url: str | None = None, model: str | None = None) -> None:
        self._base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self._model = model or settings.OLLAMA_MODEL

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def model_name(self) -> str:
        return self._model

    async def complete(self, system_prompt, user_message, temperature=0.2, max_tokens=4096) -> LLMResponse:
        url = f"{self._base_url}/api/chat"
        payload = {
            "model": self._model,
            "stream": False,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "options": {"temperature": temperature, "num_predict": max_tokens},
            "format": "json",
        }
        data = await self._post(url, payload, headers={}, timeout=120.0)
        content = data["message"]["content"]
        return LLMResponse(content=content, tokens_used=None, cost_usd=0.0, raw_response=data)


# ─────────────────────────────────────────────────────────────────────────────
# Provider Registry + Factory
# ─────────────────────────────────────────────────────────────────────────────

#: Maps AI_PROVIDER env value → provider class
PROVIDER_REGISTRY: dict[str, type[LLMProvider]] = {
    "gemini":    GeminiProvider,
    "openai":    OpenAIProvider,
    "anthropic": AnthropicProvider,
    "groq":      GroqProvider,
    "mistral":   MistralProvider,
    "together":  TogetherProvider,
    "cohere":    CohereProvider,
    "ollama":    OllamaProvider,
}

SUPPORTED_PROVIDERS = list(PROVIDER_REGISTRY.keys())


async def get_llm_provider(db: AsyncSession, override: str | None = None) -> LLMProvider:
    """
    Factory — returns the active LLM provider instance based on DB settings.
    Falls back to .env if DB settings are missing.

    Args:
        db: Async database session
        override: Optional provider name to use instead of settings.AI_PROVIDER.
    """
    repo = SystemSettingRepository(db)
    
    # 1. Resolve Provider Name
    # Priority: override argument > DB setting > .env setting
    provider_name = override
    if not provider_name:
        stored_provider = await repo.get_by_key("AI_PROVIDER")
        provider_name = stored_provider.value if stored_provider and stored_provider.value else settings.AI_PROVIDER
    
    provider_name = provider_name.lower().strip()

    if provider_name not in PROVIDER_REGISTRY:
        raise LLMProviderError(
            f"Unknown AI provider '{provider_name}'. "
            f"Supported providers: {', '.join(SUPPORTED_PROVIDERS)}",
            provider=provider_name,
        )

    # 2. Resolve API Key / Model / Base URL from DB
    key_field = f"{provider_name.upper()}_API_KEY"
    stored_key = await repo.get_by_key(key_field)
    api_key = stored_key.value if stored_key and stored_key.value else None
    
    stored_model_override = await repo.get_by_key("AI_MODEL_OVERRIDE")
    model = stored_model_override.value if stored_model_override and stored_model_override.value else None

    # Ollama special cases
    base_url = None
    if provider_name == "ollama":
        stored_url = await repo.get_by_key("OLLAMA_BASE_URL")
        base_url = stored_url.value if stored_url and stored_url.value else None
        stored_ollama_model = await repo.get_by_key("OLLAMA_MODEL")
        model = stored_ollama_model.value if stored_ollama_model and stored_ollama_model.value else model

    provider_class = PROVIDER_REGISTRY[provider_name]
    logger.debug("Initializing AI provider: %s (DB-first)", provider_name)
    
    if provider_name == "ollama":
        return provider_class(base_url=base_url, model=model)
    return provider_class(api_key=api_key, model=model)


def get_provider_info() -> list[dict]:
    """
    Returns metadata about all supported providers.
    Used by the /ai/health endpoint.
    """
    provider_key_map = {
        "gemini":    ("GEMINI_API_KEY", settings.GEMINI_API_KEY),
        "openai":    ("OPENAI_API_KEY", settings.OPENAI_API_KEY),
        "anthropic": ("ANTHROPIC_API_KEY", settings.ANTHROPIC_API_KEY),
        "groq":      ("GROQ_API_KEY", settings.GROQ_API_KEY),
        "mistral":   ("MISTRAL_API_KEY", settings.MISTRAL_API_KEY),
        "together":  ("TOGETHER_API_KEY", settings.TOGETHER_API_KEY),
        "cohere":    ("COHERE_API_KEY", settings.COHERE_API_KEY),
        "ollama":    ("OLLAMA_BASE_URL", settings.OLLAMA_BASE_URL),
    }
    model_map = {
        "gemini":    settings.AI_MODEL_GEMINI,
        "openai":    settings.AI_MODEL_OPENAI,
        "anthropic": settings.AI_MODEL_ANTHROPIC,
        "groq":      settings.AI_MODEL_GROQ,
        "mistral":   settings.AI_MODEL_MISTRAL,
        "together":  settings.AI_MODEL_TOGETHER,
        "cohere":    settings.AI_MODEL_COHERE,
        "ollama":    settings.OLLAMA_MODEL,
    }

    result = []
    for name in SUPPORTED_PROVIDERS:
        key_name, key_value = provider_key_map[name]
        result.append({
            "name": name,
            "is_active": name == settings.AI_PROVIDER,
            "configured": bool(key_value),
            "model": model_map[name],
            "key_env_var": key_name,
        })
    return result
