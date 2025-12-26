"""Candidate Allocation Pydantic schemas"""

import uuid
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class CandidateAllocationBase(BaseModel):
    batch_id: int
    candidate_id: int
    status: Optional[dict] = None # Status info per candidate
    others: Optional[dict] = None


class CandidateAllocationCreate(CandidateAllocationBase):
    """Schema for creating a candidate allocation"""
    pass


class CandidateAllocationUpdate(BaseModel):
    """Schema for updating a candidate allocation"""
    batch_id: Optional[int] = None
    candidate_id: Optional[int] = None
    status: Optional[dict] = None
    others: Optional[dict] = None


class CandidateAllocationResponse(CandidateAllocationBase):
    """Schema for candidate allocation response"""
    id: int
    public_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
