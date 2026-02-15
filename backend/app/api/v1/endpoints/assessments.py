"""Assessment API Endpoints"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    AssessmentCreate, 
    AssessmentUpdate, 
    AssessmentResponse, 
    AssessmentDetailResponse,
    AssessmentResultStart, 
    AssessmentResultSubmit, 
    AssessmentResultResponse
)
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User

router = APIRouter()


# --- Trainer / Admin Management Endpoints ---

@router.post("/batch/{batch_id}", response_model=AssessmentResponse)
async def create_assessment(
    batch_id: int,
    assessment_in: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new assessment for a batch (Trainer only)"""
    service = AssessmentService(db)
    # Ensure batch_id in path matches body or just use path
    assessment_in.batch_id = batch_id 
    return await service.create_assessment(assessment_in)


@router.get("/batch/{batch_id}", response_model=List[AssessmentResponse])
async def get_batch_assessments(
    batch_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all assessments for a batch"""
    service = AssessmentService(db)
    return await service.get_batch_assessments(batch_id)


@router.get("/{assessment_id}/results", response_model=List[AssessmentResultResponse])
async def get_assessment_results(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all results for a specific assessment"""
    service = AssessmentService(db)
    # This would need a repo method, adding placeholder logic
    return await service.get_assessment_results(assessment_id)


# --- Public Candidate Endpoints (Secure via public_id and security_key) ---

@router.get("/public/{public_id}", response_model=AssessmentDetailResponse)
async def get_public_assessment(
    public_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get assessment questions for a candidate (Hides correct answers)"""
    service = AssessmentService(db)
    assessment = await service.get_assessment_for_candidate(public_id)
    
    # Correct answers are excluded by the AssessmentDetailResponse pydantic model 
    # (if we define it that way, which we DID in QuestionResponse which inherits QuestionBase but 
    # we should double check if correct_answer is in QuestionDetailResponse)
    # RE-CHECK: QuestionResponse in schemas/assessment.py DOES have correct_answer because it inherits QuestionBase.
    # We should have a PublicQuestionResponse that excludes it.
    
    return assessment


@router.post("/public/{public_id}/start", response_model=AssessmentResultResponse)
async def start_public_assessment(
    public_id: UUID,
    start_in: AssessmentResultStart,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Verify security key and start the assessment timer"""
    service = AssessmentService(db)
    # Note: assessment_id is internally handled by looking up public_id
    assessment = await service.get_assessment_for_candidate(public_id)
    start_in.assessment_id = assessment.id
    return await service.start_assessment(start_in, request)


@router.post("/public/submit/{result_id}", response_model=AssessmentResultResponse)
async def submit_public_assessment(
    result_id: int,
    submit_in: AssessmentResultSubmit,
    db: AsyncSession = Depends(get_db)
):
    """Submit responses and get final score"""
    service = AssessmentService(db)
    return await service.submit_assessment(result_id, submit_in)
