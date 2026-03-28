"""Skill Repository"""

from typing import List, Optional
from sqlalchemy import select, func
from app.models.skill import Skill
from app.repositories.base import BaseRepository


class SkillRepository(BaseRepository[Skill]):
    """Repository for Skill model"""
    
    def __init__(self, db):
        super().__init__(Skill, db)
        
    async def get_by_name(self, name: str) -> Optional[Skill]:
        """Get skill by name (case-insensitive)"""
        stmt = select(self.model).where(func.lower(self.model.name) == func.lower(name))
        result = await self.db.execute(stmt)
        return result.scalars().first()
        
    async def search(self, query: str, limit: int = 10) -> List[Skill]:
        """Search skills by name (case-insensitive)"""
        stmt = select(self.model).where(
            self.model.name.ilike(f"%{query}%")
        ).order_by(self.model.name).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_alphabetical(self, limit: int = 100) -> List[Skill]:
        """Get all skills ordered alphabetically"""
        stmt = select(self.model).order_by(self.model.name).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
