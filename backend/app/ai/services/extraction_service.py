"""
AI Engine — Extraction Service
==============================

Handles structured data extraction from unstructured sources (JDs, Resumes).
Uses the Jinja2 PromptLoader and the AI Provider system.
"""

import json
import logging
from typing import Any, Dict, Optional

from app.ai.providers import get_llm_provider
from app.ai.prompts.loader import loader
from app.ai.core.exceptions import LLMProviderError
from app.core.constants import DISABILITY_TYPES, QUALIFICATIONS, COMMON_SKILLS
from app.repositories.company_repository import CompanyRepository
from app.repositories.contact_repository import ContactRepository
from app.repositories.skill_repository import SkillRepository

logger = logging.getLogger(__name__)

class JobRoleExtractionService:
    """
    Service for extracting Job Role details from JDs.
    """

    def __init__(self, db, user):
        self._db = db
        self._user = user

    async def extract_from_source(self, jd_text: str = None, pdf_file: bytes = None) -> Dict[str, Any]:
        """
        Extracts structured job role data from text or PDF.
        """
        # 1. Prepare source text
        source_text = jd_text or ""
        if pdf_file:
            import io
            import PyPDF2
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
                pdf_text = ""
                for page in reader.pages:
                    pdf_text += page.extract_text() + "\n"
                source_text = (jd_text + "\n" + pdf_text) if jd_text else pdf_text
            except Exception as e:
                logger.error(f"Failed to extract text from PDF: {str(e)}")
                # Continue with jd_text if available

        if not source_text.strip():
            raise ValueError("No text provided for extraction.")

        # 2. Render Prompt using Jinja2
        # Note: 'skills_ref' is automatically injected by the loader
        system_prompt = loader.render("extraction/job_role_extraction.md", {
            "DISABILITY_TYPES": DISABILITY_TYPES,
            "QUALIFICATIONS": QUALIFICATIONS,
            "COMMON_SKILLS": COMMON_SKILLS
        })

        # 3. Call LLM
        provider = await get_llm_provider(self._db)
        response = await provider.complete(
            system_prompt=system_prompt,
            user_message=f"Analyze this JD and extract the fields:\n\n{source_text}",
            temperature=0.1
        )

        # 4. Parse & Clean
        try:
            extracted_data = self._parse_json(response.content)
            extracted_data = await self._post_process(extracted_data)
        except Exception as e:
            logger.error(f"Failed to parse extraction response: {str(e)}")
            raise ValueError("AI failed to return valid structured data. Please try again.")

        # 5. Domain Lookups (Suggestions)
        suggestions = await self._generate_suggestions(extracted_data)

        return {
            "data": extracted_data,
            "suggestions": suggestions,
            "raw_content": response.content
        }

    def _parse_json(self, content: str) -> Dict[str, Any]:
        """Robustly extracts JSON from LLM response."""
        import re
        content = content.strip()
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1).strip())
        
        first_brace = content.find('{')
        last_brace = content.rfind('}')
        if first_brace != -1 and last_brace != -1:
            return json.loads(content[first_brace:last_brace+1])
            
        return json.loads(content)

    async def _post_process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Final validation of extracted data.
        The LLM does the 'thinking', the code just ensures DB compatibility.
        """
        requirements = data.get("requirements", {})
        if requirements:
            # Sync skills with DB (create if missing)
            data = await self._sync_skills(data)
            
            # Simple validation for qualifications/disabilities
            # (If LLM hallucinated something outside our list, we keep it as-is 
            # but usually the prompt handles this now).
            pass
            
        return data

    async def _sync_skills(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures all extracted skills exist in the DB."""
        requirements = data.get("requirements", {})
        skills = requirements.get("skills", [])
        if not skills:
            return data

        skill_repo = SkillRepository(self._db)
        final_skills = []
        for sname in skills:
            if not sname or not isinstance(sname, str): continue
            sname = sname.strip()
            existing = await skill_repo.get_by_name(sname)
            if existing:
                final_skills.append(existing.name)
            else:
                try:
                    new_skill = await skill_repo.create({"name": sname})
                    await self._db.commit()
                    final_skills.append(new_skill.name)
                except Exception:
                    await self._db.rollback()
                    final_skills.append(sname)
        
        requirements["skills"] = list(set(final_skills))
        return data

    async def _generate_suggestions(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Finds matching company/contact IDs in the DB."""
        company_name = data.get("company_name")
        contact_name = data.get("contact_name")
        contact_email = data.get("contact_email")

        suggestions = {
            "company_id": None,
            "company_name": company_name,
            "contact_id": None,
            "contact_name": contact_name,
        }

        if company_name:
            company_repo = CompanyRepository(self._db)
            companies, _ = await company_repo.get_multi(search=company_name, limit=1)
            if companies:
                comp = companies[0]
                suggestions["company_id"] = comp.id
                suggestions["company_name"] = comp.name

                if (contact_name or contact_email):
                    contact_repo = ContactRepository(self._db)
                    contacts = []
                    if contact_email:
                        existing = await contact_repo.get_by_email(contact_email)
                        if existing: contacts = [existing]
                    
                    if not contacts and contact_name:
                        contacts, _ = await contact_repo.get_multi(
                            company_id=comp.id, search=contact_name, limit=1
                        )
                    
                    if contacts:
                        suggestions["contact_id"] = contacts[0].id
                        suggestions["contact_name"] = f"{contacts[0].first_name} {contacts[0].last_name}"

        return suggestions
