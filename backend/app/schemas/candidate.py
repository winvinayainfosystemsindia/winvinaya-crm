"""Candidate Pydantic schemas"""

from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field


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
    id: int
    city: str
    district: str
    state: str
    created_at: Any
    updated_at: Any
    
    class Config:
        from_attributes = True
