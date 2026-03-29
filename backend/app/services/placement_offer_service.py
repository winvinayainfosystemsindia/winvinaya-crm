from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.placement_offer import PlacementOffer, OfferResponse, JoiningStatus
from app.repositories.placement_offer_repository import PlacementOfferRepository
from app.schemas.placement_offer import PlacementOfferCreate, PlacementOfferUpdate


class PlacementOfferService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = PlacementOfferRepository(db)

    async def create_offer(self, offer_in: PlacementOfferCreate) -> PlacementOffer:
        offer = PlacementOffer(**offer_in.model_dump())
        self.db.add(offer)
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def update_offer(self, id: int, offer_in: PlacementOfferUpdate) -> Optional[PlacementOffer]:
        offer = await self.repository.get(id)
        if not offer:
            return None
        
        update_data = offer_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(offer, key, value)
        
        offer.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(offer)
        return offer

    async def get_by_mapping(self, mapping_id: int) -> Optional[PlacementOffer]:
        return await self.repository.get_by_mapping(mapping_id)

    async def get_by_candidate(self, candidate_id: int) -> List[PlacementOffer]:
        return await self.repository.get_by_candidate(candidate_id)

    async def record_response(self, id: int, response: OfferResponse, remarks: Optional[str] = None) -> Optional[PlacementOffer]:
        offer_update = PlacementOfferUpdate(
            candidate_response=response,
            response_date=date.today(),
            rejection_reason=remarks if response == OfferResponse.REJECTED else None
        )
        return await self.update_offer(id, offer_update)

    async def record_joining(self, id: int, status: JoiningStatus, joining_date: Optional[date] = None) -> Optional[PlacementOffer]:
        offer_update = PlacementOfferUpdate(
            joining_status=status,
            actual_joining_date=joining_date if status == JoiningStatus.JOINED else None
        )
        return await self.update_offer(id, offer_update)
