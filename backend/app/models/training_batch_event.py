"""Training Batch Event model (Holidays, Special Events)"""

from datetime import date
from sqlalchemy import Integer, ForeignKey, String, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class TrainingBatchEvent(BaseModel):
    """Training Batch Event database model"""
    
    __tablename__ = "training_batch_events"
    
    batch_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("training_batches.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, default="holiday") # holiday, event
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    batch: Mapped["TrainingBatch"] = relationship("TrainingBatch")  # noqa: F821
    
    def __repr__(self) -> str:
        return f"<TrainingBatchEvent(batch_id={self.batch_id}, date={self.date}, type={self.event_type}, title={self.title})>"
