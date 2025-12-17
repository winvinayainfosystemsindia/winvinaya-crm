from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.encoders import jsonable_encoder

from app.api import deps
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.candidate_profile import CandidateProfile
from app.models.candidate_counseling import CandidateCounseling
from app.models.candidate_document import CandidateDocument

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/full-dump")
async def get_analytics_dump(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN])),
):
    """
    Get a full dump of all major tables for analytics (PowerBI).
    Restricted to Admins.
    """
    
    # Fetch all data asynchronously
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()

    candidates_result = await db.execute(select(Candidate))
    candidates = candidates_result.scalars().all()

    profiles_result = await db.execute(select(CandidateProfile))
    candidate_profiles = profiles_result.scalars().all()

    counseling_result = await db.execute(select(CandidateCounseling))
    candidate_counselings = counseling_result.scalars().all()
    
    documents_result = await db.execute(select(CandidateDocument))
    candidate_documents = documents_result.scalars().all()
    
    # Convert to JSON-friendly format
    return {
        "users": jsonable_encoder(users),
        "candidates": jsonable_encoder(candidates),
        "candidate_profiles": jsonable_encoder(candidate_profiles),
        "candidate_counselings": jsonable_encoder(candidate_counselings),
        "candidate_documents": jsonable_encoder(candidate_documents),
    }
