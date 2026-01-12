"""Training Attendance Pydantic schemas"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TrainingAttendanceBase(BaseModel):
    batch_id: int
    candidate_id: int
    date: date
    status: str = "present"
    remarks: Optional[str] = None


class TrainingAttendanceCreate(TrainingAttendanceBase):
    pass


class TrainingAttendanceUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None


from app.schemas.training_batch import TrainingBatchMini

class TrainingAttendanceResponse(TrainingAttendanceBase):
    id: int
    batch: Optional[TrainingBatchMini] = None
    
    model_config = ConfigDict(from_attributes=True)
