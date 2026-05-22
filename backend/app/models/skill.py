from __future__ import annotations
"""Skill model for standardized master data management"""

from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, Index, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel
from sqlalchemy import func

if TYPE_CHECKING:
    from app.models.user import User


class Skill(BaseModel):
    """
    Skill database model.
    Used for standardized talent and job requirement tracking.
    """
    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(
        String(100), 
        unique=True, 
        index=True, 
        nullable=False
    )
    
    is_verified: Mapped[bool] = mapped_column(
        Boolean, 
        default=False, 
        nullable=False
    )

    created_by_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    creator: Mapped[User | None] = relationship(
        "User",
        foreign_keys=[created_by_id]
    )

    # Add a case-insensitive index for searching (if using Postgres)
    __table_args__ = (
        Index('ix_skills_name_lower', func.lower(name), unique=True),
    )

    def __repr__(self) -> str:
        return f"<Skill(id={self.id}, name={self.name})>"

