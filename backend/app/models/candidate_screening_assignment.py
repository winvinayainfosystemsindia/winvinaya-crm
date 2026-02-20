from __future__ import annotations
"""Candidate Screening Assignment model - tracks which user is assigned to screen a candidate"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.user import User


class CandidateScreeningAssignment(BaseModel):
    """Tracks which user (trainer/sourcing) is assigned to screen a specific candidate.
    One assignment per candidate at a time — assigning again replaces the old assignment."""

    __tablename__ = "candidate_screening_assignments"

    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        unique=True,   # Only one assignment per candidate at a time
        nullable=False,
        index=True
    )

    assigned_to_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    assigned_by_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    candidate: Mapped[Candidate] = relationship("Candidate", back_populates="screening_assignment")
    assigned_to: Mapped[User] = relationship("User", foreign_keys=[assigned_to_id])
    assigned_by: Mapped[Optional[User]] = relationship("User", foreign_keys=[assigned_by_id])

    def __repr__(self) -> str:
        return f"<CandidateScreeningAssignment(candidate_id={self.candidate_id}, assigned_to={self.assigned_to_id})>"
