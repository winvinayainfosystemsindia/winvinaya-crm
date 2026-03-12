"""DSR Activity Type Service"""

from typing import List, Optional, Tuple
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dsr_activity_type import DSRActivityType
from app.models.user import User, UserRole
from app.repositories.dsr_activity_type_repository import DSRActivityTypeRepository
from app.schemas.dsr_activity_type import DSRActivityTypeCreate, DSRActivityTypeUpdate


class DSRActivityTypeService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DSRActivityTypeRepository(db)

    async def create_type(
        self,
        data: DSRActivityTypeCreate,
        current_user: User,
    ) -> DSRActivityType:
        # Only admin
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage activity types.")

        # Code uniqueness check
        existing = await self.repo.get_by_code(data.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Activity type with code '{data.code}' already exists.",
            )

        obj = DSRActivityType(
            name=data.name,
            code=data.code,
            description=data.description,
            is_active=data.is_active,
            sort_order=data.sort_order,
        )
        self.db.add(obj)
        await self.db.flush()
        return obj

    async def update_type(
        self,
        public_id: UUID,
        data: DSRActivityTypeUpdate,
        current_user: User,
    ) -> DSRActivityType:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage activity types.")

        obj = await self.repo.get_by_public_id(public_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity type not found.")

        # Code uniqueness check (skip if same object)
        if data.code and data.code != obj.code:
            existing = await self.repo.get_by_code(data.code)
            if existing and existing.id != obj.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Activity type with code '{data.code}' already exists.",
                )

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(obj, field, value)

        await self.db.flush()
        return obj

    async def delete_type(self, public_id: UUID, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can manage activity types.")

        obj = await self.repo.get_by_public_id(public_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity type not found.")

        obj.soft_delete()
        await self.db.flush()

    async def get_type(self, public_id: UUID) -> DSRActivityType:
        obj = await self.repo.get_by_public_id(public_id)
        if not obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity type not found.")
        return obj

    async def get_types(
        self,
        skip: int = 0,
        limit: int = 100,
        active_only: bool = False,
        search: Optional[str] = None,
    ) -> Tuple[List[DSRActivityType], int]:
        return await self.repo.get_multi_paginated(
            skip=skip,
            limit=limit,
            active_only=active_only,
            search=search,
        )

    async def get_active_types(self) -> List[DSRActivityType]:
        """Shortcut used by the DSR form dropdown."""
        return await self.repo.get_active_types()
