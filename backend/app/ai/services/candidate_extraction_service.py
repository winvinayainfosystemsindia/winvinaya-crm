"""
AI Engine — Candidate Extraction Service
=========================================

Handles structured candidate data extraction from resumes (PDFs, raw text).
Uses the Jinja2 PromptLoader and the AI Provider system.
"""

import json
import logging
import re
import io
import PyPDF2
import os
from typing import Any, Dict, Optional

from app.ai.providers import get_llm_provider
from app.ai.prompts.loader import loader
from app.core.constants import DISABILITY_TYPES, QUALIFICATIONS, COMMON_SKILLS
from app.repositories.skill_repository import SkillRepository
from app.repositories.candidate_document_repository import CandidateDocumentRepository

logger = logging.getLogger(__name__)


class CandidateExtractionService:
    """
    Service for extracting Candidate details from Resumes.
    """

    def __init__(self, db, user):
        self._db = db
        self._user = user

    async def extract_from_source(
        self, 
        resume_text: Optional[str] = None, 
        pdf_file: Optional[bytes] = None,
        document_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Extracts structured candidate data from text, PDF bytes, or a document ID.
        """
        # 1. Prepare source text
        source_text = resume_text or ""
        
        # If document_id is provided, fetch it from DB
        if document_id:
            repo = CandidateDocumentRepository(self._db)
            doc = await repo.get(document_id)
            if not doc:
                raise ValueError(f"Document {document_id} not found.")
            
            # Read file from filesystem
            if os.path.exists(doc.file_path):
                with open(doc.file_path, "rb") as f:
                    pdf_file = f.read()
            else:
                logger.error(f"File not found at path: {doc.file_path}")

        if pdf_file:
            try:
                reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
                pdf_text = ""
                for page in reader.pages:
                    pdf_text += page.extract_text() + "\n"
                source_text = (resume_text + "\n" + pdf_text) if resume_text else pdf_text
            except Exception as e:
                logger.error(f"Failed to extract text from PDF: {str(e)}")

        if not source_text.strip():
            raise ValueError("No text provided for extraction.")

        # 2. Prepare & Truncate source text
        source_text = self._truncate_source_text(source_text)

        # 3. Render Prompt using Jinja2
        system_prompt = loader.render("extraction/candidate_extraction.md", {
            "DISABILITY_TYPES": DISABILITY_TYPES,
            "QUALIFICATIONS": QUALIFICATIONS,
            "COMMON_SKILLS": COMMON_SKILLS
        })

        # 3. Call LLM
        provider = await get_llm_provider(self._db)
        response = await provider.complete(
            system_prompt=system_prompt,
            user_message=f"Analyze this Resume and extract the fields:\n\n{source_text}",
            temperature=0.1
        )

        # 4. Parse & Clean
        try:
            extracted_data = self._parse_json(response.content)
            extracted_data = await self._post_process(extracted_data)
        except Exception as e:
            logger.error(f"Failed to parse extraction response: {str(e)}")
            raise ValueError("AI failed to return valid structured data. Please try again.")

        return {
            "data": extracted_data,
            "raw_content": response.content
        }

    def _parse_json(self, content: str) -> Dict[str, Any]:
        """Robustly extracts JSON from LLM response."""
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
        """Ensures all extracted skills exist in the DB."""
        skills = data.get("skills", {})
        tech_skills = skills.get("technical_skills", [])
        soft_skills = skills.get("soft_skills", [])
        
        if tech_skills or soft_skills:
            skill_repo = SkillRepository(self._db)
            
            # Sync Technical Skills
            final_tech = []
            for sname in tech_skills:
                if not sname or not isinstance(sname, str): continue
                existing = await skill_repo.get_by_name(sname.strip())
                if existing:
                    final_tech.append(existing.name)
                else:
                    try:
                        new_skill = await skill_repo.create({"name": sname.strip()})
                        await self._db.commit()
                        final_tech.append(new_skill.name)
                    except Exception:
                        await self._db.rollback()
                        final_tech.append(sname)
            
            # Sync Soft Skills
            final_soft = []
            for sname in soft_skills:
                if not sname or not isinstance(sname, str): continue
                existing = await skill_repo.get_by_name(sname.strip())
                if existing:
                    final_soft.append(existing.name)
                else:
                    try:
                        new_skill = await skill_repo.create({"name": sname.strip()})
                        await self._db.commit()
                        final_soft.append(new_skill.name)
                    except Exception:
                        await self._db.rollback()
                        final_soft.append(sname)

            data["skills"]["technical_skills"] = list(set(final_tech))
            data["skills"]["soft_skills"] = list(set(final_soft))
            
        return data

    def _truncate_source_text(self, text: str, max_chars: int = 8000) -> str:
        """
        Truncates source text to stay within LLM provider limits (e.g. Groq TPM).
        15,000 chars is roughly 4,000 tokens.
        """
        if len(text) <= max_chars:
            return text
        
        logger.warning(f"Source text truncated from {len(text)} to {max_chars} characters.")
        return text[:max_chars] + "\n... [TRUNCATED DUE TO SIZE] ..."
