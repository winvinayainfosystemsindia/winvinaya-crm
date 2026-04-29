"""Training Batch Service"""

from datetime import date
from typing import List, Optional, Union
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_batch import TrainingBatch
from app.schemas.training_batch import TrainingBatchCreate, TrainingBatchUpdate, TrainingBatchExtend
from app.repositories.training_batch_repository import TrainingBatchRepository
from app.repositories.training_batch_extension_repository import TrainingBatchExtensionRepository
from app.repositories.training_batch_plan_repository import TrainingBatchPlanRepository
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.services.training_project_sync_service import TrainingProjectSyncService
from sqlalchemy import select, func


class TrainingBatchService:
    """Service for training batch operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = TrainingBatchRepository(db)
        self.extension_repository = TrainingBatchExtensionRepository(db)
        self.plan_repository = TrainingBatchPlanRepository(db)
        self.sync_service = TrainingProjectSyncService(db)
    
    async def get_batches(
        self, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[Union[str, List[str]]] = None,
        disability_types: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[TrainingBatch]:
        """Get all training batches with advanced filtering"""
        return await self.repository.get_multi(
            skip=skip, 
            limit=limit,
            search=search,
            status=status,
            disability_types=disability_types,
            sort_by=sort_by,
            sort_order=sort_order
        )

    async def get_total_count(
        self,
        search: Optional[str] = None,
        status: Optional[Union[str, List[str]]] = None,
        disability_types: Optional[List[str]] = None
    ) -> int:
        """Get total count of batches for pagination"""
        return await self.repository.count(
            search=search,
            status=status,
            disability_types=disability_types
        )
    
    async def get_batch_by_public_id(self, public_id: UUID) -> Optional[TrainingBatch]:
        """Get a batch by public ID"""
        batch = await self.repository.get_by_public_id(str(public_id))
        if not batch:
            raise HTTPException(status_code=404, detail="Training batch not found")
        return batch
    
    async def create_batch(self, batch_in: TrainingBatchCreate) -> TrainingBatch:
        """Create a new training batch"""
        data = batch_in.model_dump()
        
        # Handle domain and training_mode in 'other'
        other = data.get("other") or {}
        if data.get("domain"):
            other["domain"] = data.pop("domain")
        if data.get("training_mode"):
            other["training_mode"] = data.pop("training_mode")
        data["other"] = other
        
        return await self.repository.create(data)
    
    async def update_batch(self, public_id: UUID, batch_in: TrainingBatchUpdate) -> TrainingBatch:
        """Update a training batch"""
        batch = await self.get_batch_by_public_id(public_id)
        
        # Get old status for comparison
        old_status = batch.status
        update_data = batch_in.model_dump(exclude_unset=True)
        new_status = update_data.get("status", old_status)
        
        # If batch is being closed, mark all non-dropout allocations as completed
        # Handle domain and training_mode in 'other'
        if "domain" in update_data or "training_mode" in update_data:
            other = dict(batch.other or {})
            if "domain" in update_data:
                other["domain"] = update_data.pop("domain")
            if "training_mode" in update_data:
                other["training_mode"] = update_data.pop("training_mode")
            update_data["other"] = other

        # Update batch
        return await self.repository.update(batch.id, update_data)
    
    async def delete_batch(self, public_id: UUID) -> bool:
        """Delete a training batch with safety checks and cascading cleanup"""
        batch = await self.get_batch_by_public_id(public_id)
        
        # 1. Safety Guard: Check for active allocations
        allocation_query = select(func.count(TrainingCandidateAllocation.id)).where(
            TrainingCandidateAllocation.batch_id == batch.id,
            TrainingCandidateAllocation.is_deleted == False
        )
        count_result = await self.db.execute(allocation_query)
        count = count_result.scalar() or 0
        
        if count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete batch '{batch.batch_name}' because {count} candidate(s) are still allocated to it. Please unmap all candidates first."
            )
            
        # 2. Cascading Cleanup: Soft-delete related weekly plans
        plans = await self.plan_repository.get_all_by_batch_id(batch.id)
        if plans:
            plan_ids = [p.id for p in plans]
            await self.plan_repository.bulk_soft_delete(plan_ids)
            
        # 3. Soft-delete the batch itself
        success = await self.repository.delete(batch.id)
        
        if success:
            # 4. Sync DSR: Trigger synchronization for projects linked to this batch
            # This will remove/deactivate related DSR activities since the plans were deleted
            await self.sync_service.sync_batch_to_projects(batch.id)
            
        return success
    
    async def _complete_batch_allocations(self, batch_id: int):
        """Mark all non-dropout allocations as completed when batch closes"""
        from app.models.training_candidate_allocation import TrainingCandidateAllocation
        from sqlalchemy import select
        from datetime import datetime
        
        query = select(TrainingCandidateAllocation).where(
            TrainingCandidateAllocation.batch_id == batch_id,
            TrainingCandidateAllocation.batch_id == batch_id, # redundant but harmless
            TrainingCandidateAllocation.is_dropout == False
        )
        result = await self.db.execute(query)
        allocations = result.scalars().all()
        
        for allocation in allocations:
            # Update status to completed
            allocation.status = "completed"
            
            # Store completion metadata in others
            others = allocation.others or {}
            others["completed_at"] = datetime.now().isoformat()
            allocation.others = others
        
        await self.db.commit()
    
    async def extend_batch(self, public_id: UUID, extend_in: TrainingBatchExtend) -> TrainingBatch:
        """Extend a training batch end date and record history"""
        batch = await self.get_batch_by_public_id(public_id)
        
        # Get the original end date. If not explicitly stored, use the duration start_date + weeks
        # or the most reliable original date we have.
        # For simplicity, if we have extensions, the previous_close_date of the FIRST extension is the original.
        original_close_date = None
        if batch.extensions:
            # Sort by creation to find the first one
            sorted_extensions = sorted(batch.extensions, key=lambda x: x.created_at)
            original_close_date = sorted_extensions[0].previous_close_date
        
        current_close_date = batch.approx_close_date or (batch.duration.get('end_date') if batch.duration else None)
        if isinstance(current_close_date, str):
            current_close_date = date.fromisoformat(current_close_date)
            
        if not original_close_date:
            original_close_date = current_close_date

        new_close_date = extend_in.new_close_date
        
        # Ensure new date is not before start date
        start_date = batch.start_date or (date.fromisoformat(batch.duration.get('start_date')) if batch.duration and batch.duration.get('start_date') else None)
        if start_date and new_close_date < start_date:
            raise HTTPException(
                status_code=400,
                detail=f"New close date ({new_close_date}) cannot be before start date ({start_date})"
            )
        
        # Calculate extension days for this specific record relative to CURRENT close date
        diff = 0
        if current_close_date:
            diff = (new_close_date - current_close_date).days
            
        # Create extension history record
        extension_data = {
            "batch_id": batch.id,
            "previous_close_date": current_close_date,
            "new_close_date": new_close_date,
            "extension_days": diff,
            "reason": extend_in.reason
        }
        await self.extension_repository.create(extension_data)
        
        # Update batch total extension days relative to ORIGINAL close date
        new_extension_total = 0
        if original_close_date:
            new_extension_total = (new_close_date - original_close_date).days
            
        update_data = {
            "approx_close_date": new_close_date,
            "total_extension_days": new_extension_total
        }
        
        # Also update duration JSON if it exists to keep it in sync
        if batch.duration:
            new_duration = dict(batch.duration)
            new_duration['end_date'] = new_close_date.isoformat()
            # Recalculate weeks if possible
            if 'start_date' in new_duration:
                s = date.fromisoformat(new_duration['start_date'])
                new_duration['weeks'] = (new_close_date - s).days // 7
            update_data["duration"] = new_duration
        
        return await self.repository.update(batch.id, update_data)

    async def get_stats(self) -> dict:
        """Get training batch and candidate statistics with accurate counts"""
        from sqlalchemy import func, select, or_, and_, exists
        from app.models.training_candidate_allocation import TrainingCandidateAllocation
        from app.models.candidate import Candidate
        from app.models.candidate_counseling import CandidateCounseling
        
        # 1. Batch Statistics
        # Base query for all non-deleted batches
        batch_query = select(self.repository.model).where(self.repository.model.is_deleted == False)
        result = await self.db.execute(batch_query)
        batches = result.scalars().all()
        
        batch_stats = {
            "total": len(batches),
            "planned": sum(1 for b in batches if b.status == "planned"),
            "running": sum(1 for b in batches if b.status == "running"),
            "completed": sum(1 for b in batches if b.status == "closed"),
        }
        
        # 2. Candidate Statistics
        
        # Candidates currently in training: in active batches (planned, running, extended) and NOT dropped out
        active_batch_ids = [b.id for b in batches if b.status in ['planned', 'running', 'extended']]
        
        if active_batch_ids:
            in_training_query = select(func.count(TrainingCandidateAllocation.id)).where(
                and_(
                    TrainingCandidateAllocation.batch_id.in_(active_batch_ids),
                    TrainingCandidateAllocation.is_deleted == False,
                    TrainingCandidateAllocation.is_dropout == False
                )
            )
            in_training_count = (await self.db.execute(in_training_query)).scalar() or 0
        else:
            in_training_count = 0
        
        # Fetch all non-deleted allocations to count completed and dropped out
        # This is more robust than dialect-specific JSON queries for small-to-medium datasets
        alloc_query = select(
            TrainingCandidateAllocation.status, 
            TrainingCandidateAllocation.is_dropout
        ).where(TrainingCandidateAllocation.is_deleted == False)
        
        alloc_result = await self.db.execute(alloc_query)
        allocations = alloc_result.all()
        
        completed_count = sum(1 for a in allocations if a.status == 'completed')
        dropped_count = sum(1 for a in allocations if a.is_dropout)
        
        # Ready for Training candidates: 
        # - Not deleted
        # - Counseling status is 'selected'
        # - NOT allocated to ANY batch (including completed or dropped out)
        
        # Subquery for all allocations (past or present)
        allocated_subquery = select(TrainingCandidateAllocation.candidate_id).where(
            TrainingCandidateAllocation.is_deleted == False
        )
        
        ready_query = select(func.count(Candidate.id)).join(
            CandidateCounseling, Candidate.id == CandidateCounseling.candidate_id
        ).where(
            and_(
                Candidate.is_deleted == False,
                func.lower(CandidateCounseling.status) == "selected",
                ~Candidate.id.in_(allocated_subquery)
            )
        )
        ready_count = (await self.db.execute(ready_query)).scalar() or 0
        
        return {
            **batch_stats,
            "in_training": in_training_count,
            "completed_training": completed_count,
            "ready_for_training": ready_count,
            "dropped_out": dropped_count,
            "women": sum(1 for b in batches if b.disability_types and "Women" in b.disability_types)
        }
