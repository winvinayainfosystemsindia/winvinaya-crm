"""Candidate Pydantic schemas"""

from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, model_validator

# Import related schemas (forward compatibility)
from app.schemas.candidate_screening import CandidateScreeningResponse
from app.schemas.candidate_document import CandidateDocumentResponse
from app.schemas.candidate_counseling import CandidateCounselingResponse


# Nested Schemas for JSON fields


class Degree(BaseModel):
    degree_name: str
    specialization: str
    college_name: str
    year_of_passing: int
    percentage: float


class EducationDetails(BaseModel):
    degrees: List[Degree] = []


class WorkExperience(BaseModel):
    is_experienced: bool = False
    currently_employed: bool = False
    year_of_experience: Optional[str] = None


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
    dob: Optional[date] = None
    pincode: str
    
    guardian_details: Optional[dict] = None
    work_experience: Optional[WorkExperience] = None
    education_details: Optional[EducationDetails] = None
    disability_details: Optional[DisabilityDetails] = None


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    dob: Optional[date] = None
    pincode: Optional[str] = None
    guardian_details: Optional[dict] = None
    work_experience: Optional[dict] = None
    education_details: Optional[EducationDetails] = None
    disability_details: Optional[DisabilityDetails] = None


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
    screening: Optional[CandidateScreeningResponse] = None
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
                    if key in ['screening', 'documents', 'counseling']:
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
    email: Any  # Relaxed type to handle possible None or non-email strings temporarily
    phone: str
    city: str
    district: str
    state: str
    created_at: datetime
    is_disabled: bool = False
    disability_type: Optional[str] = None
    education_level: Optional[str] = None
    counseling_status: Optional[str] = None
    counselor_name: Optional[str] = None
    counseling_date: Optional[datetime] = None
    documents_uploaded: List[str] = []
    
    @model_validator(mode='before')
    @classmethod
    def extract_flattened_data(cls, data: Any) -> Any:
        # data could be ORM object or dict
        is_disabled = False
        disability_type = None
        education_level = None
        counseling_status = None
        documents_uploaded = []
        
        # Helper to extract from dict or object
        def get_attr(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)
        
        # Helper to check if a relationship is loaded (for ORM objects)
        def is_relationship_loaded(obj, relationship_name):
            if isinstance(obj, dict):
                return True  # Dict always has all keys available
            try:
                from sqlalchemy.inspect import inspect as sqla_inspect
                state = sqla_inspect(obj)
                return relationship_name not in state.unloaded
            except:
                return False  # If we can't inspect, assume not loaded

        # 1. Disability Data
        details = get_attr(data, 'disability_details')
        if details and isinstance(details, dict):
            is_disabled = details.get('is_disabled', False)
            disability_type = details.get('disability_type')

        # 2. Education Data (Determine highest level)
        edu_details = get_attr(data, 'education_details')
        if edu_details and isinstance(edu_details, dict):
            degrees = edu_details.get('degrees', [])
            if degrees and len(degrees) > 0:
                # Simplification: take first degree name as education level
                education_level = degrees[0].get('degree_name', "Graduate/Post-Graduate")

        # 3. Counseling Status - more robust access using helper
        counselor_name = None
        counseling_date = None
        
        # Try to get counseling record directly or via relationship using helper
        counseling = get_attr(data, 'counseling', None)
        if counseling:
            counseling_status = get_attr(counseling, 'status', None)
            counseling_date = get_attr(counseling, 'counseling_date', None)
            
            # Use direct field as primary/fallback for counselor name
            counselor_name = get_attr(counseling, 'counselor_name', None)
            
            # If counselor object is available, prefer its full_name
            try:
                counselor = get_attr(counseling, 'counselor', None)
                if counselor:
                    # Accessing full_name might fail if not loaded, get_attr handles it
                    fname = get_attr(counselor, 'full_name', None)
                    if fname:
                        counselor_name = fname
            except:
                pass # Fallback to counselor_name string already set

        # 4. Documents - only access if loaded
        if is_relationship_loaded(data, 'documents'):
            documents = get_attr(data, 'documents')
            if documents:
                 # documents is a list of objects or dicts
                 documents_uploaded = [get_attr(d, 'document_type') for d in documents]

        if isinstance(data, dict):
            data['is_disabled'] = is_disabled
            data['disability_type'] = disability_type
            data['education_level'] = education_level
            data['counseling_status'] = counseling_status
            data['counselor_name'] = counselor_name
            data['counseling_date'] = counseling_date
            data['documents_uploaded'] = documents_uploaded
            return data
            
        # If it's an object (ORM), convert to dict to inject our calculated fields
        if hasattr(data, '__dict__'):
            try:
                obj_dict = {
                    'public_id': data.public_id,
                    'name': data.name,
                    'email': data.email,
                    'phone': data.phone,
                    'city': data.city,
                    'district': data.district,
                    'state': data.state,
                    'created_at': data.created_at,
                    'is_disabled': is_disabled,
                    'disability_type': disability_type,
                    'education_level': education_level,
                    'counseling_status': counseling_status,
                    'counselor_name': counselor_name,
                    'counseling_date': counseling_date,
                    'documents_uploaded': documents_uploaded
                }
                return obj_dict
            except Exception:
                return data
                
        return data

    class Config:
        from_attributes = True


class CandidateStats(BaseModel):
    total: int
    male: int
    female: int
    others: int
    today: int
    weekly: List[int] = []
    screened: int
    not_screened: int
    total_counseled: int = 0
    counseling_pending: int = 0
    counseling_selected: int = 0
    counseling_rejected: int = 0


class CandidatePaginatedResponse(BaseModel):
    """Paginated response for candidate listing"""
    items: List[CandidateListResponse]
    total: int



