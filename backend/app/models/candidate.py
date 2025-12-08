"""Candidate model"""

from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class Candidate(BaseModel):
    """Candidate database model"""
    
    __tablename__ = "candidates"
    
    # Basic Details
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
    
    # JSON Data
    education_details: Mapped[dict] = mapped_column(JSON, nullable=True)
    disability_details: Mapped[dict] = mapped_column(JSON, nullable=True)
    skills: Mapped[list] = mapped_column(JSON, nullable=True)
    
    def __repr__(self) -> str:
        return f"<Candidate(id={self.id}, name={self.name}, email={self.email})>"
