"""Candidate Profile Pydantic schemas"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel


# Profile Schemas

class CandidateProfileBase(BaseModel):
    date_of_birth: Optional[datetime] = None
    trained_by_winvinaya: bool = False
    training_domain: Optional[str] = None
    batch_number: Optional[str] = None
    training_from: Optional[datetime] = None
    training_to: Optional[datetime] = None
    willing_for_training: bool = False
    ready_to_relocate: bool = False
    interested_training: Optional[str] = None


class CandidateProfileCreate(CandidateProfileBase):
    """Schema for creating candidate profile"""
    pass


class CandidateProfileUpdate(BaseModel):
    """Schema for updating candidate profile"""
    date_of_birth: Optional[datetime] = None
    trained_by_winvinaya: Optional[bool] = None
    training_domain: Optional[str] = None
    batch_number: Optional[str] = None
    training_from: Optional[datetime] = None
    training_to: Optional[datetime] = None
    willing_for_training: Optional[bool] = None
    ready_to_relocate: Optional[bool] = None
    interested_training: Optional[str] = None


class CandidateProfileResponse(CandidateProfileBase):
    """Schema for profile response"""
    id: int
    candidate_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
