"""Candidate Screening Service"""

from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_screening import CandidateScreening
from app.schemas.candidate_screening import CandidateScreeningCreate, CandidateScreeningUpdate
from app.repositories.candidate_screening_repository import CandidateScreeningRepository
from app.repositories.candidate_repository import CandidateRepository


class CandidateScreeningService:
    """Service for candidate screening operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = CandidateScreeningRepository(db)
        self.candidate_repo = CandidateRepository(db)
    
    async def create_screening(
        self, 
        candidate_public_id: UUID, 
        screening_in: CandidateScreeningCreate
    ) -> CandidateScreening:
        """Create screening for a candidate"""
        # Verify candidate exists
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check if screening already exists
        if candidate.screening:
            raise HTTPException(
                status_code=400, 
                detail="Screening already exists. Use PUT to update."
            )
        
        # Create screening
        screening_data = screening_in.model_dump()
        screening_data["candidate_id"] = candidate.id  # Use internal id
        
        return await self.repository.create(screening_data)
    
    async def update_screening(
        self,
        candidate_public_id: UUID,
        screening_in: CandidateScreeningUpdate
    ) -> CandidateScreening:
        """Update candidate screening"""
        # Get candidate with screening
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.screening:
            raise HTTPException(
                status_code=404, 
                detail="Screening not found. Use POST to create."
            )
        
        # Update screening
        update_data = screening_in.model_dump(exclude_unset=True)
        return await self.repository.update(candidate.screening.id, update_data)
    
    async def delete_screening(self, candidate_public_id: UUID) -> bool:
        """Delete candidate screening"""
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.screening:
            raise HTTPException(status_code=404, detail="Screening not found")
        
        return await self.repository.delete(candidate.screening.id)
