"""Candidate Allocation model"""

import uuid
from sqlalchemy import Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class CandidateAllocation(BaseModel):
    """Candidate Allocation database model - links candidates to batches"""
    
    __tablename__ = "candidate_allocations"
    
    # Public UUID for external API (security)
    public_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4,
    )
    
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
    
    status: Mapped[dict | None] = mapped_column(JSON, nullable=True) # Status info per candidate
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    batch: Mapped["TrainingBatch"] = relationship("TrainingBatch", back_populates="allocations")
    candidate: Mapped["Candidate"] = relationship("Candidate")
    
    def __repr__(self) -> str:
        return f"<CandidateAllocation(id={self.id}, public_id={self.public_id}, batch_id={self.batch_id}, candidate_id={self.candidate_id})>"
