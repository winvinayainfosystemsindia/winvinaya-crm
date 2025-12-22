"""Candidate Service"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate, CandidateUpdate
from app.repositories.candidate_repository import CandidateRepository
from app.services.pincode_service import get_pincode_details


class CandidateService:
    """Service for candidate business logic"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = CandidateRepository(db)

    async def create_candidate(self, candidate_in: CandidateCreate) -> Candidate:
        """Create a new candidate with automated address fetch"""
        
        # Check existing email
        if await self.repository.get_by_email(candidate_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check existing phone
        if await self.repository.get_by_phone(candidate_in.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )

        # Fetch address details from pincode
        address_details = await get_pincode_details(candidate_in.pincode)
        
        # Prepare data
        candidate_data = candidate_in.model_dump()
        
        # Handle nested objects -> convert to dict/list for JSON storage
        # (Pydantic model_dump already does this recursively by default if we use mode='json', 
        # but sqlalchemy expects dicts for JSON columns. candidate_in.education_details is a model)
        
        # Override address fields
        candidate_data["city"] = address_details["city"]
        candidate_data["district"] = address_details["district"]
        candidate_data["state"] = address_details["state"]
        
        # JSON fields handling
        if candidate_in.education_details:
             candidate_data["education_details"] = candidate_in.education_details.model_dump()
             
        if candidate_in.disability_details:
             candidate_data["disability_details"] = candidate_in.disability_details.model_dump()

        # guardian_details and work_experience are passed as dicts currently

        # Build candidate object (UUID is automatically generated)
        candidate = await self.repository.create(candidate_data)
        
        # Refresh to get the candidate with relationships loaded
        # This ensures the response includes profile, documents, counseling (even if empty)
        candidate_with_details = await self.repository.get_by_public_id_with_details(candidate.public_id)
        
        return candidate_with_details

    async def get_candidate(self, public_id: UUID, with_details: bool = False) -> Candidate:
        """Get candidate by public_id (UUID)"""
        if with_details:
            candidate = await self.repository.get_by_public_id_with_details(public_id)
        else:
            candidate = await self.repository.get_by_public_id(public_id)
            
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate

    async def get_candidates(self, skip: int = 0, limit: int = 100) -> dict:
        """Get list of candidates with total count"""
        items, total = await self.repository.get_multi(skip=skip, limit=limit)
        return {"items": items, "total": total}

    async def update_candidate(self, public_id: UUID, candidate_in: CandidateUpdate) -> Candidate:
        """Update candidate by public_id"""
        candidate = await self.get_candidate(public_id)
        
        update_data = candidate_in.model_dump(exclude_unset=True)
        
        # If pincode changed, update address
        if "pincode" in update_data and update_data["pincode"] != candidate.pincode:
            address_details = await get_pincode_details(update_data["pincode"])
            update_data.update(address_details)
            
        # JSON fields handling for updates
        if "education_details" in update_data and update_data["education_details"]:
             if hasattr(update_data["education_details"], "model_dump"):
                update_data["education_details"] = update_data["education_details"].model_dump()
        
        if "disability_details" in update_data and update_data["disability_details"]:
             if hasattr(update_data["disability_details"], "model_dump"):
                update_data["disability_details"] = update_data["disability_details"].model_dump()

        # Use internal id for repository update
        return await self.repository.update(candidate.id, update_data)

    async def delete_candidate(self, public_id: UUID) -> bool:
        """Delete candidate by public_id"""
        candidate = await self.get_candidate(public_id)
        # Use internal id for repository delete
        return await self.repository.delete(candidate.id)

    async def get_stats(self) -> dict:
        """Get candidate statistics"""
        return await self.repository.get_stats()

    async def get_unprofiled_candidates(self, skip: int = 0, limit: int = 100) -> dict:
        """Get list of candidates without profile records with total count"""
        items, total = await self.repository.get_unprofiled(skip=skip, limit=limit)
        return {"items": items, "total": total}

    async def get_profiled_candidates(self, skip: int = 0, limit: int = 100) -> dict:
        """Get list of candidates with profile records with total count"""
        items, total = await self.repository.get_profiled(skip=skip, limit=limit)
        return {"items": items, "total": total}


