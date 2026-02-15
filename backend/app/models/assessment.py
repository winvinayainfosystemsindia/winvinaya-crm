from __future__ import annotations
"""Advanced Assessment models"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, String, Float, DateTime, JSON, Boolean, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.training_batch import TrainingBatch
    from app.models.candidate import Candidate
    from app.models.user import User


class Assessment(BaseModel):
    """Assessment configuration model"""
    
    __tablename__ = "assessments"
    
    public_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        unique=True,
        index=True,
        nullable=False,
        default=uuid.uuid4
    )
    
    batch_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("training_batches.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    security_key: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    pass_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=40.0)
    include_seb: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    seb_config_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    batch: Mapped[TrainingBatch] = relationship("TrainingBatch")
    questions: Mapped[list[AssessmentQuestion]] = relationship(
        "AssessmentQuestion",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )
    results: Mapped[list[AssessmentResult]] = relationship(
        "AssessmentResult",
        back_populates="assessment",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Assessment(id={self.id}, title={self.title}, batch_id={self.batch_id})>"


class AssessmentQuestion(BaseModel):
    """Individual question within an assessment"""
    
    __tablename__ = "assessment_questions"
    
    assessment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    text: Mapped[str] = mapped_column(String(2000), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # MCQ, TF
    options: Mapped[dict | list | None] = mapped_column(JSON, nullable=True) # For MCQ: ["A", "B", "C", "D"]
    correct_answer: Mapped[str] = mapped_column(String(255), nullable=False)
    marks: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    assessment: Mapped[Assessment] = relationship("Assessment", back_populates="questions")

    def __repr__(self) -> str:
        return f"<AssessmentQuestion(id={self.id}, type={self.type}, assessment_id={self.assessment_id})>"


class AssessmentResult(BaseModel):
    """Summary of a candidate's attempt"""
    
    __tablename__ = "assessment_results"
    
    assessment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    candidate_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("candidates.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    total_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="InProgress") # InProgress, Completed
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    assessment: Mapped[Assessment] = relationship("Assessment", back_populates="results")
    candidate: Mapped[Candidate] = relationship("Candidate")
    responses: Mapped[list[AssessmentResponse]] = relationship(
        "AssessmentResponse",
        back_populates="result",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AssessmentResult(id={self.id}, candidate_id={self.candidate_id}, score={self.total_score})>"


class AssessmentResponse(BaseModel):
    """Candidate's response to an individual question"""
    
    __tablename__ = "assessment_responses"
    
    result_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessment_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assessment_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    selected_answer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    others: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    # Relationships
    result: Mapped[AssessmentResult] = relationship("AssessmentResult", back_populates="responses")
    question: Mapped[AssessmentQuestion] = relationship("AssessmentQuestion")

    def __repr__(self) -> str:
        return f"<AssessmentResponse(id={self.id}, correct={self.is_correct})>"
