from __future__ import annotations
"""Placement Mapping model for linking candidates to job roles"""

from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, Float, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.job_role import JobRole
    from app.models.user import User


class PlacementMapping(BaseModel):
    """Placement Mapping database model - records that a candidate is mapped to a job role"""
    
    __tablename__ = "placement_mappings"
    
    # Foreign Keys
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    job_role_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("job_roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    mapped_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    
    # Mapping Data
    match_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        default=0.0,
        comment="Calculated match score at the time of mapping"
    )
    
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Reasoning or notes for the mapping"
    )
    
    mapped_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    
    # Relationships
    candidate: Mapped[Candidate] = relationship("Candidate")
    job_role: Mapped[JobRole] = relationship("JobRole")
    mapped_by: Mapped[User] = relationship("User")

    # Constraints
    __table_args__ = (
        UniqueConstraint("candidate_id", "job_role_id", name="uq_candidate_job_role_mapping"),
    )
    
    def __repr__(self) -> str:
        return f"<PlacementMapping(id={self.id}, candidate_id={self.candidate_id}, job_role_id={self.job_role_id})>"
