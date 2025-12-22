"""Candidate Pydantic schemas"""

from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field, model_validator

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
    dob: Optional[date] = None
    pincode: str
    
    guardian_details: Optional[dict] = None
    work_experience: Optional[dict] = None
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
            if edu_details.get('degrees') and len(edu_details.get('degrees', [])) > 0:
                education_level = "Graduate/Post-Graduate" # Simplification for now, or take first degree name
                degrees = edu_details.get('degrees', [])
                if degrees:
                    education_level = degrees[0].get('degree_name')
            elif edu_details.get('twelfth_or_diploma'):
                education_level = edu_details.get('twelfth_or_diploma', {}).get('type', '12th/Diploma')
            elif edu_details.get('tenth'):
                education_level = "10th"

        # 3. Counseling Status - only access if loaded
        counselor_name = None
        counseling_date = None
        if is_relationship_loaded(data, 'counseling'):
            counseling = get_attr(data, 'counseling')
            if counseling:
                counseling_status = get_attr(counseling, 'status')
                counseling_date = get_attr(counseling, 'counseling_date')
                # Check if counselor relationship is loaded before accessing
                if is_relationship_loaded(counseling, 'counselor'):
                    counselor = get_attr(counseling, 'counselor')
                    if counselor:
                        counselor_name = get_attr(counselor, 'full_name')

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
    profiled: int
    not_profiled: int



