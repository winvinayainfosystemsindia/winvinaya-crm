"""Training Mock Interview model"""

from datetime import datetime
from sqlalchemy import Integer, ForeignKey, String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class TrainingMockInterview(BaseModel):
    """Training Mock Interview database model"""
    
    __tablename__ = "training_mock_interviews"
    
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
    
    interviewer_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    interview_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Structured data
    questions: Mapped[dict | list | None] = mapped_column(JSON, nullable=True) # List of {question, answer}
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    overall_rating: Mapped[int | None] = mapped_column(Integer, nullable=True) # e.g., 1-5
    
    status: Mapped[str] = mapped_column(
        String(20), 
        nullable=False, 
        default="pending",
        index=True
    ) # pending, cleared, re-test, rejected
    
    # Relationships
    batch: Mapped["TrainingBatch"] = relationship("TrainingBatch")
    candidate: Mapped["Candidate"] = relationship("Candidate")
    
    def __repr__(self) -> str:
        return f"<TrainingMockInterview(batch_id={self.batch_id}, candidate_id={self.candidate_id}, status={self.status})>"
