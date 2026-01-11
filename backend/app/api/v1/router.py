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
    training_extensions,
    training_candidate_allocations,
    tickets,
    settings,
    activity_logs,
    analytics,
    mock_interviews
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
router.include_router(mock_interviews.router, prefix="/mock-interviews", tags=["Mock Interviews"])
router.include_router(analytics.router)
router.include_router(training_batches.router)
router.include_router(training_candidate_allocations.router)
router.include_router(settings.router)
router.include_router(tickets.router)
router.include_router(training_extensions.router)
