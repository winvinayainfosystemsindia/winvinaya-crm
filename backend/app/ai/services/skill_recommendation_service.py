import logging
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.providers import get_llm_provider
from app.repositories.job_role_repository import JobRoleRepository
from app.models.job_role import JobRoleStatus
from app.core.config import settings
from collections import Counter
import json
import re

logger = logging.getLogger(__name__)

class SkillRecommendationService:
    """
    Service for identifying skill gaps and recommending tags.
    Uses active Job Roles first, then falls back to LLM suggestions for entered skills.
    """

    def __init__(self, db: AsyncSession, user: Any):
        self._db = db
        self._user = user

    async def get_recommendations(self, candidate_skills: list[str]) -> list[str]:
        """
        Suggests high-demand skills the candidate might be missing.
        """
        # 1. If this is a single skill search query from the dropdown, always use LLM if enabled to suggest related skills!
        if len(candidate_skills) == 1 and candidate_skills[0].strip():
            search_query = candidate_skills[0].strip()
            if settings.AI_ENABLED:
                try:
                    provider = await get_llm_provider(self._db)
                    prompt = (
                        f"The user is looking for skills related to: '{search_query}'. "
                        "Recommend 5 to 8 closely related, highly relevant technical "
                        "skills, frameworks, or methodologies. Do not include the entered skill itself.\n"
                        "Return ONLY a valid JSON list of strings, e.g. [\"SkillA\", \"SkillB\"]. "
                        "Do not include any other text, explanation, or markdown formatting."
                    )
                    response = await provider.complete(
                        system_prompt="You return only JSON lists of relevant skills.",
                        user_message=prompt,
                        temperature=0.3
                    )
                    # Parse JSON response
                    content = response.content.strip()
                    json_match = re.search(r'\[(.*?)\]', content, re.DOTALL)
                    if json_match:
                        llm_skills = json.loads(f"[{json_match.group(1).strip()}]")
                    else:
                        first_bracket = content.find('[')
                        last_bracket = content.rfind(']')
                        if first_bracket != -1 and last_bracket != -1:
                            llm_skills = json.loads(content[first_bracket:last_bracket+1])
                        else:
                            llm_skills = json.loads(content)
                    
                    # Return title-cased unique strings
                    recs = []
                    for ls in llm_skills:
                        if isinstance(ls, str) and ls.strip().lower() != search_query.lower():
                            title_s = ls.strip()
                            if title_s not in recs:
                                recs.append(title_s)
                    if recs:
                        return recs[:10]
                except Exception as e:
                    logger.error(f"Failed to generate LLM skill recommendations for search '{search_query}': {str(e)}")

        # 2. Otherwise, fetch active job roles to see what's in demand globally (multi-skill gaps)
        jr_repo = JobRoleRepository(self._db)
        active_roles = await jr_repo.get_multi_with_filters(status=JobRoleStatus.ACTIVE, limit=50)
        
        # 3. Aggregate skills from these roles
        demand_skills = []
        for role in active_roles:
            reqs = role.requirements or {}
            skills = reqs.get("skills", [])
            demand_skills.extend([s.lower().strip() for s in skills if isinstance(s, str)])
        
        # 4. Get most frequent skills
        common_demand = []
        if demand_skills:
            common_demand = [s for s, count in Counter(demand_skills).most_common(20)]
        
        # 5. Filter out skills the candidate already has
        candidate_skills_lower = [s.lower().strip() for s in candidate_skills]
        recommendations = [s.title() for s in common_demand if s not in candidate_skills_lower]
        
        # 6. If demand recommendations are sparse or we want custom LLM suggestions for the entered skills,
        # call the LLM to generate highly relevant related skills as a smart fallback!
        if len(recommendations) < 5 and settings.AI_ENABLED and candidate_skills:
            try:
                provider = await get_llm_provider(self._db)
                prompt = (
                    "You are a professional technical recruiter. The user is evaluating a candidate in the skill(s): "
                    f"{', '.join(candidate_skills)}. Recommend 5 to 8 closely related, highly relevant technical "
                    "skills, frameworks, or methodologies. Do not include the entered skill itself.\n"
                    "Return ONLY a valid JSON list of strings, e.g. [\"SkillA\", \"SkillB\"]. "
                    "Do not include any other text, explanation, or markdown formatting."
                )
                response = await provider.complete(
                    system_prompt="You return only JSON lists of relevant skills.",
                    user_message=prompt,
                    temperature=0.3
                )
                # Parse JSON response
                content = response.content.strip()
                json_match = re.search(r'\[(.*?)\]', content, re.DOTALL)
                if json_match:
                    llm_skills = json.loads(f"[{json_match.group(1).strip()}]")
                else:
                    first_bracket = content.find('[')
                    last_bracket = content.rfind(']')
                    if first_bracket != -1 and last_bracket != -1:
                        llm_skills = json.loads(content[first_bracket:last_bracket+1])
                    else:
                        llm_skills = json.loads(content)
                
                # Filter and add LLM recommendations
                for ls in llm_skills:
                    if isinstance(ls, str) and ls.lower().strip() not in candidate_skills_lower:
                        title_s = ls.strip()
                        if title_s not in recommendations:
                            recommendations.append(title_s)
            except Exception as e:
                logger.error(f"Failed to generate LLM skill recommendations: {str(e)}")
        
        return recommendations[:10]  # Return top 10 suggestions
