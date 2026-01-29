"""User model - example database model"""

import enum
from sqlalchemy import String, Boolean, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"
    MANAGER = "manager"
    SOURCING = "sourcing"
    PLACEMENT = "placement"
    TRAINER = "trainer"
    COUNSELOR = "counselor"
    # CRM Roles
    SALES_MANAGER = "sales_manager"
    SALES_REP = "sales_rep"
    SUPPORT = "support"
    VIEWER = "viewer"


class User(BaseModel):
    """User database model"""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    
    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    is_superuser: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.PLACEMENT,
        nullable=False,
        index=True,
    )
    
    # CRM-specific fields
    team: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
        comment="Sales team assignment"
    )
    
    sales_quota_monthly: Mapped[float | None] = mapped_column(
        Numeric(15, 2),
        nullable=True,
        comment="Monthly sales target"
    )
    
    commission_percentage: Mapped[float | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
        comment="Commission rate"
    )
    
    # CRM Relationships
    assigned_leads: Mapped[list["Lead"]] = relationship(  # noqa: F821
        "Lead",
        foreign_keys="Lead.assigned_to",
        back_populates="assigned_user",
    )
    
    assigned_deals: Mapped[list["Deal"]] = relationship(  # noqa: F821
        "Deal",
        foreign_keys="Deal.assigned_to",
        back_populates="assigned_user",
    )
    
    assigned_crm_tasks: Mapped[list["CRMTask"]] = relationship(  # noqa: F821
        "CRMTask",
        foreign_keys="CRMTask.assigned_to",
        back_populates="assigned_user",
    )
    
    created_crm_tasks: Mapped[list["CRMTask"]] = relationship(  # noqa: F821
        "CRMTask",
        foreign_keys="CRMTask.created_by",
        back_populates="creator",
    )
    
    crm_activities: Mapped[list["CRMActivityLog"]] = relationship(  # noqa: F821
        "CRMActivityLog",
        foreign_keys="CRMActivityLog.performed_by",
        back_populates="performer",
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"
