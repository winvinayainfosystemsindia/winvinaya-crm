"""Lead Schemas"""

from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.lead import LeadStatus, LeadSource
from app.schemas.deal import DealRead
from app.schemas.user import UserResponse


class LeadBase(BaseModel):
    company_id: Optional[int] = None
    contact_id: Optional[int] = None
    assigned_to: int
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    lead_source: LeadSource
    lead_status: LeadStatus = LeadStatus.NEW
    lead_score: int = Field(0, ge=0, le=100)
    estimated_value: Optional[Decimal] = None
    currency: str = Field("INR", max_length=3)
    expected_close_date: Optional[date] = None
    tags: Optional[List[str]] = None
    qualification_notes: Optional[Dict[str, Any]] = None
    utm_data: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    company_id: Optional[int] = None
    contact_id: Optional[int] = None
    assigned_to: Optional[int] = None
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    lead_source: Optional[LeadSource] = None
    lead_status: Optional[LeadStatus] = None
    lead_score: Optional[int] = Field(None, ge=0, le=100)
    estimated_value: Optional[Decimal] = None
    currency: Optional[str] = Field(None, max_length=3)
    expected_close_date: Optional[date] = None
    tags: Optional[List[str]] = None
    qualification_notes: Optional[Dict[str, Any]] = None
    utm_data: Optional[Dict[str, Any]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class LeadRead(LeadBase):
    id: int
    public_id: UUID
    assigned_user: Optional[UserResponse] = None
    converted_to_deal_id: Optional[int] = None
    conversion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    items: List[LeadRead]
    total: int


class LeadConversionResponse(BaseModel):
    lead: LeadRead
    deal: DealRead
