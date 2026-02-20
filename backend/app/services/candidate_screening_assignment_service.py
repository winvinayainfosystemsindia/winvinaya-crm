"""Candidate Screening Assignment Service"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.repositories.candidate_screening_assignment_repository import CandidateScreeningAssignmentRepository
from app.models.user import User, UserRole


class CandidateScreeningAssignmentService:
    """Service layer for candidate screening assignment operations"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CandidateScreeningAssignmentRepository(db)

    async def assign_candidates(
        self,
        candidate_public_ids: List[str],
        assigned_to_user_id: int,
        assigned_by_user_id: int
    ) -> int:
        """Assign multiple candidates to a screener. Returns count of assignments made."""
        # Resolve all public IDs to internal IDs
        internal_ids = []
        for public_id in candidate_public_ids:
            internal_id = await self.repo.get_candidate_internal_id(public_id)
            if internal_id:
                internal_ids.append(internal_id)

        if not internal_ids:
            return 0

        count = await self.repo.bulk_assign(
            candidate_ids=internal_ids,
            assigned_to_id=assigned_to_user_id,
            assigned_by_id=assigned_by_user_id
        )
        await self.db.commit()
        return count

    async def unassign_candidate(self, candidate_public_id: str) -> bool:
        """Remove assignment from a candidate"""
        internal_id = await self.repo.get_candidate_internal_id(candidate_public_id)
        if not internal_id:
            return False
        removed = await self.repo.unassign(internal_id)
        if removed:
            await self.db.commit()
        return removed

    async def get_eligible_screeners(self) -> List[User]:
        """Get all users who can be assigned as screeners (Trainer, Sourcing roles)"""
        result = await self.db.execute(
            select(User).where(
                User.role.in_([UserRole.TRAINER, UserRole.SOURCING]),
                User.is_active == True
            ).order_by(User.full_name)
        )
        return list(result.scalars().all())
