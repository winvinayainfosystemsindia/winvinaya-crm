"""Training Assessment Pydantic schemas"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TrainingAssessmentBase(BaseModel):
    batch_id: int
    candidate_id: int
    assessment_name: str
    marks_obtained: float
    max_marks: float = 100.0
    assessment_date: date


class TrainingAssessmentCreate(TrainingAssessmentBase):
    pass


class TrainingAssessmentUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    max_marks: Optional[float] = None
    assessment_name: Optional[str] = None
    assessment_date: Optional[date] = None


class TrainingAssessmentResponse(TrainingAssessmentBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
