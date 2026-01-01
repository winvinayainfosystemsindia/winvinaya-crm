"""API v1 main router"""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    activity_logs,
    candidates,
    candidate_screening,
    candidate_documents,
    candidate_counseling,
    analytics,
    training_batches,
    candidate_allocations,
    settings
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
router.include_router(candidate_allocations.router)
router.include_router(settings.router)
