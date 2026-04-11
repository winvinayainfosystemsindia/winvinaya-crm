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
    job_roles,
    placement_mapping,
    placement_pipeline,
    placement_interviews,
    placement_offers,
    placement_notes,
    system_settings,
    training_batch_plans,
    dsr_projects,
    dsr_activities,
    dsr_entries,
    dsr_leaves,
    dsr_activity_types,
    dsr_project_requests,
    company_holidays,
    notifications,
    x0pa,
    maintenance,
    skills,
    ai,
    ai_settings,
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
router.include_router(tickets.router)
router.include_router(training_attendance.router, prefix="/training-extensions")
router.include_router(training_assignments.router, prefix="/training-extensions")

router.include_router(training_events.router, prefix="/training-extensions")
router.include_router(training_mock_interviews.router, prefix="/training-extensions")
router.include_router(training_batch_plans.router)
router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# CRM Routers
router.include_router(companies.router, prefix="/crm/companies", tags=["CRM Companies"])
router.include_router(contacts.router, prefix="/crm/contacts", tags=["CRM Contacts"])
router.include_router(leads.router, prefix="/crm/leads", tags=["CRM Leads"])
router.include_router(deals.router, prefix="/crm/deals", tags=["CRM Deals"])
router.include_router(crm_tasks.router, prefix="/crm/tasks", tags=["CRM Tasks"])
router.include_router(crm_activities.router, prefix="/crm/activities", tags=["CRM Activities"])
# Placement Routers
router.include_router(job_roles.router, prefix="/placement/job-roles", tags=["Placement Job Roles"])
router.include_router(placement_mapping.router)
router.include_router(placement_pipeline.router, prefix="/placement/pipeline", tags=["Placement Pipeline"])
router.include_router(placement_interviews.router, prefix="/placement/interviews", tags=["Placement Interviews"])
router.include_router(placement_offers.router, prefix="/placement/offers", tags=["Placement Offers"])
router.include_router(placement_notes.router, prefix="/placement/notes", tags=["Placement Notes"])

# DSR Routers
router.include_router(dsr_projects.router, prefix="/dsr/projects", tags=["DSR Projects"])
router.include_router(dsr_activities.router, prefix="/dsr/activities", tags=["DSR Activities"])
router.include_router(dsr_entries.router, prefix="/dsr", tags=["DSR Entries"])
router.include_router(dsr_leaves.router, prefix="/dsr/leaves", tags=["DSR Leaves"])
router.include_router(dsr_activity_types.router, prefix="/dsr/activity-types", tags=["DSR Activity Types"])
router.include_router(dsr_project_requests.router, prefix="/dsr/project-requests", tags=["DSR Project Requests"])
router.include_router(company_holidays.router, prefix="/dsr/holidays", tags=["Company Holidays"])
router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance"])
router.include_router(skills.router, prefix="/skills", tags=["Skills"])

# AI Engine
router.include_router(ai.router, prefix="/ai", tags=["AI Engine"])
router.include_router(ai_settings.router, prefix="/ai/settings", tags=["AI Engine Settings"])

# X0PA Integration
router.include_router(x0pa.router)
