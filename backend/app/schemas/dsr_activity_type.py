"""DSR Activity Type schemas"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class DSRActivityTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Display name, e.g. 'Development'")
    code: str = Field(..., min_length=1, max_length=20, description="Short uppercase code, e.g. 'DEV'")
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0, ge=0)

    @field_validator("code")
    @classmethod
    def code_must_be_uppercase(cls, v: str) -> str:
        return v.strip().upper().replace(" ", "_")


class DSRActivityTypeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = Field(default=None)
    sort_order: Optional[int] = Field(default=None, ge=0)

    @field_validator("code")
    @classmethod
    def code_must_be_uppercase(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return v.strip().upper().replace(" ", "_")


class DSRActivityTypeResponse(BaseModel):
    id: int
    public_id: uuid.UUID
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DSRActivityTypeListResponse(BaseModel):
    items: list[DSRActivityTypeResponse]
    total: int
    skip: int
    limit: int
