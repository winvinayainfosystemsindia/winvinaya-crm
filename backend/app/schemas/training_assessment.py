"""Training Assessment Pydantic schemas"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TrainingAssessmentBase(BaseModel):
    batch_id: int
    candidate_id: int
    assessment_name: str
    description: Optional[str] = None
    course_name: Optional[list[str]] = None
    course_marks: Optional[dict[str, float]] = None
    trainer_id: Optional[int] = None
    marks_obtained: float
    max_marks: float = 100.0
    assessment_date: date
    submission_date: Optional[date] = None
    others: Optional[dict] = None


class TrainingAssessmentCreate(TrainingAssessmentBase):
    pass


class TrainingAssessmentUpdate(BaseModel):
    assessment_name: Optional[str] = None
    description: Optional[str] = None
    course_name: Optional[list[str]] = None
    course_marks: Optional[dict[str, float]] = None
    trainer_id: Optional[int] = None
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    assessment_date: Optional[date] = None
    submission_date: Optional[date] = None
    others: Optional[dict] = None


class TrainingAssessmentResponse(TrainingAssessmentBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
