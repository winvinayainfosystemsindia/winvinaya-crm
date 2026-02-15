"""Assessment Service Module"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Request
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult, AssessmentResponse
from app.repositories.assessment_repository import (
    AssessmentRepository, 
    AssessmentQuestionRepository, 
    AssessmentResultRepository, 
    AssessmentResponseRepository
)
from app.repositories.candidate_repository import CandidateRepository
from app.schemas.assessment import (
    AssessmentCreate, 
    AssessmentUpdate, 
    AssessmentResultStart, 
    AssessmentResultSubmit,
    ResponseCreate
)


class AssessmentService:
    """Service for managing assessments and candidate attempts"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.assessment_repo = AssessmentRepository(db)
        self.question_repo = AssessmentQuestionRepository(db)
        self.result_repo = AssessmentResultRepository(db)
        self.response_repo = AssessmentResponseRepository(db)

    async def create_assessment(self, assessment_in: AssessmentCreate) -> Assessment:
        """Create a new assessment with questions"""
        # 1. Create Assessment
        assessment_data = assessment_in.model_dump(exclude={"questions"})
        assessment = await self.assessment_repo.create(assessment_data)
        
        # 2. Add Questions
        for q_in in assessment_in.questions:
            q_data = q_in.model_dump()
            q_data["assessment_id"] = assessment.id
            await self.question_repo.create(q_data)
        
        await self.db.commit()
        return await self.assessment_repo.get_by_public_id(assessment.public_id)

    async def get_assessment_for_candidate(self, public_id: UUID) -> Assessment:
        """Get assessment details for a candidate (exclude correct answers)"""
        assessment = await self.assessment_repo.get_by_public_id(public_id)
        if not assessment or not assessment.is_active:
            raise HTTPException(status_code=404, detail="Assessment not found or inactive")
        
        # We will return the object, but the schema/API layer should exclude 'correct_answer'
        return assessment

    async def start_assessment(self, start_in: AssessmentResultStart, request: Request = None) -> AssessmentResult:
        """Initialize a candidate's attempt"""
        assessment = await self.assessment_repo.get(start_in.assessment_id)
        if not assessment or not assessment.is_active:
            raise HTTPException(status_code=404, detail="Assessment not found")
        
        # --- Safe Exam Browser (SEB) Enforcement ---
        if assessment.include_seb:
            user_agent = request.headers.get("User-Agent", "")
            if "SEB" not in user_agent and "SafeExamBrowser" not in user_agent:
                raise HTTPException(status_code=403, detail="Safe Exam Browser is required for this assessment")
            
            # Check Config Key Hash if configured
            if assessment.seb_config_key:
                seb_hash = request.headers.get("X-SafeExamBrowser-ConfigKeyHash")
                if not seb_hash or seb_hash != assessment.seb_config_key:
                    raise HTTPException(status_code=403, detail="Invalid SEB configuration. Please use the authorized SEB link.")

        # Candidate Authentication (Email + DOB)
        candidate_repo = CandidateRepository(self.db)
        candidate = await candidate_repo.get_by_email(start_in.email)
        
        if not candidate:
            raise HTTPException(status_code=403, detail="Candidate not found with this email")
            
        # Verify DOB (candidate.dob is a python date object)
        try:
            input_dob = datetime.strptime(start_in.dob, "%Y-%m-%d").date()
            if candidate.dob != input_dob:
                raise HTTPException(status_code=403, detail="Invalid date of birth provided")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
        # Check if already started
        existing = await self.result_repo.get_by_candidate_and_assessment(
            candidate.id, start_in.assessment_id
        )
        if existing:
            if existing.status == "Completed":
                raise HTTPException(status_code=400, detail="Assessment already completed")
            return existing
        
        # Create new result session
        result = await self.result_repo.create({
            "assessment_id": start_in.assessment_id,
            "candidate_id": candidate.id,
            "status": "InProgress",
            "started_at": datetime.now(timezone.utc),
            "others": start_in.others
        })
        await self.db.commit()
        await self.db.refresh(result)
        return result

    async def submit_assessment(self, result_id: int, submit_in: AssessmentResultSubmit) -> AssessmentResult:
        """Grade and complete the assessment"""
        result = await self.result_repo.get(result_id)
        if not result or result.status == "Completed":
            raise HTTPException(status_code=400, detail="Invalid session or already submitted")
        
        assessment = await self.assessment_repo.get_by_public_id(
            (await self.assessment_repo.get(result.assessment_id)).public_id
        )
        questions_map = {q.id: q for q in assessment.questions}
        
        total_score = 0.0
        
        # Grade Responses
        for resp_in in submit_in.responses:
            question = questions_map.get(resp_in.question_id)
            if not question:
                continue
                
            is_correct = str(resp_in.selected_answer).strip().lower() == str(question.correct_answer).strip().lower()
            marks = question.marks if is_correct else 0.0
            total_score += marks
            
            await self.response_repo.create({
                "result_id": result.id,
                "question_id": question.id,
                "selected_answer": resp_in.selected_answer,
                "is_correct": is_correct,
                "others": resp_in.others
            })
            
        # Update Result
        update_data = {
            "total_score": total_score,
            "status": "Completed",
            "submitted_at": datetime.now(timezone.utc)
        }
        await self.result_repo.update(result.id, update_data)
        await self.db.commit()
        
        stmt = select(AssessmentResult).where(AssessmentResult.id == result.id).options(selectinload(AssessmentResult.responses))
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def get_batch_assessments(self, batch_id: int) -> List[Assessment]:
        """Get all assessments for a batch"""
        return await self.assessment_repo.get_by_batch(batch_id)

    async def get_assessment_results(self, assessment_id: int) -> List[AssessmentResult]:
        """Get all results for a specific assessment with candidate details"""
        stmt = (
            select(AssessmentResult)
            .where(
                AssessmentResult.assessment_id == assessment_id,
                AssessmentResult.is_deleted == False
            )
            .options(
                joinedload(AssessmentResult.candidate),
                selectinload(AssessmentResult.responses)
            )
            .order_by(AssessmentResult.submitted_at.desc())
        )
        result = await self.db.execute(stmt)
        results = result.scalars().unique().all()
        
        # Populate virtual fields (not in DB model but in schema)
        for r in results:
            if r.candidate:
                r.candidate_name = r.candidate.name
                r.candidate_email = r.candidate.email
        
        return results

    async def get_batch_results(self, batch_id: int) -> List[AssessmentResult]:
        """Get all results for assessments in a batch"""
        assessments = await self.assessment_repo.get_by_batch(batch_id)
        assessment_ids = [a.id for a in assessments]
        
        results = []
        for aid in assessment_ids:
            batch_results = await self.result_repo.get_by_fields(assessment_id=aid)
            results.extend(batch_results)
        return results
