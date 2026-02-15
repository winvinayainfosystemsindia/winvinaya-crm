"""Assessment Repository Module"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult, AssessmentResponse
from app.repositories.base import BaseRepository


class AssessmentRepository(BaseRepository[Assessment]):
    """Repository for Assessment CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Assessment, db)

    async def get_by_public_id(self, public_id: UUID) -> Optional[Assessment]:
        """Get assessment by public UUID with questions loaded"""
        query = select(Assessment).where(
            Assessment.public_id == public_id,
            Assessment.is_deleted == False
        ).options(selectinload(Assessment.questions))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_batch(self, batch_id: int) -> List[Assessment]:
        """Get all assessments for a batch"""
        return await self.get_by_fields(batch_id=batch_id)


class AssessmentQuestionRepository(BaseRepository[AssessmentQuestion]):
    """Repository for AssessmentQuestion CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(AssessmentQuestion, db)


class AssessmentResultRepository(BaseRepository[AssessmentResult]):
    """Repository for AssessmentResult CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(AssessmentResult, db)

    async def get_by_candidate_and_assessment(self, candidate_id: int, assessment_id: int) -> Optional[AssessmentResult]:
        """Get a result for a specific candidate and assessment"""
        query = select(AssessmentResult).where(
            AssessmentResult.candidate_id == candidate_id,
            AssessmentResult.assessment_id == assessment_id,
            AssessmentResult.is_deleted == False
        ).options(selectinload(AssessmentResult.responses))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class AssessmentResponseRepository(BaseRepository[AssessmentResponse]):
    """Repository for AssessmentResponse CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(AssessmentResponse, db)
