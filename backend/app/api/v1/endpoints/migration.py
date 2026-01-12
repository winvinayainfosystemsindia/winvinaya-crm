"""One-time migration endpoint to fix allocations from already-closed batches"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import require_roles
from app.models.user import User, UserRole
from app.models.training_batch import TrainingBatch
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from datetime import datetime

router = APIRouter(prefix="/migration", tags=["Migration"])


@router.post("/fix-closed-batch-allocations")
async def fix_closed_batch_allocations(
    current_user: User = Depends(require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    One-time migration: Mark allocations as completed for batches that are already closed.
    This fixes allocations from batches that were closed before the auto-completion feature was implemented.
    """
    # Find all closed batches
    query = select(TrainingBatch).where(
        TrainingBatch.status == "closed",
        TrainingBatch.is_deleted == False
    )
    result = await db.execute(query)
    closed_batches = result.scalars().all()
    
    total_batches = len(closed_batches)
    total_allocations_updated = 0
    
    for batch in closed_batches:
        # Find all non-dropout allocations for this batch
        alloc_query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.batch_id == batch.id,
            TrainingCandidateAllocation.is_deleted == False,
            TrainingCandidateAllocation.is_dropout == False
        )
        alloc_result = await db.execute(alloc_query)
        allocations = alloc_result.scalars().all()
        
        for allocation in allocations:
            # Only update if not already completed
            current_status = allocation.status.get("current") if allocation.status else None
            if current_status != "completed":
                if allocation.status:
                    allocation.status["current"] = "completed"
                else:
                    allocation.status = {"current": "completed"}
                allocation.status["completed_at"] = datetime.now().isoformat()
                allocation.status["migration"] = True  # Flag to indicate this was migrated
                total_allocations_updated += 1
    
    await db.commit()
    
    return {
        "success": True,
        "message": "Migration completed successfully",
        "batches_processed": total_batches,
        "allocations_updated": total_allocations_updated
    }
