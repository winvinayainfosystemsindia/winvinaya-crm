"""Training Attendance model"""

from datetime import date
from sqlalchemy import Integer, ForeignKey, String, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class TrainingAttendance(BaseModel):
    """Training Attendance database model"""
    
    __tablename__ = "training_attendance"
    
    batch_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("training_batches.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="present") # present, absent, late, half_day
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Relationships
    batch: Mapped["TrainingBatch"] = relationship("TrainingBatch")  # noqa: F821
    candidate: Mapped["Candidate"] = relationship("Candidate")  # noqa: F821
    
    def __repr__(self) -> str:
        return f"<TrainingAttendance(batch_id={self.batch_id}, candidate_id={self.candidate_id}, date={self.date}, status={self.status})>"
