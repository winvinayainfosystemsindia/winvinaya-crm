"""Training Batch Pydantic schemas"""

import uuid
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class TrainingBatchBase(BaseModel):
    batch_name: str
    courses: Optional[Any] = None # JSON list of courses
    duration: Optional[dict] = None # JSON with start/end/weeks
    status: str = "planned"
    other: Optional[dict] = None


class TrainingBatchCreate(TrainingBatchBase):
    """Schema for creating a training batch"""
    pass


class TrainingBatchUpdate(BaseModel):
    """Schema for updating a training batch"""
    batch_name: Optional[str] = None
    courses: Optional[Any] = None
    duration: Optional[dict] = None
    status: Optional[str] = None
    other: Optional[dict] = None


class TrainingBatchResponse(TrainingBatchBase):
    """Schema for training batch response"""
    id: int
    public_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
