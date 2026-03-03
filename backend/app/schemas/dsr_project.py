"""DSR Project schemas"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DSRProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    owner_user_public_id: uuid.UUID = Field(..., description="Public ID of the user who owns this project")
    is_active: bool = Field(default=True)
    others: Optional[dict] = Field(default=None, description="Extensible metadata")


class DSRProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    owner_user_public_id: Optional[uuid.UUID] = Field(default=None)
    is_active: Optional[bool] = Field(default=None)
    others: Optional[dict] = Field(default=None)


class DSRUserSnapshot(BaseModel):
    """Minimal user info embedded in project responses"""
    id: int
    public_id: uuid.UUID
    full_name: Optional[str]
    username: str
    email: str

    model_config = {"from_attributes": True}


class DSRProjectResponse(BaseModel):
    id: int
    public_id: uuid.UUID
    name: str
    is_active: bool
    owner_id: int
    owner: Optional[DSRUserSnapshot] = None
    others: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DSRProjectListResponse(BaseModel):
    items: list[DSRProjectResponse]
    total: int
    skip: int
    limit: int


# Excel import
class DSRProjectImportRow(BaseModel):
    """Schema for a single row parsed from the Excel import file"""
    name: str
    owner_email: str  # resolved to user during import
    is_active: Optional[bool] = True
    others: Optional[dict] = None


class DSRProjectImportResult(BaseModel):
    """Summary returned after an Excel import"""
    total_rows: int
    created: int
    skipped: int
    errors: list[dict]
