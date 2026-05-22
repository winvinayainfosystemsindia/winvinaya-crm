"""add created_by_id to skills

Revision ID: add_created_by_to_skills
Revises: add_ai_fields_placement_mappings
Create Date: 2026-05-22 19:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_created_by_to_skills'
down_revision = 'add_ai_fields_placement_mappings'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add created_by_id column to skills table
    op.add_column('skills', sa.Column('created_by_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key(
        'fk_skills_created_by_id_users',
        'skills',
        'users',
        ['created_by_id'],
        ['id'],
        ondelete='SET NULL'
    )
    
    # Create index on created_by_id
    op.create_index(
        op.f('ix_skills_created_by_id'),
        'skills',
        ['created_by_id'],
        unique=False
    )


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_skills_created_by_id'), table_name='skills')
    
    # Drop foreign key constraint
    op.drop_constraint('fk_skills_created_by_id_users', 'skills', type_='foreignkey')
    
    # Drop created_by_id column
    op.drop_column('skills', 'created_by_id')
