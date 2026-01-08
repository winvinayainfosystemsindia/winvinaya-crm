"""Training Assessment model"""

from datetime import date
from sqlalchemy import Integer, ForeignKey, String, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class TrainingAssessment(BaseModel):
    """Training Assessment database model"""
    
    __tablename__ = "training_assessments"
    
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
    
    assessment_name: Mapped[str] = mapped_column(String(255), nullable=False)
    marks_obtained: Mapped[float] = mapped_column(Float, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    assessment_date: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Relationships
    batch: Mapped["TrainingBatch"] = relationship("TrainingBatch")
    candidate: Mapped["Candidate"] = relationship("Candidate")
    
    def __repr__(self) -> str:
        return f"<TrainingAssessment(batch_id={self.batch_id}, candidate_id={self.candidate_id}, name={self.assessment_name}, marks={self.marks_obtained}/{self.max_marks})>"
