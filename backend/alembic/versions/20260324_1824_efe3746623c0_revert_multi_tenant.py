"""revert_multi_tenant_to_baseline

Revision ID: efe3746623c0
Revises: 7d562a410c63
Create Date: 2026-03-24 18:24:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efe3746623c0'
down_revision: Union[str, None] = '7d562a410c63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLES_WITH_ORG_ID = [
    "users",
    "activity_logs",
    "candidate_assignments",
    "candidate_screenings",
    "candidate_documents",
    "candidate_counseling",
    "leads",
    "deals",
    "crm_tasks",
    "crm_activities",
    "training_batches",
    "training_batch_extensions",
    "training_candidate_allocations",
    "training_attendance",
    "training_assignments",
    "training_sessions",
    "training_enrolments",
    "assessments",
    "assessment_questions",
    "assessment_results",
    "assessment_responses",
    "training_mock_interviews",
    "training_batch_events",
    "training_batch_plans",
    "ticket_messages",
    "dsr_activity_assignments",
    "dsr_activities",
    "dsr_projects",
    "dsr_entries",
    "dsr_leaves",
    "holidays",
    "whatsapp_messages",
    "notifications",
    "ai_chatbot_settings",
    "analytics_reports",
    "tickets",
    "system_settings",
]


def upgrade() -> None:
    # This migration is a dummy for when the database is already at efe3746623c0
    # but the intermediate file history is lost.
    # It allows downgrade back to 7d562a410c63.
    pass


def downgrade() -> None:
    # 1. Drop the org_id column from all tables
    for table in TABLES_WITH_ORG_ID:
        try:
            op.drop_constraint(f"fk_{table}_org_id", table, type_="foreignkey")
        except Exception:
            pass
        try:
            op.drop_index(f"ix_{table}_org_id", table_name=table)
        except Exception:
            pass
        try:
            op.drop_column(table, "org_id")
        except Exception:
            pass

    # 2. Revert notification table specific changes if any
    try:
        op.drop_column('notifications', 'deleted_at')
        op.drop_column('notifications', 'is_deleted')
    except Exception:
        pass

    # 3. Drop organization related tables
    try:
        op.drop_table('organization_memberships')
        op.drop_table('organizations')
    except Exception:
        pass
