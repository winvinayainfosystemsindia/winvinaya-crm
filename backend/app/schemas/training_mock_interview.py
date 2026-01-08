"""Training Mock Interview Pydantic schemas"""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class TrainingMockInterviewBase(BaseModel):
    batch_id: int
    candidate_id: int
    interviewer_name: Optional[str] = None
    interview_date: datetime = Field(default_factory=datetime.utcnow)
    questions: Optional[List[Any]] = None
    feedback: Optional[str] = None
    overall_rating: Optional[int] = None
    status: str = "pending"

class TrainingMockInterviewCreate(TrainingMockInterviewBase):
    pass


class TrainingMockInterviewUpdate(BaseModel):
    interviewer_name: Optional[str] = None
    interview_date: Optional[datetime] = None
    questions: Optional[List[Any]] = None
    feedback: Optional[str] = None
    overall_rating: Optional[int] = None
    status: Optional[str] = None


class TrainingMockInterviewResponse(TrainingMockInterviewBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
