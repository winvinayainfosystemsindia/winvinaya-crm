from __future__ import annotations
"""Training Batch Plan model"""

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, JSON, Date, Integer, Uuid, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date, time
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.training_batch import TrainingBatch


class TrainingBatchPlan(BaseModel):
    """Training Batch Plan database model"""
    
    __tablename__ = "training_batch_plans"
    
    # Public UUID for external API
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4,
    )
    
    batch_id: Mapped[int] = mapped_column(ForeignKey("training_batches.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    activity_type: Mapped[str] = mapped_column(String(100), nullable=False) # course, break, etc.
    activity_name: Mapped[str] = mapped_column(String(255), nullable=False)
    trainer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    batch: Mapped[TrainingBatch] = relationship("TrainingBatch")
    
    def __repr__(self) -> str:
        return f"<TrainingBatchPlan(id={self.id}, public_id={self.public_id}, batch_id={self.batch_id}, date={self.date})>"
