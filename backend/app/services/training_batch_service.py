"""Training Batch Service"""

from datetime import date
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_batch import TrainingBatch
from app.schemas.training_batch import TrainingBatchCreate, TrainingBatchUpdate, TrainingBatchExtend
from app.repositories.training_batch_repository import TrainingBatchRepository
from app.repositories.training_batch_extension_repository import TrainingBatchExtensionRepository


class TrainingBatchService:
    """Service for training batch operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = TrainingBatchRepository(db)
        self.extension_repository = TrainingBatchExtensionRepository(db)
    
    async def get_batches(
        self, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        status: Optional[str] = None,
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
        status: Optional[str] = None,
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
        return await self.repository.create(batch_in.model_dump())
    
    async def update_batch(self, public_id: UUID, batch_in: TrainingBatchUpdate) -> TrainingBatch:
        """Update a training batch"""
        batch = await self.get_batch_by_public_id(public_id)
        update_data = batch_in.model_dump(exclude_unset=True)
        return await self.repository.update(batch.id, update_data)
    
    async def delete_batch(self, public_id: UUID) -> bool:
        """Delete a training batch"""
        batch = await self.get_batch_by_public_id(public_id)
        return await self.repository.delete(batch.id)

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
        """Get training batch statistics"""
        batches = await self.repository.get_multi(limit=1000)
        return {
            "total": len(batches),
            "planned": len([b for b in batches if b.status == "planned"]),
            "running": len([b for b in batches if b.status == "running"]),
            "closed": len([b for b in batches if b.status == "closed"])
        }
