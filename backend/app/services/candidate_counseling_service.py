"""Candidate Counseling Service"""

from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_counseling import CandidateCounseling
from app.schemas.candidate_counseling import CandidateCounselingCreate, CandidateCounselingUpdate
from app.repositories.candidate_counseling_repository import CandidateCounselingRepository
from app.repositories.candidate_repository import CandidateRepository


class CandidateCounselingService:
    """Service for candidate counseling operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = CandidateCounselingRepository(db)
        self.candidate_repo = CandidateRepository(db)
    
    async def create_counseling(
        self,
        candidate_public_id: UUID,
        counseling_in: CandidateCounselingCreate,
        counselor_id: Optional[int] = None
    ) -> CandidateCounseling:
        """Create counseling record for a candidate"""
        # Verify candidate exists
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Check if counseling already exists
        if candidate.counseling:
            raise HTTPException(
                status_code=400,
                detail="Counseling record already exists. Use PUT to update."
            )
        
        # Create counseling
        counseling_data = counseling_in.model_dump()
        counseling_data["candidate_id"] = candidate.id
        
        # Set counselor_id if provided (from current user)
        if counselor_id:
            counseling_data["counselor_id"] = counselor_id
        
        return await self.repository.create(counseling_data)
    
    async def update_counseling(
        self,
        candidate_public_id: UUID,
        counseling_in: CandidateCounselingUpdate,
        counselor_id: Optional[int] = None
    ) -> CandidateCounseling:
        """Update counseling record"""
        # Get candidate with counseling
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.counseling:
            raise HTTPException(
                status_code=404,
                detail="Counseling record not found. Use POST to create."
            )
        
        # Update counseling
        update_data = counseling_in.model_dump(exclude_unset=True)
        
        # Update counselor_id if provided
        if counselor_id:
            update_data["counselor_id"] = counselor_id
        
        return await self.repository.update(candidate.counseling.id, update_data)
    
    async def delete_counseling(self, candidate_public_id: UUID) -> bool:
        """Delete counseling record"""
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.counseling:
            raise HTTPException(status_code=404, detail="Counseling record not found")
        
        return await self.repository.delete(candidate.counseling.id)
