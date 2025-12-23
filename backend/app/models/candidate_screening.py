"""Candidate Screening model for trainer-filled screening data"""

from sqlalchemy import Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class CandidateScreening(BaseModel):
    """Candidate Screening database model - filled by trainers"""
    
    __tablename__ = "candidate_screenings"
    
    # Foreign Key
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Screening Data (JSON fields)
    previous_training: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    documents_upload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    skills: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationship
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="screening")
    
    def __repr__(self) -> str:
        return f"<CandidateScreening(id={self.id}, candidate_id={self.candidate_id})>"
