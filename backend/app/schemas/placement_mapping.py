from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from app.schemas.job_role import JobRoleRead
from app.schemas.candidate import CandidateResponse
from app.schemas.user import UserResponse


from app.models.placement_mapping import PlacementStatus


class PlacementMappingBase(BaseModel):
    candidate_id: int
    job_role_id: int
    match_score: Optional[float] = 0.0
    notes: Optional[str] = None
    status: PlacementStatus = PlacementStatus.APPLIED
    priority: Optional[str] = "medium"
    source: Optional[str] = "manual"


class PlacementMappingCreate(PlacementMappingBase):
    pass


class PlacementMappingUpdate(BaseModel):
    notes: Optional[str] = None
    status: Optional[PlacementStatus] = None
    priority: Optional[str] = None
    is_active: Optional[bool] = None
    unmapped_reason: Optional[str] = None


class PlacementMappingInDBBase(PlacementMappingBase):
    id: int
    mapped_by_id: Optional[int] = None
    mapped_at: datetime
    is_active: bool = True
    unmapped_by_id: Optional[int] = None
    unmapped_at: Optional[datetime] = None
    unmapped_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PlacementMapping(PlacementMappingInDBBase):
    candidate: Optional[CandidateResponse] = None
    job_role: Optional[JobRoleRead] = None
    mapped_by: Optional[UserResponse] = None
    unmapped_by: Optional[UserResponse] = None


# Matching Engine Schemas
class MatchMatchInfo(BaseModel):
    is_match: bool
    details: Optional[str] = None


class CandidateMatchResult(BaseModel):
    public_id: UUID
    candidate_id: int
    name: str
    match_score: float
    disability: Optional[str] = None
    qualification: Optional[str] = None
    skills: List[str] = []
    skill_match: MatchMatchInfo
    qualification_match: MatchMatchInfo
    disability_match: MatchMatchInfo
    other_mappings_count: int = 0
    other_mappings: List[str] = []
    is_already_mapped: bool = False
    year_of_experience: Optional[str] = None
    status: Optional[str] = None
    mapping_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)
