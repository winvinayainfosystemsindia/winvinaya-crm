from __future__ import annotations
"""WhatsApp Message model — raw audit table for every inbound WhatsApp message."""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Float, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class WAProcessingStatus(str, enum.Enum):
    """Processing status for inbound WhatsApp messages."""
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"
    IGNORED = "ignored"


class WhatsAppMessage(BaseModel):
    """
    Raw audit table for every inbound WhatsApp message.
    Persisted before any processing so no message is ever lost.
    """

    __tablename__ = "whatsapp_messages"

    # Meta message ID — deduplicate retries
    wa_message_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Meta's unique message ID (wamid.*) — used for idempotency",
    )

    # Which WinVinaya number received it
    wa_phone_number_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Meta Phone Number ID that received the message",
    )

    # Sender details
    from_phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
        comment="Sender's phone number in E.164 format e.g. 919876543210",
    )

    from_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="WhatsApp display name of the sender",
    )

    # Message payload
    message_body: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Raw text content of the message",
    )

    message_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="text",
        comment="Meta message type: text | image | document | audio | video | sticker | location",
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Timestamp from Meta's webhook payload",
    )

    # Processing outcome
    processing_status: Mapped[WAProcessingStatus] = mapped_column(
        String(20),
        nullable=False,
        default=WAProcessingStatus.PENDING,
        index=True,
        comment="Current processing state of this message",
    )

    ai_intent: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="AI-classified intent: new_person | known_contact | follow_up | ignore",
    )

    ai_confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="AI classification confidence score 0.0 – 1.0",
    )

    crm_action_taken: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True,
        comment="Summary of CRM records created/updated: {lead_id, contact_id, company_id, task_id, activity_id}",
    )

    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Error details if processing_status is failed",
    )

    def __repr__(self) -> str:
        return (
            f"<WhatsAppMessage(id={self.id}, from={self.from_phone}, "
            f"status={self.processing_status}, intent={self.ai_intent})>"
        )
