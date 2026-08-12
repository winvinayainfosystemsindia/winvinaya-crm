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
    
    async def get_screening(self, candidate_public_id: UUID) -> Optional[CandidateScreening]:
        """Get screening for a candidate"""
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            return None
        return candidate.screening
    
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
        
        if screening_data.get("consent_status") == "Accepted" and not screening_data.get("consent_at"):
            from datetime import datetime
            screening_data["consent_at"] = datetime.utcnow()

        new_screening = await self.repository.create(screening_data)

        if new_screening.consent_status == "Accepted":
            try:
                from app.services.consent_pdf_service import ConsentPDFService
                await ConsentPDFService.create_and_save_consent_pdf(
                    db=self.db,
                    candidate=candidate,
                    screening=new_screening,
                    consent_ip="Admin Screening Creation"
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error generating consent PDF for candidate {candidate.id}: {str(e)}")

        return new_screening
    
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
        
        # Protect original screened_by info:
        # Only allow setting screened_by_id if it's currently None
        if "screened_by_id" in update_data and candidate.screening.screened_by_id is not None:
             del update_data["screened_by_id"]

        from datetime import datetime
        is_newly_accepted = update_data.get("consent_status") == "Accepted" and candidate.screening.consent_status != "Accepted"
        if is_newly_accepted and not candidate.screening.consent_at and "consent_at" not in update_data:
            update_data["consent_at"] = datetime.utcnow()
             
        updated_screening = await self.repository.update(candidate.screening.id, update_data)

        if is_newly_accepted:
            try:
                from app.services.consent_pdf_service import ConsentPDFService
                await ConsentPDFService.create_and_save_consent_pdf(
                    db=self.db,
                    candidate=candidate,
                    screening=updated_screening,
                    consent_ip="Admin Update"
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error generating consent PDF for candidate {candidate.id}: {str(e)}")

        return updated_screening
    
    async def delete_screening(self, candidate_public_id: UUID) -> bool:
        """Delete candidate screening"""
        candidate = await self.candidate_repo.get_by_public_id_with_details(candidate_public_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        if not candidate.screening:
            raise HTTPException(status_code=404, detail="Screening not found")
        
        return await self.repository.delete(candidate.screening.id)
