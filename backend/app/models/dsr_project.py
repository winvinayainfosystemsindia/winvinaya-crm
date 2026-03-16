from __future__ import annotations
"""DSR Project model"""

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, Integer, ForeignKey, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.dsr_activity import DSRActivity


class DSRProject(BaseModel):
    """DSR Project - created by Manager/Admin, assigned to an owner user."""

    __tablename__ = "dsr_projects"

    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    # Owner — the user responsible for this project (set by Manager/Admin)
    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Creator — who created this project record
    created_by: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Extensible metadata
    others: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="Extensible project metadata (e.g. client, priority, tags)",
    )

    # Relationships
    owner: Mapped[User] = relationship(
        "User",
        foreign_keys=[owner_id],
        lazy="selectin",
    )

    creator: Mapped[User] = relationship(
        "User",
        foreign_keys=[created_by],
        lazy="selectin",
    )

    activities: Mapped[list[DSRActivity]] = relationship(
        "DSRActivity",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<DSRProject(id={self.id}, public_id={self.public_id}, name={self.name})>"
