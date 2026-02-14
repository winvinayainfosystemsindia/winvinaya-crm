"""API v1 main router"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    candidates,
    candidate_documents,
    candidate_counseling,
    candidate_screening,
    training_batches,
    training_attendance,
    training_assignments,
    training_events,
    training_mock_interviews,
    training_candidate_allocations,
    tickets,
    settings,
    activity_logs,
    analytics,
    companies,
    contacts,
    leads,
    deals,
    crm_tasks,
    crm_activities,
    system_settings,
    chat,
    training_batch_plans
)


# Create main v1 router
router = APIRouter()

# Include all endpoint routers
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(activity_logs.router)
router.include_router(candidates.router)
router.include_router(candidate_screening.router)
router.include_router(candidate_documents.router)
router.include_router(candidate_counseling.router)
router.include_router(analytics.router)
router.include_router(training_batches.router)
router.include_router(training_candidate_allocations.router)
router.include_router(settings.router)
router.include_router(system_settings.router)
router.include_router(chat.router)
router.include_router(tickets.router)
router.include_router(training_attendance.router, prefix="/training-extensions")
router.include_router(training_assignments.router, prefix="/training-extensions")
router.include_router(training_events.router, prefix="/training-extensions")
router.include_router(training_mock_interviews.router, prefix="/training-extensions")
router.include_router(training_batch_plans.router)

# CRM Routers
router.include_router(companies.router, prefix="/crm/companies", tags=["CRM Companies"])
router.include_router(contacts.router, prefix="/crm/contacts", tags=["CRM Contacts"])
router.include_router(leads.router, prefix="/crm/leads", tags=["CRM Leads"])
router.include_router(deals.router, prefix="/crm/deals", tags=["CRM Deals"])
router.include_router(crm_tasks.router, prefix="/crm/tasks", tags=["CRM Tasks"])
router.include_router(crm_activities.router, prefix="/crm/activities", tags=["CRM Activities"])

