"""Training Candidate Analysis Pydantic schemas"""

from datetime import datetime, timezone
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class AnalysisSkillSchema(BaseModel):
    skill: str
    level: str  # Beginner, Intermediate, Expert
    rating: float = Field(..., ge=0, le=10)


class TrainingCandidateAnalysisBase(BaseModel):
    batch_id: int
    candidate_id: int
    analyst_name: Optional[str] = None
    analysis_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    skills: Optional[List[AnalysisSkillSchema]] = None
    other: Optional[Any] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    opportunities: Optional[str] = None
    threats: Optional[str] = None
    technical_rating: float = Field(0.0, ge=0, le=10)
    communication_rating: float = Field(0.0, ge=0, le=10)
    attitude_rating: float = Field(0.0, ge=0, le=10)
    overall_rating: float = Field(0.0, ge=0, le=10)
    recommendation: str = "ready_for_placement"
    status: str = "in-progress"


class TrainingCandidateAnalysisCreate(TrainingCandidateAnalysisBase):
    pass


class TrainingCandidateAnalysisUpdate(BaseModel):
    analyst_name: Optional[str] = None
    analysis_date: Optional[datetime] = None
    skills: Optional[List[AnalysisSkillSchema]] = None
    other: Optional[Any] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    opportunities: Optional[str] = None
    threats: Optional[str] = None
    technical_rating: Optional[float] = Field(None, ge=0, le=10)
    communication_rating: Optional[float] = Field(None, ge=0, le=10)
    attitude_rating: Optional[float] = Field(None, ge=0, le=10)
    overall_rating: Optional[float] = Field(None, ge=0, le=10)
    recommendation: Optional[str] = None
    status: Optional[str] = None


from app.schemas.training_batch import TrainingBatchMini
from app.schemas.candidate import CandidateMini

class TrainingCandidateAnalysisResponse(TrainingCandidateAnalysisBase):
    id: int
    created_at: datetime
    updated_at: datetime
    batch: Optional[TrainingBatchMini] = None
    candidate: Optional[CandidateMini] = None
    
    model_config = ConfigDict(from_attributes=True)
