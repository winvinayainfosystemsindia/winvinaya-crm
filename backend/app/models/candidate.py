"""Candidate model"""

import uuid
from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class Candidate(BaseModel):
    """Candidate database model"""
    
    __tablename__ = "candidates"
    
    # Public UUID for external API (security)
    public_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4,
    )
    
    # Basic Details (filled by candidates)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    gender: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    whatsapp_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Guardian Details
    parent_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parent_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Address Details
    pincode: Mapped[str] = mapped_column(String(20), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Work Status
    is_experienced: Mapped[bool] = mapped_column(Boolean, default=False)
    currently_employed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # JSON Data (filled by candidates)
    education_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    disability_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    
    # Relationships (filled by trainers)
    profile: Mapped["CandidateProfile"] = relationship(
        "CandidateProfile",
        back_populates="candidate",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined"
    )
    
    documents: Mapped[list["CandidateDocument"]] = relationship(
        "CandidateDocument",
        back_populates="candidate",
        cascade="all, delete-orphan",
        lazy="select"
    )
    
    counseling: Mapped["CandidateCounseling"] = relationship(
        "CandidateCounseling",
        back_populates="candidate",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="joined"
    )
    
    def __repr__(self) -> str:
        return f"<Candidate(id={self.id}, public_id={self.public_id}, name={self.name})>"
