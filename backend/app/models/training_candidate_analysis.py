from __future__ import annotations
"""Training Candidate Analysis model"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, String, Text, DateTime, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.training_batch import TrainingBatch
    from app.models.candidate import Candidate


class TrainingCandidateAnalysis(BaseModel):
    """Training Candidate Analysis database model"""
    
    __tablename__ = "training_candidate_analysis"
    
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
    
    analyst_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    analysis_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # Structured data
    skills: Mapped[dict | list | None] = mapped_column(JSON, nullable=True) # List of {skill, level, rating}
    other: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    strengths: Mapped[str | None] = mapped_column(Text, nullable=True)
    weaknesses: Mapped[str | None] = mapped_column(Text, nullable=True)
    opportunities: Mapped[str | None] = mapped_column(Text, nullable=True)
    threats: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    technical_rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    communication_rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    attitude_rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    overall_rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    recommendation: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        default="ready_for_placement",
        index=True
    ) # ready_for_placement, needs_additional_training, assign_dsr_project, counseling_required
    
    status: Mapped[str] = mapped_column(
        String(20), 
        nullable=False, 
        default="in-progress",
        index=True
    ) # in-progress, completed
    
    # Relationships
    batch: Mapped[TrainingBatch] = relationship("TrainingBatch")
    candidate: Mapped[Candidate] = relationship("Candidate")
    
    def __repr__(self) -> str:
        return f"<TrainingCandidateAnalysis(batch_id={self.batch_id}, candidate_id={self.candidate_id}, recommendation={self.recommendation})>"
