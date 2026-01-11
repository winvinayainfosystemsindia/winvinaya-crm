"""Training Mock Interview Pydantic schemas"""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class QuestionSchema(BaseModel):
    question: str
    answer: str


class SkillSchema(BaseModel):
    skill: str
    level: str  # Beginner, Intermediate, Expert
    rating: float = Field(..., ge=0, le=10)


class TrainingMockInterviewBase(BaseModel):
    batch_id: int
    candidate_id: int
    interviewer_name: Optional[str] = None
    interview_date: datetime = Field(default_factory=datetime.utcnow)
    questions: Optional[List[QuestionSchema]] = None
    skills: Optional[List[SkillSchema]] = None
    feedback: Optional[str] = None
    overall_rating: Optional[float] = Field(None, ge=0, le=10)
    status: str = "pending"


class TrainingMockInterviewCreate(TrainingMockInterviewBase):
    pass


class TrainingMockInterviewUpdate(BaseModel):
    interviewer_name: Optional[str] = None
    interview_date: Optional[datetime] = None
    questions: Optional[List[QuestionSchema]] = None
    skills: Optional[List[SkillSchema]] = None
    feedback: Optional[str] = None
    overall_rating: Optional[float] = Field(None, ge=0, le=10)
    status: Optional[str] = None


class TrainingMockInterviewResponse(TrainingMockInterviewBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
