from __future__ import annotations
"""DSR Activity model — planned work items under a DSR project"""

import uuid
import enum
from datetime import date
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, JSON, Integer, Date, ForeignKey, Enum, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.dsr_project import DSRProject


class DSRActivityStatus(str, enum.Enum):
    """Status of a planned activity"""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class DSRActivity(BaseModel):
    """
    DSR Activity — a planned work item / task belonging to a project.
    Created and managed only by the project owner or Admin.
    """

    __tablename__ = "dsr_activities"

    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4,
    )

    project_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("dsr_projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    status: Mapped[DSRActivityStatus] = mapped_column(
        Enum(DSRActivityStatus, values_callable=lambda x: [e.value for e in x]),
        default=DSRActivityStatus.PLANNED,
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    # Extensible metadata
    others: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="Extensible metadata (e.g. priority, estimated_hours, labels)",
    )

    # Relationship
    project: Mapped[DSRProject] = relationship(
        "DSRProject",
        back_populates="activities",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<DSRActivity(id={self.id}, public_id={self.public_id}, "
            f"name={self.name}, project_id={self.project_id}, status={self.status})>"
        )
