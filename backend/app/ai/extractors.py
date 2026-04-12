import json
import logging
import io
import PyPDF2
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.providers import get_llm_provider
from app.repositories.company_repository import CompanyRepository
from app.repositories.contact_repository import ContactRepository
from app.models.user import User

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are an expert recruitment assistant for the WinVinaya foundation.
Your task is to analyze a Job Description (JD) and extract details into a structured JSON format.

FIELDS TO EXTRACT:
- title: The job title (e.g., "Full Stack Developer").
- description: A concise summary of the role.
- no_of_vacancies: Number of openings if specified, else null.
- close_date: The application deadline in YYYY-MM-DD format (ISO) if specified, else null.
- location: Object with { "cities": list[str], "states": list[str], "country": str }. Default country to "India" if not specified.
- salary_range: Object with { "min": float|null, "max": float|null, "currency": "INR" }.
- experience: Object with { "min": float|null, "max": float|null } in years.
- requirements: Object with { "skills": list[str], "qualifications": list[str], "disability_preferred": list[str] }. IMPORTANT: Ensure "skills" are single granular tags (e.g. "React", "TypeScript" instead of "React and TypeScript").
- job_details: Object with { "designation": str, "workplace_type": "Onsite"|"Remote"|"Hybrid", "job_type": "Full Time"|"Part Time"|"Contract" }.
- company_name: Name of the hiring company.
- contact_name: Name of the contact person or recruiter if specified.

RESPONSE RULES:
1. Return ONLY a valid JSON object.
2. If a field is not found, use null or an empty list/object as appropriate.
3. Ensure the JSON is strictly correctly formatted.
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
            # Clean response if LLM added markdown blockers
            cleaned_content = response.content.strip()
            if cleaned_content.startswith("```json"):
                cleaned_content = cleaned_content[7:-3].strip()
            elif cleaned_content.startswith("```"):
                cleaned_content = cleaned_content[3:-3].strip()
            
            extracted_data = json.loads(cleaned_content)
        except Exception as e:
            logger.error(f"Failed to parse AI response: {str(e)}\nContent: {response.content}")
            raise ValueError("AI failed to return valid JSON. Please try again with clearer text.")

        # 2. DB Lookups for Suggestions
        company_name = extracted_data.get("company_name")
        contact_name = extracted_data.get("contact_name")
        
        suggestions = {
            "company_id": None,
            "company_name": company_name,
            "contact_id": None,
            "contact_name": contact_name
        }

        if company_name:
            company_repo = CompanyRepository(self._db)
            companies, _ = await company_repo.get_multi(search=company_name, limit=1)
            # Fuzzy match check (simple ilike already done by get_multi search)
            if companies:
                suggestions["company_id"] = companies[0].id
                suggestions["company_name"] = companies[0].name
                
                # If we have a company and a contact name, look for the contact in that company
                if contact_name and suggestions["company_id"]:
                    contact_repo = ContactRepository(self._db)
                    contacts, _ = await contact_repo.get_multi(
                        company_id=suggestions["company_id"],
                        search=contact_name,
                        limit=1
                    )
                    if contacts:
                        suggestions["contact_id"] = contacts[0].id
                        suggestions["contact_name"] = f"{contacts[0].first_name} {contacts[0].last_name}"

        return {
            "data": extracted_data,
            "suggestions": suggestions,
            "raw_content": response.content
        }
