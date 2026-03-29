from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.placement_mapping import PlacementMapping, PlacementStatus
from app.models.placement_pipeline_history import PlacementPipelineHistory
from app.repositories.placement_pipeline_history_repository import PlacementPipelineHistoryRepository
from app.repositories.placement_mapping_repository import PlacementMappingRepository


class PlacementPipelineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.history_repo = PlacementPipelineHistoryRepository(db)
        self.mapping_repo = PlacementMappingRepository(db)

    async def update_status(
        self, 
        mapping_id: int, 
        to_status: PlacementStatus, 
        changed_by_id: int, 
        remarks: Optional[str] = None
    ) -> Optional[PlacementMapping]:
        mapping = await self.mapping_repo.get(mapping_id)
        if not mapping:
            return None

        from_status = mapping.status
        
        # Update mapping status
        mapping.status = to_status
        mapping.updated_at = datetime.utcnow()
        
        # Create history record
        history = PlacementPipelineHistory(
            mapping_id=mapping_id,
            candidate_id=mapping.candidate_id,
            job_role_id=mapping.job_role_id,
            from_status=from_status,
            to_status=to_status,
            changed_by_id=changed_by_id,
            remarks=remarks,
            changed_at=datetime.utcnow()
        )
        
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(mapping)
        
        return mapping

    async def get_history(self, mapping_id: int) -> List[PlacementPipelineHistory]:
        return await self.history_repo.get_by_mapping(mapping_id)

    async def get_candidate_history(self, candidate_id: int) -> List[PlacementPipelineHistory]:
        return await self.history_repo.get_by_candidate(candidate_id)
