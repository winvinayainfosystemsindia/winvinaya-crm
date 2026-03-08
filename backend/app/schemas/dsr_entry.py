"""DSR Entry schemas"""

import uuid
from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class DSRItemCreate(BaseModel):
    """A single project/activity work-log line item within a DSR entry"""
    project_public_id: uuid.UUID = Field(..., description="Project being worked on")
    activity_public_id: uuid.UUID = Field(..., description="Activity / task being worked on")
    description: str = Field(..., min_length=1, description="What was done")
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM format, e.g. 09:00")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="HH:MM format, e.g. 17:30")
    hours: Optional[float] = Field(default=None, ge=0, description="Auto-computed if not provided")

    @model_validator(mode="after")
    def compute_hours(self) -> "DSRItemCreate":
        start = time.fromisoformat(self.start_time)
        end = time.fromisoformat(self.end_time)
        start_mins = start.hour * 60 + start.minute
        end_mins = end.hour * 60 + end.minute
        if end_mins <= start_mins:
            raise ValueError("end_time must be after start_time")
        if self.hours is None:
            self.hours = round((end_mins - start_mins) / 60, 2)
        return self


class DSREntryCreate(BaseModel):
    report_date: date = Field(..., description="The day this DSR covers (cannot be a future date)")
    items: list[DSRItemCreate] = Field(..., min_length=1, description="One or more project/activity rows")
    others: Optional[dict] = Field(default=None)


class DSREntryUpdate(BaseModel):
    """Update is allowed only while the entry is in DRAFT status"""
    items: Optional[list[DSRItemCreate]] = Field(default=None, min_length=1)
    others: Optional[dict] = Field(default=None)


class DSRGrantPreviousDayPermission(BaseModel):
    """Admin grants a specific user permission to submit a DSR for a past date"""
    user_public_id: uuid.UUID
    report_date: date


class DSRSendReminder(BaseModel):
    """Admin sends reminders to a list of users"""
    user_public_ids: Optional[list[uuid.UUID]] = Field(default=None, description="If empty/None, all missing users will be reminded")
    report_date: date
    message: Optional[str] = Field(default=None, description="Optional custom reminder message")


# ---- Response schemas ----

class DSRItemResponse(BaseModel):
    """Enriched line item — includes project/activity names resolved from IDs"""
    project_public_id: uuid.UUID
    project_name: Optional[str] = None
    activity_public_id: uuid.UUID
    activity_name: Optional[str] = None
    description: str
    start_time: str
    end_time: str
    hours: float

    model_config = {"from_attributes": True}


class DSRUserMiniResponse(BaseModel):
    id: int
    public_id: uuid.UUID
    full_name: Optional[str]
    username: str
    email: str

    model_config = {"from_attributes": True}


class DSREntryResponse(BaseModel):
    id: int
    public_id: uuid.UUID
    user_id: int
    user: Optional[DSRUserMiniResponse] = None
    report_date: date
    status: str
    submitted_at: Optional[datetime] = None
    is_previous_day_submission: bool
    previous_day_permission_granted_by: Optional[int] = None
    items: list[dict]          # raw JSON; enriched at service layer before returning
    others: Optional[dict] = None
    # Admin review fields
    admin_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DSREntryListResponse(BaseModel):
    items: list[DSREntryResponse]
    total: int
    skip: int
    limit: int


class DSRMissingUserResponse(BaseModel):
    """Info about a user who hasn't submitted DSR for a given date"""
    user_id: int
    public_id: uuid.UUID
    full_name: Optional[str]
    username: str
    email: str
    report_date: date


class DSRApproveEntry(BaseModel):
    """Admin approves a submitted DSR entry"""
    admin_notes: Optional[str] = Field(default=None, description="Optional feedback for the user")


class DSRRejectEntry(BaseModel):
    """Admin rejects a submitted DSR entry — reason is mandatory"""
    reason: str = Field(..., min_length=10, description="Why this DSR is being rejected (min 10 chars)")
