"""Candidate Screening Pydantic schemas"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Screening Schemas

class CandidateScreeningBase(BaseModel):
    status: Optional[str] = None
    previous_training: Optional[dict[str, Any]] = None
    documents_upload: Optional[dict[str, Any]] = None
    skills: Optional[dict[str, Any]] = None
    family_details: Optional[list[dict[str, Any]]] = None
    others: Optional[dict[str, Any]] = Field(None, description="Additional screening data (willing_for_training, ready_to_relocate, source_of_info, family_annual_income, comments)")


class CandidateScreeningCreate(CandidateScreeningBase):
    """Schema for creating candidate screening"""
    pass


class CandidateScreeningUpdate(BaseModel):
    """Schema for updating candidate screening"""
    status: Optional[str] = None
    previous_training: Optional[dict[str, Any]] = None
    documents_upload: Optional[dict[str, Any]] = None
    skills: Optional[dict[str, Any]] = None
    family_details: Optional[list[dict[str, Any]]] = None
    others: Optional[dict[str, Any]] = Field(None, description="Additional screening data (willing_for_training, ready_to_relocate, source_of_info, family_annual_income, comments)")


class CandidateScreeningResponse(CandidateScreeningBase):
    """Schema for screening response"""
    id: int
    candidate_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
