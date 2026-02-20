"""Candidate Screening Assignment Repository"""

from typing import Optional, List
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.candidate_screening_assignment import CandidateScreeningAssignment
from app.models.candidate import Candidate


class CandidateScreeningAssignmentRepository:
    """Repository for managing candidate screening assignments"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def assign(
        self,
        candidate_id: int,
        assigned_to_id: int,
        assigned_by_id: int
    ) -> CandidateScreeningAssignment:
        """Assign a candidate to a screener. Replaces any existing assignment."""
        # Remove existing assignment if any
        await self.db.execute(
            delete(CandidateScreeningAssignment).where(
                CandidateScreeningAssignment.candidate_id == candidate_id
            )
        )

        assignment = CandidateScreeningAssignment(
            candidate_id=candidate_id,
            assigned_to_id=assigned_to_id,
            assigned_by_id=assigned_by_id
        )
        self.db.add(assignment)
        await self.db.flush()
        await self.db.refresh(assignment)
        return assignment

    async def bulk_assign(
        self,
        candidate_ids: List[int],
        assigned_to_id: int,
        assigned_by_id: int
    ) -> int:
        """Assign multiple candidates to a screener. Returns count of assigned candidates."""
        # Remove existing assignments for these candidates
        await self.db.execute(
            delete(CandidateScreeningAssignment).where(
                CandidateScreeningAssignment.candidate_id.in_(candidate_ids)
            )
        )

        assignments = [
            CandidateScreeningAssignment(
                candidate_id=cid,
                assigned_to_id=assigned_to_id,
                assigned_by_id=assigned_by_id
            )
            for cid in candidate_ids
        ]
        self.db.add_all(assignments)
        await self.db.flush()
        return len(assignments)

    async def unassign(self, candidate_id: int) -> bool:
        """Remove screening assignment for a candidate. Returns True if removed."""
        result = await self.db.execute(
            delete(CandidateScreeningAssignment).where(
                CandidateScreeningAssignment.candidate_id == candidate_id
            )
        )
        return result.rowcount > 0

    async def get_by_candidate_id(self, candidate_id: int) -> Optional[CandidateScreeningAssignment]:
        """Get assignment for a specific candidate"""
        result = await self.db.execute(
            select(CandidateScreeningAssignment).where(
                CandidateScreeningAssignment.candidate_id == candidate_id
            )
        )
        return result.scalars().first()

    async def get_candidate_internal_id(self, public_id: str) -> Optional[int]:
        """Look up the internal integer ID for a candidate by their UUID"""
        from uuid import UUID
        try:
            uuid_val = UUID(public_id)
        except (ValueError, AttributeError):
            return None
        result = await self.db.execute(
            select(Candidate.id).where(Candidate.public_id == uuid_val)
        )
        return result.scalar_one_or_none()
