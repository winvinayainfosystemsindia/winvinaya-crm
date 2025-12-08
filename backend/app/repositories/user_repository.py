"""User repository with custom queries"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User model"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(
            User.email == email,
            User.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        query = select(User).where(
            User.username == username,
            User.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_active_users(self, skip: int = 0, limit: int = 100):
        """Get all active users"""
        query = select(User).where(
            User.is_active == True,
            User.is_deleted == False
        ).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def verify_user(self, user_id: int) -> Optional[User]:
        """Mark user as verified"""
        return await self.update(user_id, {"is_verified": True})
    
    async def activate_user(self, user_id: int) -> Optional[User]:
        """Activate user"""
        return await self.update(user_id, {"is_active": True})
    
    async def deactivate_user(self, user_id: int) -> Optional[User]:
        """Deactivate user"""
        return await self.update(user_id, {"is_active": False})
