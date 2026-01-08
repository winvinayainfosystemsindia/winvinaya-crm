"""Training Batch Repository"""

from typing import Optional, List, Any, Union
from sqlalchemy import select, update, or_, desc, asc
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.training_batch import TrainingBatch
from app.repositories.base import BaseRepository


class TrainingBatchRepository(BaseRepository[TrainingBatch]):
    """Repository for TrainingBatch CRUD operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(TrainingBatch, db)
    
    async def get_by_public_id(self, public_id: str) -> Optional[TrainingBatch]:
        """Get a batch by its public UUID with extensions"""
        query = select(self.model).options(
            joinedload(self.model.extensions)
        ).where(
            self.model.public_id == public_id,
            self.model.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one_or_none()

    async def get_multi(
        self,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
        search: Optional[str] = None,
        status: Optional[str] = None,
        disability_types: Optional[List[str]] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[TrainingBatch]:
        """Get multiple batches with extensions loaded and advanced filtering"""
        query = select(self.model).options(
            joinedload(self.model.extensions)
        )
        
        if not include_deleted:
            query = query.where(self.model.is_deleted == False)
        
        # Search filter
        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    self.model.batch_name.ilike(search_filter),
                    self.model.disability_type.ilike(search_filter)
                )
            )
            
        # Status filter
        if status:
            query = query.where(self.model.status == status)
            
        # Disability types filter
        if disability_types:
            query = query.where(self.model.disability_type.in_(disability_types))
            
        # Sorting
        sort_column = getattr(self.model, sort_by, self.model.created_at)
        if sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.unique().scalars().all())

    async def count(
        self,
        include_deleted: bool = False,
        search: Optional[str] = None,
        status: Optional[str] = None,
        disability_types: Optional[List[str]] = None
    ) -> int:
        """Count batches with filters applied"""
        from sqlalchemy import func
        query = select(func.count()).select_from(self.model)
        
        if not include_deleted:
            query = query.where(self.model.is_deleted == False)
            
        if search:
            search_filter = f"%{search}%"
            query = query.where(
                or_(
                    self.model.batch_name.ilike(search_filter),
                    self.model.disability_type.ilike(search_filter)
                )
            )
            
        if status:
            query = query.where(self.model.status == status)
            
        if disability_types:
            query = query.where(self.model.disability_type.in_(disability_types))
            
        result = await self.db.execute(query)
        return result.scalar_one()

    async def create(self, obj_in: dict[str, Any]) -> TrainingBatch:
        """Create a new batch and return with extensions loaded"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.flush()
        
        # Fetch with extensions to avoid lazy loading issues during serialization
        query = select(self.model).options(
            joinedload(self.model.extensions)
        ).where(self.model.id == db_obj.id)
        
        result = await self.db.execute(query)
        return result.unique().scalar_one()

    async def update(self, id: int, obj_in: dict[str, Any]) -> Optional[TrainingBatch]:
        """Update and return with extensions loaded"""
        query_update = (
            update(self.model)
            .where(self.model.id == id)
            .where(self.model.is_deleted == False)
            .values(**obj_in)
        )
        await self.db.execute(query_update)
        await self.db.flush()
        
        query_select = select(self.model).options(
            joinedload(self.model.extensions)
        ).where(self.model.id == id)
        
        result = await self.db.execute(query_select)
        return result.unique().scalar_one_or_none()
