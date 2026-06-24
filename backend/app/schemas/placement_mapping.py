from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict
from app.schemas.job_role import JobRoleRead
from app.schemas.candidate import CandidateResponse
from app.schemas.user import UserResponse


from app.models.placement_mapping import PlacementStatus


class PlacementMappingBase(BaseModel):
    candidate_id: int
    job_role_id: int
    match_score: Optional[float] = 0.0
    notes: Optional[str] = None
    status: PlacementStatus = PlacementStatus.MAPPED
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
    ai_explanation: Optional[str] = None
    score_source: Optional[str] = "rule_based"
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PlacementMapping(PlacementMappingInDBBase):
    candidate: Optional[CandidateResponse] = None
    job_role: Optional[JobRoleRead] = None
    mapped_by: Optional[UserResponse] = None
    unmapped_by: Optional[UserResponse] = None

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        """Custom validation to handle unloaded SQLAlchemy relationships"""
        from sqlalchemy.inspect import inspect
        
        # If this is a SQLAlchemy object, check which relationships are loaded
        if hasattr(obj, '__dict__'):
            state = inspect(obj)
            if state:
                # Only include relationships that are actually loaded
                data = {}
                # Get fields from ALL bases
                all_fields = {}
                for base in cls.__mro__:
                    if hasattr(base, 'model_fields'):
                        all_fields.update(base.model_fields)
                
                for key in all_fields.keys():
                    if key in ['candidate', 'job_role', 'mapped_by', 'unmapped_by']:
                        # Check if the relationship is loaded
                        if key in state.unloaded:
                            # Skip unloaded relationships
                            continue
                    # Get the attribute value
                    try:
                        data[key] = getattr(obj, key)
                    except:
                        # If we can't get it (e.g. detached), skip it
                        continue
                        
                return super().model_validate(data, *args, **kwargs)
        
        return super().model_validate(obj, *args, **kwargs)


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
    other_mappings: List[str] = Field(default_factory=list)
    is_already_mapped: bool = False
    is_placed_elsewhere: bool = False
    placed_elsewhere_info: Optional[str] = None
    year_of_experience: Optional[str] = None
    status: Optional[str] = None
    mapping_id: Optional[int] = None
    source_of_info: Optional[str] = None
    beneficiary_status: Optional[str] = None
    # AI Scoring fields
    ai_explanation: Optional[str] = None
    ai_recommendation: Optional[str] = None
    score_source: str = "rule_based"  # "ai" | "rule_based"
    
    model_config = ConfigDict(from_attributes=True)


# Bulk Mapping Schemas
class PlacementBulkMappingItem(BaseModel):
    candidate_id: int
    match_score: float
    ai_explanation: Optional[str] = None
    score_source: Optional[str] = "rule_based"


class PlacementMappingBulkCreate(BaseModel):
    job_role_id: int
    mappings: List[PlacementBulkMappingItem]
    notes: Optional[str] = None


# AI Scoring Request/Response
class AIScoreRequest(BaseModel):
    candidate_ids: List[int]


class AIScoreResultItem(BaseModel):
    score: Optional[float] = None
    explanation: Optional[str] = None
    recommendation: Optional[str] = None
    score_source: str = "rule_based"


class AIScoreResponse(BaseModel):
    scores: Dict[str, AIScoreResultItem]  # key = str(candidate_id)
