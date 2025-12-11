"""Candidate Pydantic schemas"""

from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Import related schemas (forward compatibility)
from app.schemas.candidate_profile import CandidateProfileResponse
from app.schemas.candidate_document import CandidateDocumentResponse
from app.schemas.candidate_counseling import CandidateCounselingResponse


# Nested Schemas for JSON fields

class Education10th(BaseModel):
    school_name: str
    year_of_passing: int
    percentage: float


class Education12thOrDiploma(BaseModel):
    institution_name: str
    year_of_passing: int
    percentage: float
    type: str = Field(..., description=" '12th' or 'Diploma'")


class Degree(BaseModel):
    degree_name: str
    specialization: str
    college_name: str
    year_of_passing: int
    percentage: float


class EducationDetails(BaseModel):
    tenth: Optional[Education10th] = None
    twelfth_or_diploma: Optional[Education12thOrDiploma] = None
    degrees: List[Degree] = []


class DisabilityDetails(BaseModel):
    is_disabled: bool = False
    disability_type: Optional[str] = None
    disability_percentage: Optional[float] = None


# CRUD Schemas

class CandidateBase(BaseModel):
    name: str
    gender: str
    email: EmailStr
    phone: str
    whatsapp_number: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    
    pincode: str
    
    is_experienced: bool = False
    currently_employed: bool = False
    
    education_details: Optional[EducationDetails] = None
    disability_details: Optional[DisabilityDetails] = None
    skills: List[str] = []


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    pincode: Optional[str] = None
    is_experienced: Optional[bool] = None
    currently_employed: Optional[bool] = None
    education_details: Optional[EducationDetails] = None
    disability_details: Optional[DisabilityDetails] = None
    skills: Optional[List[str]] = None


class CandidateResponse(CandidateBase):
    """
    Candidate response schema.
    Note: Uses public_id (UUID) instead of internal id for security.
    """
    public_id: UUID  # Secure UUID for external API
    city: str
    district: str
    state: str
    created_at: datetime
    updated_at: datetime
    
    # Optional nested relationships (filled by trainers)
    profile: Optional[CandidateProfileResponse] = None
    documents: List[CandidateDocumentResponse] = []
    counseling: Optional[CandidateCounselingResponse] = None
    
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        """Custom validation to handle unloaded SQLAlchemy relationships"""
        from sqlalchemy.orm import object_session
        from sqlalchemy.inspect import inspect
        
        # If this is a SQLAlchemy object, check which relationships are loaded
        if hasattr(obj, '__dict__'):
            state = inspect(obj)
            if state:
                # Only include relationships that are actually loaded
                data = {}
                for key in cls.model_fields.keys():
                    if key in ['profile', 'documents', 'counseling']:
                        # Check if the relationship is loaded
                        if key in state.unloaded:
                            # Skip unloaded relationships
                            continue
                    # Get the attribute value
                    try:
                        data[key] = getattr(obj, key)
                    except:
                        # If we can't get it, skip it
                        continue
                        
                return super().model_validate(data, *args, **kwargs)
        
        return super().model_validate(obj, *args, **kwargs)
    
    class Config:
        from_attributes = True


class CandidateListResponse(BaseModel):
    """Simplified response for list endpoints"""
    public_id: UUID
    name: str
    email: EmailStr
    phone: str
    city: str
    district: str
    state: str
    created_at: datetime
    
    class Config:
        from_attributes = True

