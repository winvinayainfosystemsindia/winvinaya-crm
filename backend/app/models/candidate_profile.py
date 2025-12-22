"""Candidate Profile model for trainer-filled profiling data"""

from datetime import datetime
from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class CandidateProfile(BaseModel):
    """Candidate Profile database model - filled by trainers"""
    
    __tablename__ = "candidate_profiles"
    
    # Foreign Key
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Profiling Data
    dob: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    trained_by_winvinaya: Mapped[bool] = mapped_column(Boolean, default=False)
    training_domain: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    batch_number: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    training_from: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    training_to: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    willing_for_training: Mapped[bool] = mapped_column(Boolean, default=False)
    ready_to_relocate: Mapped[bool] = mapped_column(Boolean, default=False)
    interested_training: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    # Relationship
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="profile")
    
    def __repr__(self) -> str:
        return f"<CandidateProfile(id={self.id}, candidate_id={self.candidate_id}, batch={self.batch_number})>"
