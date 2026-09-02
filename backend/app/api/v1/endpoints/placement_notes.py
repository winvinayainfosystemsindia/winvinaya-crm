from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.placement_note import NoteType
from app.schemas.placement_note import (
    PlacementNoteResponse, 
    PlacementNoteCreate, 
    PlacementNoteUpdate
)
from app.services.placement_note_service import PlacementNoteService

router = APIRouter()


@router.post("/", response_model=PlacementNoteResponse)
async def add_placement_note(
    note_in: PlacementNoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new internal note to a placement mapping.
    """
    service = PlacementNoteService(db)
    note_in.created_by_id = current_user.id
    return await service.add_note(note_in)


@router.post("/with-attachments", response_model=PlacementNoteResponse)
async def add_placement_note_with_attachments(
    mapping_id: int = Form(...),
    content: str = Form(...),
    note_type: NoteType = Form(NoteType.GENERAL),
    is_pinned: bool = Form(False),
    files: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a new internal note with file attachments to a placement mapping.
    Supports JPG, JPEG, PNG, WEBP, PDF, DOC, DOCX, etc.
    """
    service = PlacementNoteService(db)
    return await service.add_note_with_attachments(
        mapping_id=mapping_id,
        content=content,
        note_type=note_type,
        is_pinned=is_pinned,
        files=files or [],
        created_by_id=current_user.id
    )


@router.get("/{id}/attachments/{file_name}")
async def download_note_attachment(
    id: int,
    file_name: str,
    disposition: str = "inline",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Download or preview an attachment from a placement note.
    """
    service = PlacementNoteService(db)
    note = await service.repository.get(id)
    if not note or note.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    attachments = note.attachments or []
    target_att = next(
        (att for att in attachments if att.get("file_name") == file_name or att.get("saved_name") == file_name),
        None
    )
    if not target_att:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )
    
    file_path = Path(target_att["file_path"])
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=str(file_path),
        filename=target_att.get("file_name", file_name),
        media_type=target_att.get("mime_type") or "application/octet-stream",
        content_disposition_type=disposition
    )


@router.get("/{id}", response_model=PlacementNoteResponse)
async def get_note(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific placement note.
    """
    service = PlacementNoteService(db)
    note = await service.repository.get(id)
    if not note or note.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return note


@router.patch("/{id}", response_model=PlacementNoteResponse)
async def update_note(
    id: int,
    note_in: PlacementNoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update details of a specific placement note (e.g., content or pinning status).
    """
    service = PlacementNoteService(db)
    updated_note = await service.update_note(id, note_in)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return updated_note


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete a placement note.
    """
    service = PlacementNoteService(db)
    success = await service.delete_note(id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return None


@router.get("/mapping/{mapping_id}", response_model=List[PlacementNoteResponse])
async def get_mapping_notes(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all internal notes for a specific placement mapping.
    """
    service = PlacementNoteService(db)
    return await service.get_by_mapping(mapping_id)
