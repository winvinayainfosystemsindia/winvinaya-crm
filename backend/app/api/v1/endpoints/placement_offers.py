from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.placement_offer import (
    PlacementOfferResponse, 
    PlacementOfferCreate, 
    PlacementOfferUpdate
)
from app.services.placement_offer_service import PlacementOfferService

router = APIRouter()


@router.post("/", response_model=PlacementOfferResponse)
async def create_placement_offer(
    offer_in: PlacementOfferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new job offer for a placement mapping.
    """
    service = PlacementOfferService(db)
    offer_in.offered_by_id = current_user.id
    return await service.create_offer(offer_in)


@router.get("/{id}", response_model=PlacementOfferResponse)
async def get_offer(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific job offer.
    """
    service = PlacementOfferService(db)
    offer = await service.repository.get(id)
    if not offer or offer.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    return offer


@router.patch("/{id}", response_model=PlacementOfferResponse)
async def update_offer(
    id: int,
    offer_in: PlacementOfferUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update details of a specific job offer.
    """
    service = PlacementOfferService(db)
    updated_offer = await service.update_offer(id, offer_in)
    if not updated_offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    return updated_offer


@router.get("/mapping/{mapping_id}", response_model=Optional[PlacementOfferResponse])
async def get_mapping_offer(
    mapping_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the job offer associated with a specific placement mapping.
    Each mapping can have at most one offer.
    """
    service = PlacementOfferService(db)
    return await service.get_by_mapping(mapping_id)


@router.get("/candidate/{candidate_id}", response_model=List[PlacementOfferResponse])
async def get_candidate_offers(
    candidate_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all job offers received by a specific candidate across all job roles.
    """
    service = PlacementOfferService(db)
    return await service.get_by_candidate(candidate_id)


@router.post("/{mapping_id}/upload-letter", response_model=PlacementOfferResponse)
async def upload_offer_letter(
    mapping_id: int,
    file: UploadFile = File(...),
    offered_ctc: Optional[float] = Form(None),
    joining_date: Optional[date] = Form(None),
    offered_designation: Optional[str] = Form(None),
    remarks: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an offer letter for a placement mapping and update offer details.
    Also automatically moves the status to 'offer_made'.
    """
    service = PlacementOfferService(db)
    
    # 1. Upload letter and update offer
    offer = await service.upload_offer_letter(
        mapping_id=mapping_id,
        file=file,
        user_id=current_user.id,
        offered_ctc=offered_ctc,
        joining_date=joining_date,
        offered_designation=offered_designation,
        remarks=remarks
    )

    return offer
