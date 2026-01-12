"""Candidate Allocation Pydantic schemas"""

import uuid
from typing import Optional, List, Any
from datetime import datetime, date
from pydantic import BaseModel


class TrainingCandidateAllocationBase(BaseModel):
    batch_id: Optional[int] = None
    candidate_id: Optional[int] = None
    status: Optional[dict] = None # Status info per candidate
    is_dropout: bool = False
    dropout_remark: Optional[str] = None
    others: Optional[dict] = None


class TrainingCandidateAllocationCreate(TrainingCandidateAllocationBase):
    """Schema for creating a candidate allocation"""
    batch_public_id: Optional[uuid.UUID] = None
    candidate_public_id: Optional[uuid.UUID] = None


class TrainingCandidateAllocationUpdate(BaseModel):
    """Schema for updating a candidate allocation"""
    batch_id: Optional[int] = None
    candidate_id: Optional[int] = None
    status: Optional[dict] = None
    is_dropout: Optional[bool] = None
    dropout_remark: Optional[str] = None
    others: Optional[dict] = None


class CandidateMini(BaseModel):
    public_id: uuid.UUID
    name: str
    email: str
    phone: str

    class Config:
        from_attributes = True


from app.schemas.training_batch import TrainingBatchMini

class TrainingCandidateAllocationResponse(TrainingCandidateAllocationBase):
    """Schema for candidate allocation response"""
    id: int
    public_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    # Nested data
    candidate: Optional[CandidateMini] = None
    batch: Optional[TrainingBatchMini] = None

    class Config:
        from_attributes = True
