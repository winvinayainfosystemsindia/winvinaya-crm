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
    training_assessments,
    training_events,
    training_mock_interviews,
    training_candidate_allocations,
    tickets,
    settings,
    activity_logs,
    analytics
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
router.include_router(tickets.router)
router.include_router(training_attendance.router, prefix="/training-extensions")
router.include_router(training_assessments.router, prefix="/training-extensions")
router.include_router(training_events.router, prefix="/training-extensions")
router.include_router(training_mock_interviews.router, prefix="/training-extensions")

