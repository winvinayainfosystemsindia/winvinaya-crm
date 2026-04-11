"""
AI Engine — CRM Tools
====================

Standardized tools for AI-driven CRM operations.
Includes: search_contacts, get_lead_details, create_lead, create_contact, create_company.
"""

from __future__ import annotations

import logging
from typing import Any, TYPE_CHECKING

from app.ai.schemas import ToolDefinition, ToolParameterSchema, ToolResult
from app.ai.tool_registry import BaseTool, registry
from app.api.deps import get_current_user
from app.models.lead import LeadSource, LeadStatus
from app.repositories.contact_repository import ContactRepository
from app.repositories.lead_repository import LeadRepository
from app.repositories.company_repository import CompanyRepository
from app.schemas.lead import LeadCreate
from app.schemas.contact import ContactCreate
from app.schemas.company import CompanyCreate

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


# ── Search Contacts ───────────────────────────────────────────────────────────

class SearchContactsTool(BaseTool):
    """
    Finds existing contacts in the CRM.
    Used to check if a person (from WhatsApp/JD) is already known.
    """
    definition = ToolDefinition(
        name="search_contacts",
        description="Search for existing contacts by name, email, or phone number.",
        category="crm",
        is_read_only=True,
        parameters={
            "query": ToolParameterSchema(
                type="string",
                description="Search term (name, email, or phone)"
            )
        },
        required_parameters=["query"]
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession") -> ToolResult:
        query = params["query"]
        repo = ContactRepository(db)
        contacts = await repo.get_contacts(search=query, limit=5)

        if not contacts:
            return ToolResult(
                success=True,
                message=f"No contacts found matching '{query}'.",
                data={"contacts": []}
            )

        data = [
            {
                "id": c.id,
                "full_name": c.full_name,
                "email": c.email,
                "mobile": c.mobile,
                "company": c.company.name if c.company else None
            }
            for c in contacts
        ]

        return ToolResult(
            success=True,
            message=f"Found {len(contacts)} contact(s).",
            data={"contacts": data}
        )


# ── Create Lead ───────────────────────────────────────────────────────────────

class CreateLeadTool(BaseTool):
    """
    Creates a new high-intent lead in the CRM.
    Used for WhatsApp enquiries or JD parsing results.
    """
    definition = ToolDefinition(
        name="create_lead",
        description="Create a new CRM lead record with contact and company details.",
        category="crm",
        requires_approval=True,  # Safety first for writes
        parameters={
            "title": ToolParameterSchema(type="string", description="Lead title (e.g., 'React Developer Enquiry')"),
            "contact_id": ToolParameterSchema(type="integer", description="ID of an existing contact (optional)"),
            "company_name": ToolParameterSchema(type="string", description="Name of the company/employer"),
            "contact_name": ToolParameterSchema(type="string", description="Full name of the person"),
            "email": ToolParameterSchema(type="string", description="Email address"),
            "phone": ToolParameterSchema(type="string", description="Phone number"),
            "source": ToolParameterSchema(
                type="string",
                description="Where this lead came from",
                enum=["whatsapp", "email", "website", "referral", "event"],
                default="whatsapp"
            ),
            "notes": ToolParameterSchema(type="string", description="Contextual notes about the lead")
        },
        required_parameters=["title", "company_name", "contact_name"]
    )

    async def execute(self, params: dict[str, Any], db: "AsyncSession") -> ToolResult:
        try:
            # 1. Handle Company
            comp_repo = CompanyRepository(db)
            companies = await comp_repo.get_companies(search=params["company_name"], limit=1)
            company = companies[0] if companies else None

            if not company:
                company = await comp_repo.create_company(CompanyCreate(
                    name=params["company_name"],
                    company_status="active"
                ))

            # 2. Handle Contact
            contact_id = params.get("contact_id")
            cont_repo = ContactRepository(db)
            contact = None

            if contact_id:
                contact = await cont_repo.get(contact_id)

            if not contact:
                contact = await cont_repo.create_contact(ContactCreate(
                    full_name=params["contact_name"],
                    email=params.get("email"),
                    mobile=params.get("phone"),
                    company_id=company.id
                ))

            # 3. Create Lead
            lead_repo = LeadRepository(db)
            lead = await lead_repo.create_lead(LeadCreate(
                title=params["title"],
                company_id=company.id,
                contact_id=contact.id,
                lead_source=params.get("source", "whatsapp"),
                lead_status=LeadStatus.NEW.value,
                description=params.get("notes")
            ))

            return ToolResult(
                success=True,
                message=f"Lead '{lead.title}' created successfully for {contact.full_name} ({company.name}).",
                data={"lead_id": lead.id, "public_id": str(lead.public_id)},
                records_affected=3  # Lead, Contact, Company (potentially)
            )

        except Exception as e:
            logger.exception("Error in create_lead tool")
            return ToolResult(success=False, message=f"Failed to create lead: {str(e)}", error=str(e))


# ── Registration ─────────────────────────────────────────────────────────────

registry.register(SearchContactsTool())
registry.register(CreateLeadTool())
