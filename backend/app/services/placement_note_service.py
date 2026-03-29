from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.placement_note import PlacementNote
from app.repositories.placement_note_repository import PlacementNoteRepository
from app.schemas.placement_note import PlacementNoteCreate, PlacementNoteUpdate


class PlacementNoteService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = PlacementNoteRepository(db)

    async def add_note(self, note_in: PlacementNoteCreate) -> PlacementNote:
        note = PlacementNote(**note_in.model_dump())
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def update_note(self, id: int, note_in: PlacementNoteUpdate) -> Optional[PlacementNote]:
        note = await self.repository.get(id)
        if not note:
            return None
        
        update_data = note_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(note, key, value)
        
        note.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def get_by_mapping(self, mapping_id: int) -> List[PlacementNote]:
        return await self.repository.get_by_mapping(mapping_id)

    async def get_by_candidate(self, candidate_id: int) -> List[PlacementNote]:
        return await self.repository.get_by_candidate(candidate_id)

    async def delete_note(self, id: int) -> bool:
        note = await self.repository.get(id)
        if not note:
            return False
        
        note.is_deleted = True
        note.deleted_at = datetime.utcnow()
        await self.db.commit()
        return True
