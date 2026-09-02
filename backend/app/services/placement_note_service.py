import os
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.placement_note import PlacementNote, NoteType
from app.repositories.placement_note_repository import PlacementNoteRepository
from app.schemas.placement_note import PlacementNoteCreate, PlacementNoteUpdate

ALLOWED_NOTE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".zip"}
MAX_NOTE_FILE_SIZE = 10 * 1024 * 1024  # 10MB
BASE_NOTE_UPLOAD_DIR = Path("uploads/placement_notes")


class PlacementNoteService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = PlacementNoteRepository(db)

    async def add_note(self, note_in: PlacementNoteCreate) -> PlacementNote:
        # Automatically populate candidate_id and job_role_id if missing but mapping_id is provided
        if note_in.mapping_id and (not note_in.candidate_id or not note_in.job_role_id):
            from app.services.placement_mapping_service import PlacementMappingService
            mapping_service = PlacementMappingService(self.db)
            mapping = await mapping_service.repository.get(note_in.mapping_id)
            if mapping:
                note_in.candidate_id = note_in.candidate_id or mapping.candidate_id
                note_in.job_role_id = note_in.job_role_id or mapping.job_role_id

        note = PlacementNote(**note_in.model_dump())
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)
        
        # Load created_by relationship for the response
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        stmt = select(PlacementNote).where(PlacementNote.id == note.id).options(selectinload(PlacementNote.created_by))
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def add_note_with_attachments(
        self,
        mapping_id: int,
        content: str,
        note_type: NoteType = NoteType.GENERAL,
        is_pinned: bool = False,
        files: Optional[List[UploadFile]] = None,
        created_by_id: Optional[int] = None
    ) -> PlacementNote:
        from app.services.placement_mapping_service import PlacementMappingService
        mapping_service = PlacementMappingService(self.db)
        mapping = await mapping_service.repository.get(mapping_id)
        if not mapping:
            raise HTTPException(status_code=404, detail="Placement mapping not found")

        attachments_data = []
        if files:
            target_dir = BASE_NOTE_UPLOAD_DIR / str(mapping_id)
            target_dir.mkdir(parents=True, exist_ok=True)
            
            for file in files:
                if not file.filename:
                    continue
                ext = Path(file.filename).suffix.lower()
                if ext not in ALLOWED_NOTE_EXTENSIONS:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid file type '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_NOTE_EXTENSIONS))}"
                    )
                
                content_bytes = await file.read()
                if len(content_bytes) > MAX_NOTE_FILE_SIZE:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File '{file.filename}' is too large. Maximum allowed size is 10MB."
                    )
                
                # Sanitize base filename and make unique
                safe_base = Path(file.filename).stem.replace(" ", "_")[:50]
                unique_name = f"{safe_base}_{uuid.uuid4().hex[:8]}{ext}"
                file_path = target_dir / unique_name
                
                with open(file_path, "wb") as f:
                    f.write(content_bytes)
                
                attachments_data.append({
                    "file_name": file.filename,
                    "saved_name": unique_name,
                    "file_path": str(file_path),
                    "file_size": len(content_bytes),
                    "mime_type": file.content_type or "application/octet-stream"
                })

        note = PlacementNote(
            mapping_id=mapping_id,
            candidate_id=mapping.candidate_id,
            job_role_id=mapping.job_role_id,
            note_type=note_type,
            content=content,
            is_pinned=is_pinned,
            created_by_id=created_by_id,
            attachments=attachments_data if attachments_data else None
        )
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)
        
        # Load created_by relationship for the response
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        stmt = select(PlacementNote).where(PlacementNote.id == note.id).options(selectinload(PlacementNote.created_by))
        result = await self.db.execute(stmt)
        return result.scalar_one()

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
