"""Training Batch Pydantic schemas"""

import uuid
from typing import Optional, List, Any
from datetime import datetime, date
from pydantic import BaseModel, Field
from app.schemas.training_batch_extension import TrainingBatchExtensionResponse


class TrainingBatchBase(BaseModel):
    batch_name: str
    disability_type: Optional[str] = None
    start_date: Optional[date] = None
    approx_close_date: Optional[date] = None
    
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
    disability_type: Optional[str] = None
    start_date: Optional[date] = None
    approx_close_date: Optional[date] = None
    
    courses: Optional[Any] = None
    duration: Optional[dict] = None
    status: Optional[str] = None
    other: Optional[dict] = None


class TrainingBatchExtend(BaseModel):
    """Schema for extending a training batch"""
    new_close_date: date
    reason: Optional[str] = None


class TrainingBatchResponse(TrainingBatchBase):
    """Schema for training batch response"""
    id: int
    public_id: uuid.UUID
    total_extension_days: int = 0
    extensions: Optional[List[TrainingBatchExtensionResponse]] = []
    created_at: datetime
    updated_at: datetime
    
class TrainingBatchPaginatedResponse(BaseModel):
    """Paginated response for training batch listing"""
    items: List[TrainingBatchResponse]
    total: int

    class Config:
        from_attributes = True
