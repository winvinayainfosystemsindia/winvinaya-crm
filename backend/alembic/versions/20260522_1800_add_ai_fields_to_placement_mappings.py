"""add ai_explanation and score_source to placement_mappings

Revision ID: add_ai_fields_placement_mappings
Revises: a6706489793f
Create Date: 2026-05-22 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_ai_fields_placement_mappings'
down_revision = 'a6706489793f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add ai_explanation column — stores the AI-generated reasoning for the match score
    op.add_column(
        'placement_mappings',
        sa.Column('ai_explanation', sa.Text(), nullable=True, comment='AI-generated explanation of the match score at time of mapping')
    )
    # Add score_source column — tracks whether the score was AI or rule-based
    op.add_column(
        'placement_mappings',
        sa.Column('score_source', sa.String(20), nullable=True, server_default='rule_based', comment='ai | rule_based')
    )


def downgrade() -> None:
    op.drop_column('placement_mappings', 'score_source')
    op.drop_column('placement_mappings', 'ai_explanation')
