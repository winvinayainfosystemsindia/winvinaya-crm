"""Dummy migration to fix missing revision

Revision ID: 6c0a00577ecc
Revises: f82b6ac29d1d
Create Date: 2026-02-20 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6c0a00577ecc'
down_revision: Union[str, None] = 'f82b6ac29d1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
