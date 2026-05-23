"""Skill Service"""

import json
import re
import logging
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate
from app.repositories.skill_repository import SkillRepository
from app.ai.providers import get_llm_provider
from app.ai.prompts.loader import loader

logger = logging.getLogger(__name__)


class SkillService:
    """Service for Skill management business logic"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = SkillRepository(db)

    async def _check_ai_duplicate(self, name: str, exclude_name: Optional[str] = None) -> None:
        """
        Check if the proposed skill name is a semantic duplicate (alias, variation,
        abbreviation, or synonym) of any existing skill in the master table.
        """
        try:
            # 1. Fetch all master skill names (up to a reasonable limit)
            master_skills = await self.repository.get_all_alphabetical(limit=2000)
            existing_names = [s.name for s in master_skills]
            
            if exclude_name and exclude_name in existing_names:
                existing_names.remove(exclude_name)
            
            if not existing_names:
                return

            # 2. Get the active LLM provider
            provider = await get_llm_provider(self.db)
            
            # 3. Formulate prompts (Loaded from template)
            system_prompt = loader.render("system/skill_deduplication.md")
            
            user_message = f"Existing Skills: {existing_names}\nProposed New Skill: '{name}'"
            
            # 4. Call LLM
            response = await provider.complete(
                system_prompt=system_prompt,
                user_message=user_message,
                temperature=0.1
            )
            
            # 5. Parse output
            content = response.content.strip()
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(1).strip())
            else:
                first_brace = content.find('{')
                last_brace = content.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    parsed = json.loads(content[first_brace:last_brace+1])
                else:
                    parsed = json.loads(content)
            
            # 6. Check results
            is_duplicate = parsed.get("is_duplicate", False)
            matched_skill = parsed.get("matched_skill")
            suggested_name = parsed.get("suggested_name")
            reason = parsed.get("reason")
            
            # Case 1: Semantic duplicate of an existing skill
            if is_duplicate and matched_skill:
                explanation = f" ({reason})" if reason else ""
                detail = f"A similar skill '{matched_skill}' already exists in the system. Please use '{matched_skill}' instead of '{name}' to avoid duplicate entries.{explanation}"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=detail
                )
                
            # Case 2: No duplicate in database, but the AI identified a typo or recommended standardization
            if suggested_name and suggested_name.strip().lower() != name.strip().lower():
                # Check if the corrected suggestion already exists in the DB
                existing_suggested = await self.repository.get_by_name(suggested_name.strip())
                if existing_suggested:
                    detail = f"A similar skill '{existing_suggested.name}' already exists in the system. Please use '{existing_suggested.name}' instead of '{name}'."
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=detail
                    )
                
                # Proactively suggest the spelling correction to the user
                explanation = f" ({reason})" if reason else ""
                detail = f"Did you mean '{suggested_name}'? Please add it as '{suggested_name}' to avoid spelling mistakes and keep the skills list clean.{explanation}"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=detail
                )
                
        except HTTPException:
            # Re-raise standard HTTPExceptions (like the 400 Bad Request duplicate error)
            raise
        except Exception as e:
            # Fall back gracefully to database check in case of LLM outages, rate limits, or parse errors
            logger.warning(f"AI duplicate skill check failed gracefully, proceeding with standard exact match check. Error: {str(e)}")
            return
        
    async def create_skill(self, skill_in: SkillCreate, created_by_id: Optional[int] = None) -> Skill:
        """Create a new skill if it doesn't exist (case-insensitive check and AI duplicate check)"""
        # Normalize name (Trim)
        name = skill_in.name.strip()
        
        # Check for existing skill with same name (case-insensitive)
        existing_skill = await self.repository.get_by_name(name)
        if existing_skill:
            return existing_skill # Return existing instead of error to handle "Add new" gracefully
            
        # Run AI semantic duplicate check
        await self._check_ai_duplicate(name)
            
        skill_data = skill_in.model_dump()
        skill_data["name"] = name # Use normalized name
        if created_by_id is not None:
            skill_data["created_by_id"] = created_by_id
        new_skill = await self.repository.create(skill_data)
        if created_by_id is not None:
            await self.db.refresh(new_skill, ["creator"])
        return new_skill

        
    async def get_skills(self, query: Optional[str] = None, limit: int = 100) -> List[Skill]:
        """Search or get all skills"""
        if query:
            return await self.repository.search(query, limit)
        return await self.repository.get_all_alphabetical(limit)

    async def get_skill(self, skill_id: int) -> Optional[Skill]:
        """Get skill by ID"""
        return await self.repository.get(skill_id)

    async def update_skill(self, skill_id: int, skill_in: SkillUpdate) -> Optional[Skill]:
        """Update a skill (with duplicate and AI semantic check)"""
        # Get current skill
        current_skill = await self.repository.get(skill_id)
        if not current_skill:
            return None
            
        update_data = skill_in.model_dump(exclude_unset=True)
        
        if "name" in update_data:
            name = update_data["name"].strip()
            # If the name is actually changing (case-insensitive check)
            if name.lower() != current_skill.name.lower():
                # 1. Check if another active skill with this name already exists
                existing_skill = await self.repository.get_by_name(name)
                if existing_skill and existing_skill.id != skill_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"A skill with the name '{name}' already exists in the system."
                    )
                
                # 2. Run AI semantic duplicate check, excluding the current skill name
                await self._check_ai_duplicate(name, exclude_name=current_skill.name)
                
            update_data["name"] = name
            
        # Perform database update
        updated_skill = await self.repository.update(skill_id, update_data)
        if updated_skill and updated_skill.created_by_id is not None:
            await self.db.refresh(updated_skill, ["creator"])
        return updated_skill

    async def delete_skill(self, skill_id: int) -> bool:
        """Delete a skill (soft delete)"""
        return await self.repository.delete(skill_id, soft=True)

    async def verify_skill(self, skill_id: int) -> Optional[Skill]:
        """Verify a skill"""
        return await self.repository.update(skill_id, {"is_verified": True})

    async def get_aggregated_skills(self) -> List[str]:
        """
        Aggregate unique skills from:
        1. Master Skill table
        2. Candidate Screening records (JSON technical/soft skills)
        3. Candidate Counseling records (JSON assessment skills)
        """
        # 1. Get skills from master table
        master_skills = await self.repository.get_all_alphabetical(limit=1000)
        master_skill_names = [s.name for s in master_skills]
        
        # 2. Get skills from screening
        screening_skills = await self.repository.get_unique_screening_skills()
        
        # 3. Get skills from counseling
        counseling_skills = await self.repository.get_unique_counseling_skills()
        
        # Combine and deduplicate
        all_skills = set(master_skill_names + screening_skills + counseling_skills)
        
        # Clean and sort
        cleaned_skills = [s.strip() for s in all_skills if s and s.strip()]
        return sorted(cleaned_skills)
