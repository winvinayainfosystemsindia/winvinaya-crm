"""fix_incorrectly_deactivated_resume_documents

Revision ID: a3f9c2e1b8d4
Revises: d696de986660
Create Date: 2026-05-29 10:50:00.000000

Data migration: Reactivates resume-type candidate_documents that were incorrectly
set to is_active=False by an old bug. The old upload logic deactivated ALL active
resumes (regardless of document_source) when a new resume was uploaded. This caused
trainer resumes to be deactivated when a new candidate resume was uploaded, and vice
versa.

Fix logic:
  - Find any document where is_active=False, is_deleted=False, document_type='resume'
  - Check if there is an active replacement with the SAME candidate_id, document_type,
    and document_source.
  - If NO active replacement exists, the doc was incorrectly deactivated → reactivate it.
  - If an active replacement EXISTS, the old doc was correctly superseded → leave it.

Downgrade: no-op (we cannot know which documents were legitimately inactive before
this migration ran; reverting would risk re-deactivating valid documents).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f9c2e1b8d4'
down_revision: Union[str, None] = 'd696de986660'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Reactivate resume documents that were incorrectly deactivated.

    A document should be reactivated if:
      1. is_active = FALSE (was deactivated)
      2. is_deleted = FALSE (was NOT intentionally deleted by the user)
      3. document_type = 'resume'
      4. There is NO other active (is_active=TRUE, is_deleted=FALSE) document for the
         same candidate_id + document_type + document_source combination.

    Using a NOT EXISTS subquery so it runs as a single efficient SQL statement.
    """
    op.execute(
        sa.text("""
            UPDATE candidate_documents AS cd
            SET
                is_active  = TRUE,
                updated_at = NOW()
            WHERE
                cd.is_active  = FALSE
                AND cd.is_deleted = FALSE
                AND cd.document_type = 'resume'
                AND NOT EXISTS (
                    SELECT 1
                    FROM candidate_documents AS cd2
                    WHERE cd2.candidate_id     = cd.candidate_id
                      AND cd2.document_type    = cd.document_type
                      AND cd2.document_source  = cd.document_source
                      AND cd2.is_active        = TRUE
                      AND cd2.is_deleted       = FALSE
                      AND cd2.id              != cd.id
                )
        """)
    )


def downgrade() -> None:
    """
    No-op: we cannot safely reverse this data fix without knowing the original
    intent for each document, so downgrade is intentionally left empty.
    """
    pass
