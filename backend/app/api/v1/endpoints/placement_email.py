from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_active_user, get_current_user
from app.models.user import User
from app.schemas.placement_email import CandidateEmailSendRequest
from app.services.placement_email_service import PlacementEmailService

router = APIRouter(prefix="/placement/email", tags=["Placement Email"])

@router.post("/send-candidate/{mapping_id}")
async def send_candidate_profile_email(
    mapping_id: int,
    request_in: CandidateEmailSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Send a candidate's profile and resume to the job role's contact person.
    """
    service = PlacementEmailService(db)
    success = await service.send_candidate_to_company(
        mapping_id=mapping_id,
        user_id=current_user.id,
        custom_email=request_in.custom_email,
        custom_subject=request_in.custom_subject,
        custom_message=request_in.custom_message
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send candidate profile email"
        )
        
    return {"status": "success", "message": "Email sent successfully"}

@router.post("/send-bulk")
async def send_bulk_candidate_profiles(
    request_in: CandidateEmailSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Send multiple candidate profiles in a single email.
    """
    if not request_in.mapping_ids:
        raise HTTPException(status_code=400, detail="No mapping IDs provided")
        
    service = PlacementEmailService(db)
    success = await service.send_bulk_candidates_to_company(
        mapping_ids=request_in.mapping_ids,
        user_id=current_user.id,
        custom_email=request_in.custom_email,
        custom_subject=request_in.custom_subject,
        custom_message=request_in.custom_message
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send bulk candidate profiles"
        )
        
    return {"status": "success", "message": "Bulk email sent successfully"}
