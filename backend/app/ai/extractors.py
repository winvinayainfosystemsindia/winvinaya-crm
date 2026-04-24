import json
import logging
import io
import PyPDF2
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers import get_llm_provider
from app.repositories.company_repository import CompanyRepository
from app.repositories.contact_repository import ContactRepository
from app.repositories.skill_repository import SkillRepository
from app.models.user import User

from app.core.constants import DISABILITY_TYPES, QUALIFICATIONS, CITY_CANONICAL_MAPPINGS, COMMON_SKILLS

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = f"""
You are an expert recruitment assistant for the WinVinaya foundation.
Your task is to analyze a Job Description (JD) and extract details into a structured JSON format.

ALLOWED VALUES:
- disability_preferred: Must be chosen from this list: {json.dumps(DISABILITY_TYPES)}
- qualifications: Must be chosen from this list: {json.dumps(QUALIFICATIONS)}

HINT:
- Use common skill names where possible: {json.dumps(COMMON_SKILLS)}

FIELDS TO EXTRACT:
- title: The job title (e.g., "Full Stack Developer").
- description: A professional, high-fidelity summary of the role. 
    - MUST be less than 2000 characters.
    - MUST use professional Markdown formatting (bullet points for responsibilities, bolding for key terms).
    - Focus on the essence of the role and what makes it a great opportunity.
- no_of_vacancies: Number of openings as an integer. If not found, return null.
- close_date: The application deadline in YYYY-MM-DD format (ISO). If not found, return null.
- location: Object with {{ "cities": list[str], "states": list[str], "country": str }}. 
    - IMPORTANT: You MUST use canonical names from the 'country-state-city' dataset.
    - If specific states aren't found in the text, you MUST infer the correct state(s) based on the cities provided (e.g., if "Bangalore" is found, set city to "Bengaluru" and state to "Karnataka").
    - Default country to "India" if not specified.
- salary_range: Object with {{ "min": float|null, "max": float|null, "currency": "INR" }}.
- experience: Object with {{ "min": float|null, "max": float|null }} in years.
- requirements: Object with {{ "skills": list[str], "qualifications": list[str], "disability_preferred": list[str] }}. 
    - IMPORTANT: Ensure "skills" are single granular tags (e.g. "React", "TypeScript" instead of "React and TypeScript").
    - "qualifications" and "disability_preferred" MUST match the ALLOWED VALUES list above.
- job_details: Object with {{ "designation": str, "workplace_type": "Onsite"|"Remote"|"Hybrid", "job_type": "Full Time"|"Part Time"|"Contract" }}.
- company_name: Name of the hiring company. If not found, return null.
- contact_name: Name of the contact person or recruiter. If not found, return null.
- contact_email: Email of the contact person if found. If not found, return null.
- contact_phone: Phone number of the contact person if found. If not found, return null.

RESPONSE RULES:
1. Return ONLY a valid JSON object.
2. If a field is not found in the text, use null (do not guess except for inferring State/Country from City).
3. Ensure the JSON is strictly correctly formatted.
4. The description MUST be professional and under 2000 characters.
"""

