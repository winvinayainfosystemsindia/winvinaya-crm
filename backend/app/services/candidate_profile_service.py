"""Candidate Profile Service"""

from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_profile import CandidateProfile
from app.schemas.candidate_profile import CandidateProfileCreate, CandidateProfileUpdate
from app.repositories.candidate_profile_repository import CandidateProfileRepository
from app.repositories.candidate_repository import CandidateRepository


class CandidateProfileService:
    """Service for candidate profile operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = CandidateProfileRepository(db)
        self.candidate_repo = CandidateRepository(db)
    
    async def create_profile(
        self, 
        candidate_public_id: UUID, 
        profile_in: CandidateProfileCreate
    ) -> CandidateProfile:
        """Create profile for a candidate"""
        # Verify candidate exists
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check if profile already exists
        if candidate.profile:
            raise HTTPException(
                status_code=400, 
                detail="Profile already exists. Use PUT to update."
            )
        
        # Create profile
        profile_data = profile_in.model_dump()
        profile_data["candidate_id"] = candidate.id  # Use internal id
        
        return await self.repository.create(profile_data)
    
    async def update_profile(
        self,
        candidate_public_id: UUID,
        profile_in: CandidateProfileUpdate
    ) -> CandidateProfile:
        """Update candidate profile"""
        # Get candidate with profile
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.profile:
            raise HTTPException(
                status_code=404, 
                detail="Profile not found. Use POST to create."
            )
        
        # Update profile
        update_data = profile_in.model_dump(exclude_unset=True)
        return await self.repository.update(candidate.profile.id, update_data)
    
    async def delete_profile(self, candidate_public_id: UUID) -> bool:
        """Delete candidate profile"""
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return await self.repository.delete(candidate.profile.id)
