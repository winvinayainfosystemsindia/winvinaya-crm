"""Contact Schemas"""

from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.contact import ContactSource


class ContactBase(BaseModel):
    company_id: Optional[int] = None
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    mobile: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    is_primary: bool = False
    is_decision_maker: bool = False
    linkedin_url: Optional[str] = Field(None, max_length=255)
    contact_source: Optional[ContactSource] = None
    contact_preferences: Optional[Dict[str, Any]] = None
    address: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    company_id: Optional[int] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    mobile: Optional[str] = Field(None, max_length=50)
    designation: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    is_primary: Optional[bool] = None
    is_decision_maker: Optional[bool] = None
    linkedin_url: Optional[str] = Field(None, max_length=255)
    contact_source: Optional[ContactSource] = None
    contact_preferences: Optional[Dict[str, Any]] = None
    address: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class ContactRead(ContactBase):
    public_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
