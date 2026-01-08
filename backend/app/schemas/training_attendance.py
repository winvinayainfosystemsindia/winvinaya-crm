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


class TrainingAttendanceResponse(TrainingAttendanceBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
