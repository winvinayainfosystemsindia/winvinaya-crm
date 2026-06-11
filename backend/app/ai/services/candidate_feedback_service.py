import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.providers import get_llm_provider
from app.ai.prompts.loader import render_prompt
from app.core.config import settings

logger = logging.getLogger(__name__)

class CandidateFeedbackService:
    """
    Service for enhancing or generating candidate strengths and improvement feedback using AI.
    """

    def __init__(self, db: AsyncSession, user: Any):
        self._db = db
        self._user = user

    async def process_feedback(
        self,
        feedback_type: str,
        current_text: str,
        candidate_name: Optional[str] = None,
        technical_rating: Optional[int] = None,
        communication_rating: Optional[int] = None,
        attitude_rating: Optional[int] = None,
        skills: Optional[List[Dict[str, Any]]] = None,
        questions: Optional[List[Dict[str, Any]]] = None,
        action: str = "enhance"
    ) -> str:
        """
        Enhance or generate candidate feedback text.
        """
        if not settings.AI_ENABLED:
            raise ValueError("AI Engine is disabled.")

        provider = await get_llm_provider(self._db)
        if feedback_type == "strengths":
            feedback_label = "Key Strengths"
        elif feedback_type == "weaknesses":
            feedback_label = "Areas of Improvement"
        elif feedback_type == "opportunities":
            feedback_label = "Opportunities & Observations"
        elif feedback_type == "threats":
            feedback_label = "Threats & Challenges"
        else:
            feedback_label = feedback_type.capitalize()

        # Construct context about candidate
        candidate_info = ""
        if candidate_name:
            candidate_info += f"Candidate Name: {candidate_name}\n"
        if technical_rating is not None:
            candidate_info += f"Technical Rating: {technical_rating}/5\n"
        if communication_rating is not None:
            candidate_info += f"Communication Rating: {communication_rating}/5\n"
        if attitude_rating is not None:
            candidate_info += f"Attitude Rating: {attitude_rating}/5\n"
        if skills:
            skills_str = ", ".join([f"{s.get('skill', '')} ({s.get('level', '')})" for s in skills if s.get('skill')])
            if skills_str:
                candidate_info += f"Competency Skills: {skills_str}\n"
        if questions:
            qa_str = ""
            for i, q in enumerate(questions):
                q_text = q.get("question", "").strip()
                a_text = q.get("answer", "").strip()
                if q_text and a_text:
                    qa_str += f"Q{i+1}: {q_text}\nA{i+1}: {a_text}\n\n"
            if qa_str:
                candidate_info += f"\nCandidate Q&A Responses Transcript:\n{qa_str}"

        # Load prompts using the template loader
        if action == "generate":
            system_prompt = render_prompt(
                "feedback/generate_feedback_system.md",
                {"feedback_label": feedback_label}
            )
            user_message = render_prompt(
                "feedback/generate_feedback_user.md",
                {"feedback_label": feedback_label, "candidate_info": candidate_info}
            )
        else: # action == "enhance"
            system_prompt = render_prompt(
                "feedback/enhance_feedback_system.md",
                {"feedback_label": feedback_label}
            )
            user_message = render_prompt(
                "feedback/enhance_feedback_user.md",
                {
                    "feedback_label": feedback_label,
                    "current_text": current_text,
                    "candidate_info": candidate_info if candidate_info else None
                }
            )

        # Call active LLM provider
        response = await provider.complete(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.3
        )
        enhanced_text = response.content.strip()

        # Post-process to remove potential markdown code block backticks
        if enhanced_text.startswith("```html"):
            enhanced_text = enhanced_text[7:]
        elif enhanced_text.startswith("```"):
            enhanced_text = enhanced_text[3:]
        if enhanced_text.endswith("```"):
            enhanced_text = enhanced_text[:-3]
        
        return enhanced_text.strip()

    async def analyze_counseling_qa(
        self,
        questions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyze a candidate's Q&A responses and recommend skills with their proficiency levels.
        """
        if not settings.AI_ENABLED:
            raise ValueError("AI Engine is disabled.")

        provider = await get_llm_provider(self._db)

        # Format questions and answers context
        qa_context = ""
        for i, q in enumerate(questions):
            question = q.get("question", "").strip()
            answer = q.get("answer", "").strip()
            if question and answer:
                qa_context += f"Q{i+1}: {question}\nA{i+1}: {answer}\n\n"

        if not qa_context:
            return []

        # Render prompt template
        system_prompt = render_prompt("feedback/analyze_counseling_qa.md")
        user_message = f"Please analyze these interview responses:\n\n{qa_context}"

        # Call active LLM provider
        response = await provider.complete(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.2
        )
        content = response.content.strip()

        # Parse JSON list
        try:
            import json
            import re
            # Clean up potential markdown code blocks
            content = content.replace("```json", "").replace("```", "").strip()
            
            json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
            if json_match:
                skills_list = json.loads(json_match.group(0))
            else:
                skills_list = json.loads(content)
                
            # Filter and validate list format
            validated_skills = []
            for s in skills_list:
                if isinstance(s, dict) and s.get("name") and s.get("level") in ["Beginner", "Intermediate", "Advanced"]:
                    validated_skills.append({
                        "name": s["name"].strip(),
                        "level": s["level"]
                    })
            return validated_skills
        except Exception as e:
            logger.error(f"Failed to parse Q&A analysis JSON: {str(e)}")
            return []
