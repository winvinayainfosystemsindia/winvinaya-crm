"""Add attachments to placement_notes

Revision ID: a7f9c2e3b4d5
Revises: 629040c87304
Create Date: 2026-09-02 11:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7f9c2e3b4d5'
down_revision: Union[str, None] = '629040c87304'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('placement_notes', sa.Column('attachments', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('placement_notes', 'attachments')
