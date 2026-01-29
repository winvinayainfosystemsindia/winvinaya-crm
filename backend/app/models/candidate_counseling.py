"""Candidate Counseling model for career counseling data"""

from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class CandidateCounseling(BaseModel):
    """Candidate Counseling database model - for career counseling"""
    
    __tablename__ = "candidate_counseling"
    
    # Foreign Key
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Counseling Data
    skills: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    questions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    workexperience: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    counselor_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True
    )  # 'pending', 'selected', 'rejected'
    
    # Track counselor and date
    counselor_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )
    counseling_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="counseling")  # noqa: F821
    counselor: Mapped["User"] = relationship("User")  # noqa: F821
    
    def __repr__(self) -> str:
        return f"<CandidateCounseling(id={self.id}, candidate_id={self.candidate_id}, status={self.status})>"
