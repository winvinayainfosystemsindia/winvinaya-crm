"""Advanced Assessment Pydantic schemas"""

from uuid import UUID
from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field


# --- Question Schemas ---
class QuestionBase(BaseModel):
    text: str
    type: str # MCQ, TF
    options: Optional[Union[dict, list]] = None
    correct_answer: str
    marks: float = 1.0
    others: Optional[dict] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    options: Optional[Union[dict, list]] = None
    correct_answer: Optional[str] = None
    marks: Optional[float] = None
    others: Optional[dict] = None

class QuestionResponse(QuestionBase):
    id: int
    assessment_id: int
    model_config = ConfigDict(from_attributes=True)

class PublicQuestionResponse(BaseModel):
    id: int
    assessment_id: int
    text: str
    type: str
    options: Optional[Union[dict, list]] = None
    marks: float
    model_config = ConfigDict(from_attributes=True)


# --- Assessment Schemas ---
class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    security_key: Optional[str] = None
    is_active: bool = True
    pass_percentage: float = 40.0
    include_seb: bool = False
    seb_config_key: Optional[str] = None
    others: Optional[dict] = None

class AssessmentCreate(AssessmentBase):
    batch_id: Optional[int] = None
    questions: List[QuestionCreate]

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    security_key: Optional[str] = None
    is_active: Optional[bool] = None
    pass_percentage: Optional[float] = None
    others: Optional[dict] = None

class AssessmentResponse(AssessmentBase):
    id: int
    public_id: UUID
    batch_id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AssessmentDetailResponse(AssessmentResponse):
    questions: List[PublicQuestionResponse]


# --- Result & Response Schemas ---
class ResponseBase(BaseModel):
    question_id: int
    selected_answer: Optional[str] = None
    others: Optional[dict] = None

class ResponseCreate(ResponseBase):
    pass

class AssessmentResultBase(BaseModel):
    others: Optional[dict] = None

class AssessmentResultStart(AssessmentResultBase):
    assessment_id: Optional[int] = None
    email: str
    dob: str # ISO date string

class AssessmentResultSubmit(BaseModel):
    responses: List[ResponseCreate]

class AssessmentResponseDetail(ResponseBase):
    id: int
    result_id: int
    is_correct: bool
    model_config = ConfigDict(from_attributes=True)

class AssessmentResultResponse(BaseModel):
    id: int
    assessment_id: int
    candidate_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    total_score: float
    started_at: datetime
    submitted_at: Optional[datetime] = None
    status: str
    others: Optional[dict] = None
    responses: List[AssessmentResponseDetail] = []
    model_config = ConfigDict(from_attributes=True)
