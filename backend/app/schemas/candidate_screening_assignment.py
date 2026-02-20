"""Candidate Screening Assignment Pydantic schemas"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class AssignCandidatesRequest(BaseModel):
    """Assign one or more candidates to a screener"""
    candidate_public_ids: List[str]   # UUIDs of candidates to assign
    assigned_to_user_id: int          # Internal user ID of the screener


class UnassignCandidateRequest(BaseModel):
    """Remove assignment from a candidate"""
    candidate_public_id: str


class AssignmentResponse(BaseModel):
    """Assignment info returned in API responses"""
    id: int
    candidate_id: int
    assigned_to_id: int
    assigned_to_name: Optional[str] = None
    assigned_to_username: Optional[str] = None
    assigned_by_id: Optional[int] = None
    assigned_by_name: Optional[str] = None
    assigned_at: datetime

    class Config:
        from_attributes = True


class EligibleScreenerResponse(BaseModel):
    """A user who can be assigned as a screener"""
    id: int
    username: str
    full_name: Optional[str] = None
    role: str

    class Config:
        from_attributes = True


class BulkAssignResult(BaseModel):
    """Result of bulk assign operation"""
    assigned_count: int
    message: str
