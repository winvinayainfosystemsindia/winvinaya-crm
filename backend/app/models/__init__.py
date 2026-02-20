"""Models package - SQLAlchemy ORM models"""

from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog, ActionType
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_screening_assignment import CandidateScreeningAssignment
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
from app.models.training_batch import TrainingBatch
from app.models.training_batch_extension import TrainingBatchExtension
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_attendance import TrainingAttendance
from app.models.training_assignment import TrainingAssignment
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentResult, AssessmentResponse
from app.models.training_mock_interview import TrainingMockInterview
from app.models.training_batch_event import TrainingBatchEvent
from app.models.training_batch_plan import TrainingBatchPlan
from app.models.dynamic_field import DynamicField
from app.models.ticket import Ticket, TicketMessage, TicketStatus, TicketPriority, TicketCategory
from app.models.company import Company, CompanySize, CompanyStatus
from app.models.contact import Contact, ContactSource
from app.models.lead import Lead, LeadSource, LeadStatus
from app.models.deal import Deal, DealStage, DealType
from app.models.crm_task import CRMTask, CRMTaskType, CRMTaskPriority, CRMTaskStatus, CRMRelatedToType
from app.models.crm_activity_log import CRMActivityLog, CRMEntityType, CRMActivityType
from app.models.system_setting import SystemSetting

__all__ = [
    "User",
    "UserRole",
    "ActivityLog",
    "ActionType",
    "Candidate",
    "CandidateScreening",
    "CandidateScreeningAssignment",
    "CandidateDocument",
    "CandidateCounseling",
    "TrainingBatch",
    "TrainingBatchExtension",
    "TrainingCandidateAllocation",
    "TrainingAttendance",
    "TrainingAssignment",
    "Assessment",
    "AssessmentQuestion",
    "AssessmentResult",
    "AssessmentResponse",
    "TrainingMockInterview",
    "TrainingBatchEvent",
    "TrainingBatchPlan",
    "DynamicField",
    "Ticket",
    "TicketMessage",
    "TicketStatus",
    "TicketPriority",
    "TicketCategory",
    # CRM Models
    "Company",
    "CompanySize",
    "CompanyStatus",
    "Contact",
    "ContactSource",
    "Lead",
    "LeadSource",
    "LeadStatus",
    "Deal",
    "DealStage",
    "DealType",
    "CRMTask",
    "CRMTaskType",
    "CRMTaskPriority",
    "CRMTaskStatus",
    "CRMRelatedToType",
    "CRMActivityLog",
    "CRMEntityType",
    "CRMActivityType",
    "SystemSetting",
]

