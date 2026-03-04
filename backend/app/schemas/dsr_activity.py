"""DSR Activity schemas"""

import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from app.models.dsr_activity import DSRActivityStatus


class DSRActivityCreate(BaseModel):
    project_public_id: uuid.UUID = Field(..., description="Public ID of the parent project")
    name: str = Field(..., min_length=1, max_length=255, description="Activity / work-item name")
    description: Optional[str] = Field(default=None, description="Detailed description of the activity")
    start_date: date = Field(..., description="Planned start date")
    end_date: date = Field(..., description="Planned end date")
    actual_end_date: Optional[date] = Field(default=None, description="Actual completion date")
    status: DSRActivityStatus = Field(default=DSRActivityStatus.PLANNED)
    is_active: bool = Field(default=True)
    others: Optional[dict] = Field(default=None, description="Extensible metadata")

    @model_validator(mode="after")
    def validate_dates(self) -> "DSRActivityCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class DSRActivityUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    actual_end_date: Optional[date] = Field(default=None)
    status: Optional[DSRActivityStatus] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    others: Optional[dict] = Field(default=None)

    @model_validator(mode="after")
    def validate_dates(self) -> "DSRActivityUpdate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class DSRProjectSnapshot(BaseModel):
    """Minimal project info embedded inside activity responses"""
    id: int
    public_id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class DSRActivityResponse(BaseModel):
    id: int
    public_id: uuid.UUID
    project_id: int
    project: Optional[DSRProjectSnapshot] = None
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    actual_end_date: Optional[date] = None
    status: DSRActivityStatus
    is_active: bool
    others: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DSRActivityListResponse(BaseModel):
    items: list[DSRActivityResponse]
    total: int
    skip: int
    limit: int


# Excel import
class DSRActivityImportRow(BaseModel):
    """Schema for a single row parsed from the Excel import file"""
    project_name: str          # resolved to project during import
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: date
    status: Optional[DSRActivityStatus] = DSRActivityStatus.PLANNED
    others: Optional[dict] = None


class DSRActivityImportResult(BaseModel):
    total_rows: int
    created: int
    skipped: int
    errors: list[dict]
