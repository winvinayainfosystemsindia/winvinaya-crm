"""WhatsApp Webhook Endpoint — receives inbound messages from Meta Cloud API."""

import asyncio
import hashlib
import hmac
import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.system_setting_repository import SystemSettingRepository
from app.services.whatsapp_bot_service import WhatsAppBotService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/webhooks",
    tags=["WhatsApp Webhook"],
)


# ---------------------------------------------------------------------------
# GET — Meta webhook verification (hub challenge-response)
# ---------------------------------------------------------------------------

@router.get(
    "/whatsapp",
    response_class=PlainTextResponse,
    summary="Meta webhook hub verification",
    description=(
        "Meta calls this endpoint when you subscribe a webhook. "
        "It validates hub.verify_token against the value stored in System Settings "
        "and echoes back hub.challenge."
    ),
)
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode", default=""),
    hub_verify_token: str = Query(alias="hub.verify_token", default=""),
    hub_challenge: str = Query(alias="hub.challenge", default=""),
    db: AsyncSession = Depends(get_db),
) -> PlainTextResponse:
    """Respond to Meta's webhook subscription verification request."""
    if hub_mode != "subscribe":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid hub.mode",
        )

    # Load stored verify token from System Settings
    repo = SystemSettingRepository(db)
    settings = await repo.get_all_settings()
    cfg = {s.key: s.value for s in settings}
    stored_token = (cfg.get("whatsapp_verify_token") or "").strip()

    if not stored_token or hub_verify_token != stored_token:
        logger.warning(
            f"WhatsApp webhook verification failed: received token '{hub_verify_token}'"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verify token mismatch",
        )

    logger.info("WhatsApp webhook verified successfully")
    return PlainTextResponse(content=hub_challenge, status_code=200)


# ---------------------------------------------------------------------------
# POST — Receive inbound WhatsApp messages from Meta
# ---------------------------------------------------------------------------

@router.post(
    "/whatsapp",
    status_code=status.HTTP_200_OK,
    summary="Receive inbound WhatsApp messages",
    description=(
        "Meta posts all inbound messages here. "
        "The X-Hub-Signature-256 header is validated using the App Secret stored in System Settings. "
        "Processing is async (background task) so Meta's 20s timeout is never hit."
    ),
)
async def receive_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """
    Validate HMAC signature then delegate processing to WhatsAppBotService
    in a background task so Meta receives an immediate 200 OK.
    """
    # ── Read raw body for HMAC validation ──────────────────────────────────
    raw_body = await request.body()

    # ── HMAC Signature Validation ───────────────────────────────────────────
    repo = SystemSettingRepository(db)
    sys_settings = await repo.get_all_settings()
    cfg = {s.key: s.value for s in sys_settings}
    app_secret = (cfg.get("whatsapp_app_secret") or "").strip()

    if app_secret:
        signature_header = request.headers.get("X-Hub-Signature-256", "")
        if not signature_header.startswith("sha256="):
            logger.warning("WhatsApp webhook: missing or invalid signature header")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Missing X-Hub-Signature-256 header",
            )

        expected_sig = "sha256=" + hmac.new(
            app_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, signature_header):
            logger.warning("WhatsApp webhook: HMAC signature mismatch — possible spoofed request")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Signature mismatch",
            )
    else:
        logger.warning(
            "WhatsApp webhook: whatsapp_app_secret not configured — "
            "skipping HMAC validation (not recommended for production)"
        )

    # ── Parse JSON payload ──────────────────────────────────────────────────
    try:
        import json
        payload: Dict[str, Any] = json.loads(raw_body)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    # Confirm this is a WhatsApp Business Account event
    if payload.get("object") != "whatsapp_business_account":
        logger.debug("WhatsApp webhook: non-WA payload, ignoring")
        return {"status": "ignored"}

    # ── Fire-and-forget background processing ──────────────────────────────
    # We must return 200 to Meta immediately; processing happens in background.
    # A new DB session is obtained inside the background task so the request
    # session is not shared across async boundaries.
    async def _process() -> None:
        from app.core.database import AsyncSessionLocal  # noqa: PLC0415
        async with AsyncSessionLocal() as bg_db:
            try:
                bot = WhatsAppBotService(bg_db)
                await bot.handle_inbound(payload)
            except Exception as e:
                logger.error(f"WhatsApp background task error: {e}", exc_info=True)
                await bg_db.rollback()

    asyncio.create_task(_process())

    return {"status": "received"}
