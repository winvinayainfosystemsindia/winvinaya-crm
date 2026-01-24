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


class CandidateCheck(BaseModel):
    email: EmailStr
    phone: str
    pincode: str


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
    gender: str
    email: Any
    phone: str
    whatsapp_number: Optional[str] = None
    dob: Optional[date] = None
    pincode: str
    city: str
    district: str
    state: str
    created_at: datetime
    is_disabled: bool = False
    disability_type: Optional[str] = None
    education_level: Optional[str] = None
    screening_status: str = "Pending"
    counseling_status: Optional[str] = None
    counselor_name: Optional[str] = None
    counseling_date: Optional[datetime] = None
    documents_uploaded: List[str] = []
    family_details: Optional[List[dict]] = None
    
    # Counseling fields
    feedback: Optional[str] = None
    skills: Optional[List[dict]] = None
    questions: Optional[List[dict]] = None
    workexperience: Optional[List[dict]] = None
    
    # New Screening fields
    source_of_info: Optional[str] = None
    family_annual_income: Optional[Any] = None
    screened_by_name: Optional[str] = None
    screening_date: Optional[datetime] = None
    screening_updated_at: Optional[datetime] = None
    
    @model_validator(mode='before')
    @classmethod
    def extract_flattened_data(cls, data: Any) -> Any:
        # data could be ORM object or dict
        is_disabled = False
        disability_type = None
        education_level = None
        screening_status = "Pending"
        counseling_status = None
        counselor_name = None
        counseling_date = None
        feedback = None
        skills = []
        questions = []
        workexperience = []
        documents_uploaded = []
        family_details = None
        source_of_info = None
        family_annual_income = None
        screened_by_name = None
        screening_date = None
        screening_updated_at = None
        
        # ... (rest of helper functions)
        def get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        # 1. Disability Data
        details = get_val(data, 'disability_details')
        if details and isinstance(details, dict):
            is_disabled = details.get('is_disabled', False)
            disability_type = details.get('disability_type')

        # 2. Education Data
        edu_details = get_val(data, 'education_details')
        if edu_details and isinstance(edu_details, dict):
            degrees = edu_details.get('degrees', [])
            if degrees and len(degrees) > 0:
                education_level = degrees[0].get('degree_name')

        # 3. Screening Data
        screening = None
        if isinstance(data, dict):
            screening = data.get('screening')
        elif hasattr(data, '__dict__') and 'screening' in data.__dict__:
            screening = data.screening
        
        if screening:
            status_val = get_val(screening, 'status')
            screening_status = status_val if status_val else "Pending"
            family_details = get_val(screening, 'family_details')
            screening_date = get_val(screening, 'created_at')
            screening_updated_at = get_val(screening, 'updated_at')
            
            # Extract from others JSON field
            others = get_val(screening, 'others')
            if others and isinstance(others, dict):
                source_of_info = others.get('source_of_info')
                family_annual_income = others.get('family_annual_income')
            
            # Extract screened_by info
            screened_by = None
            if isinstance(screening, dict):
                screened_by = screening.get('screened_by')
            elif hasattr(screening, '__dict__'):
                # Handle SQLAlchemy relationship carefully
                try:
                    screened_by = screening.screened_by
                except:
                    screened_by = None
            
            if screened_by:
                fname = get_val(screened_by, 'full_name')
                uname = get_val(screened_by, 'username')
                screened_by_name = fname if fname else uname

        # 4. Counseling Data (Relationship)
        counseling = None
        if isinstance(data, dict):
            counseling = data.get('counseling')
        elif hasattr(data, '__dict__') and 'counseling' in data.__dict__:
            counseling = data.counseling

        if counseling:
            counseling_status = get_val(counseling, 'status')
            counseling_date = get_val(counseling, 'counseling_date')
            counselor_name = get_val(counseling, 'counselor_name')
            feedback = get_val(counseling, 'feedback')
            skills = get_val(counseling, 'skills', [])
            questions = get_val(counseling, 'questions', [])
            workexperience = get_val(counseling, 'workexperience', [])
            
            counselor = None
            if isinstance(counseling, dict):
                counselor = counseling.get('counselor')
            elif hasattr(counseling, '__dict__') and 'counselor' in counseling.__dict__:
                counselor = counseling.counselor
            
            if counselor:
                fname = get_val(counselor, 'full_name')
                if fname:
                    counselor_name = fname

        # 5. Documents (Relationship)
        docs_list = None
        if isinstance(data, dict):
            docs_list = data.get('documents')
        elif hasattr(data, '__dict__') and 'documents' in data.__dict__:
            docs_list = data.documents

        if docs_list:
            documents_uploaded = [get_val(d, 'document_type') for d in docs_list]

        # 6. Build response dict
        if isinstance(data, dict):
            data.update({
                'is_disabled': is_disabled,
                'disability_type': disability_type,
                'education_level': education_level,
                'screening_status': screening_status,
                'counseling_status': counseling_status,
                'counselor_name': counselor_name,
                'counseling_date': counseling_date,
                'feedback': feedback,
                'skills': skills,
                'questions': questions,
                'workexperience': workexperience,
                'documents_uploaded': documents_uploaded,
                'family_details': family_details,
                'source_of_info': source_of_info,
                'family_annual_income': family_annual_income,
                'screened_by_name': screened_by_name,
                'screening_date': screening_date,
                'screening_updated_at': screening_updated_at
            })
            return data
            
        # For ORM objects, create a complete dict
        return {
            'public_id': get_val(data, 'public_id'),
            'name': get_val(data, 'name'),
            'gender': get_val(data, 'gender'),
            'email': get_val(data, 'email'),
            'phone': get_val(data, 'phone'),
            'whatsapp_number': get_val(data, 'whatsapp_number'),
            'dob': get_val(data, 'dob'),
            'pincode': get_val(data, 'pincode'),
            'city': get_val(data, 'city'),
            'district': get_val(data, 'district'),
            'state': get_val(data, 'state'),
            'created_at': get_val(data, 'created_at'),
            'is_disabled': is_disabled,
            'disability_type': disability_type,
            'education_level': education_level,
            'screening_status': screening_status,
            'counseling_status': counseling_status,
            'counselor_name': counselor_name,
            'counseling_date': counseling_date,
            'feedback': feedback,
            'skills': skills,
            'questions': questions,
            'workexperience': workexperience,
            'documents_uploaded': documents_uploaded,
            'family_details': family_details,
            'source_of_info': source_of_info,
            'family_annual_income': family_annual_income,
            'screened_by_name': screened_by_name,
            'screening_date': screening_date,
            'screening_updated_at': screening_updated_at
        }



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
    docs_total: int = 0
    docs_completed: int = 0
    docs_pending: int = 0
    screening_distribution: dict = {}
    counseling_distribution: dict = {}


class CandidatePaginatedResponse(BaseModel):
    """Paginated response for candidate listing"""
    items: List[CandidateListResponse]
    total: int