class JobRoleExtractor:
    """Service to extract job role fields from JD text or PDF using AI."""
    
    def __init__(self, db: AsyncSession, user: User):
        self._db = db
        self._user = user

    def _extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extracts plain text from a PDF binary stream."""
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF Parsing error: {str(e)}")
            raise ValueError("Could not read PDF file. Ensure it is a valid PDF.")

    async def extract_from_source(self, jd_text: Optional[str] = None, pdf_file: Optional[bytes] = None) -> dict[str, Any]:
        """
        Calls the LLM to extract fields from either raw text or a PDF.
        """
        source_text = jd_text
        if pdf_file:
            source_text = self._extract_text_from_pdf(pdf_file)

        if not source_text or not source_text.strip():
            raise ValueError("No text provided for analysis.")

        # 1. AI Extraction
        provider = await get_llm_provider(self._db)
        response = await provider.complete(
            system_prompt=SYSTEM_PROMPT,
            user_message=f"Analyze this JD and extract the fields:\n\n{source_text}",
            temperature=0.1
        )

        try:
            # Robust JSON extraction from LLM response
            content = response.content.strip()
            
            # Try to extract content between triple backticks
            import re
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                cleaned_content = json_match.group(1).strip()
            else:
                # If no backticks, try to find the first '{' and last '}'
                first_brace = content.find('{')
                last_brace = content.rfind('}')
                if first_brace != -1 and last_brace != -1:
                    cleaned_content = content[first_brace:last_brace+1].strip()
                else:
                    cleaned_content = content

            extracted_data = json.loads(cleaned_content)
            extracted_data = self._clean_extracted_data(extracted_data)
            extracted_data = await self._sync_skills(extracted_data)
        except Exception as e:
            logger.error(f"Failed to parse AI response: {str(e)}\nContent: {response.content}")
            raise ValueError("AI failed to return valid JSON. Please try again with clearer text.")

        # 2. DB Lookups for Suggestions
        company_name = extracted_data.get("company_name")
        contact_name = extracted_data.get("contact_name")
        contact_email = extracted_data.get("contact_email")
        contact_phone = extracted_data.get("contact_phone")
        
        suggestions = {
            "company_id": None,
            "company_name": company_name,
            "contact_id": None,
            "contact_name": contact_name,
            "contact_email": contact_email,
            "contact_phone": contact_phone
        }

        if company_name:
            company_repo = CompanyRepository(self._db)
            companies, _ = await company_repo.get_multi(search=company_name, limit=1)
            # Fuzzy match check (simple ilike already done by get_multi search)
            if companies:
                suggestions["company_id"] = companies[0].id
                suggestions["company_name"] = companies[0].name
                
                # If we have a company and a contact name/email, look for the contact in that company
                if (contact_name or contact_email) and suggestions["company_id"]:
                    contact_repo = ContactRepository(self._db)
                    
                    # Try searching by email first if available
                    contacts = []
                    if contact_email:
                        existing_contact = await contact_repo.get_by_email(contact_email)
                        if existing_contact:
                            contacts = [existing_contact]
                    
                    # If not found by email, try searching by name within the company
                    if not contacts and contact_name:
                        contacts, _ = await contact_repo.get_multi(
                            company_id=suggestions["company_id"],
                            search=contact_name,
                            limit=1
                        )
                    
                    if contacts:
                        suggestions["contact_id"] = contacts[0].id
                        suggestions["contact_name"] = f"{contacts[0].first_name} {contacts[0].last_name}"
                        suggestions["contact_email"] = contacts[0].email
                        suggestions["contact_phone"] = contacts[0].phone

        return {
            "data": extracted_data,
            "suggestions": suggestions,
            "raw_content": response.content
        }

    def _clean_extracted_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Normalizes extracted data to match master constants and canonical names.
        """
        # 1. Normalize Location Cities
        location = data.get("location", {})
        if location and isinstance(location, dict):
            cities = location.get("cities", [])
            if isinstance(cities, list):
                new_cities = []
                for city in cities:
                    canonical = CITY_CANONICAL_MAPPINGS.get(city.lower(), city)
                    new_cities.append(canonical)
                location["cities"] = new_cities

        # 2. Normalize Qualifications
        requirements = data.get("requirements", {})
        if requirements and isinstance(requirements, dict):
            quals = requirements.get("qualifications", [])
            if isinstance(quals, list):
                new_quals = []
                for q in quals:
                    match = None
                    q_normalized = q.lower().replace(".", "").replace(" ", "")
                    
                    # Try exact normalized match first
                    for master_q in QUALIFICATIONS:
                        mq_normalized = master_q.lower().replace(".", "").replace(" ", "")
                        if q_normalized == mq_normalized:
                            match = master_q
                            break
                    
                    # If no match, try fuzzy matching for common patterns
                    if not match:
                        if "anygrad" in q_normalized:
                            match = "Any Graduation"
                        elif "btech" in q_normalized or "be" == q_normalized:
                            # Note: B.E and B.Tech are often interchangeable but we have both
                            if "btech" in q_normalized: match = "B.Tech"
                            if "be" == q_normalized: match = "B.E"
                        else:
                            # Last resort: substring match
                            for master_q in QUALIFICATIONS:
                                mq_normalized = master_q.lower().replace(".", "").replace(" ", "")
                                if q_normalized in mq_normalized or mq_normalized in q_normalized:
                                    match = master_q
                                    break
                    
                    new_quals.append(match if match else q)
                requirements["qualifications"] = new_quals

            # 3. Normalize Disability Types
            disabilities = requirements.get("disability_preferred", [])
            if isinstance(disabilities, list):
                new_disabilities = []
                for d in disabilities:
                    match = None
                    d_lower = d.lower()
                    # Special cases / Common abbreviations
                    if "loco" in d_lower:
                        match = "Locomotor Disability"
                    elif "blind" in d_lower:
                        match = "Blindness"
                    elif "hearing" in d_lower or "deaf" in d_lower:
                        match = "Hearing Impairment (Deaf and Hard of Hearing)"
                    elif "speech" in d_lower:
                        match = "Speech and Language Disability"
                    elif "intellectual" in d_lower or "id" == d_lower.strip():
                        match = "Intellectual Disability"
                    elif "autism" in d_lower or "asd" in d_lower:
                        match = "Autism Spectrum Disorder"
                    else:
                        # Try to find a match in the master list
                        for master_d in DISABILITY_TYPES:
                            md_lower = master_d.lower()
                            if d_lower in md_lower or md_lower in d_lower:
                                match = master_d
                                break
                    new_disabilities.append(match if match else d)
                requirements["disability_preferred"] = new_disabilities

        return data

    async def _sync_skills(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Synchronizes extracted skills with the skills database.
        If a skill exists (case-insensitive), use the canonical name.
        If not, create the skill in the database.
        """
        requirements = data.get("requirements", {})
        if not requirements or not isinstance(requirements, dict):
            return data

        skills = requirements.get("skills", [])
        if not isinstance(skills, list) or not skills:
            return data

        skill_repo = SkillRepository(self._db)
        new_skill_names = []

        for skill_name in skills:
            if not isinstance(skill_name, str) or not skill_name.strip():
                continue
            
            skill_name = skill_name.strip()
            # 1. Check if skill exists (case-insensitive)
            existing_skill = await skill_repo.get_by_name(skill_name)
            
            if existing_skill:
                # Use the canonical name from the DB
                new_skill_names.append(existing_skill.name)
            else:
                # 2. Create the skill if it doesn't exist
                try:
                    # We only create it if it's a reasonably short string
                    if len(skill_name) < 100:
                        new_skill = await skill_repo.create({"name": skill_name})
                        # Commit immediately to ensure it's available for subsequent calls or other users
                        await self._db.commit()
                        new_skill_names.append(new_skill.name)
                        logger.info(f"AI Extractor: Created new skill '{skill_name}'")
                    else:
                        new_skill_names.append(skill_name)
                except Exception as e:
                    logger.warning(f"Failed to create skill '{skill_name}': {str(e)}")
                    new_skill_names.append(skill_name)
                    await self._db.rollback()

        requirements["skills"] = new_skill_names
        return data
