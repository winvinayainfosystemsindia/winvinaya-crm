"""API v1 main router"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, activity_logs


# Create main v1 router
router = APIRouter()

# Include all endpoint routers
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(activity_logs.router)

# Add more endpoint routers here as you create them
# router.include_router(products.router)
# router.include_router(orders.router)
# etc.
