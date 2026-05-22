"""
AI Engine — Placement Scoring Service
======================================

Evaluates how well a candidate matches a job role using an LLM.
Falls back gracefully to rule-based scoring if AI is unavailable.
"""

import json
import logging
import re
import asyncio
from typing import Any, Dict, List, Optional

from app.ai.providers import get_llm_provider
from app.ai.prompts.loader import loader
from app.ai.brain.exceptions import LLMProviderError

logger = logging.getLogger(__name__)


class PlacementScoringService:
    """
    Scores candidate–job role matches using the configured AI provider.

    Usage:
        service = PlacementScoringService(db)
        scores = await service.score_candidates(job_role, candidates_data)
    """

    # Max concurrent LLM calls to avoid API rate limiting
    CONCURRENCY_LIMIT = 10

    def __init__(self, db):
        self._db = db

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    async def score_candidates(
        self,
        job_role,
        candidates: List[Any],
    ) -> Dict[int, Dict]:
        """
        Score multiple candidates against a job role using AI.

        Args:
            job_role: SQLAlchemy JobRole ORM object (fully loaded)
            candidates: List of SQLAlchemy Candidate ORM objects (with relationships loaded)

        Returns:
            Dict mapping candidate.id -> scoring result dict:
            {
                "score": float,
                "explanation": str,
                "recommendation": str,
                "score_source": "ai" | "rule_based"
            }
        """
        try:
            provider = await get_llm_provider(self._db)
        except LLMProviderError as e:
            logger.warning(f"[PlacementScoring] No AI provider configured: {e}. Returning empty.")
            return {}
        except Exception as e:
            logger.warning(f"[PlacementScoring] Failed to load AI provider: {e}. Returning empty.")
            return {}

        job_context = self._build_job_context(job_role)

        semaphore = asyncio.Semaphore(self.CONCURRENCY_LIMIT)
        tasks = [
            self._score_one(semaphore, provider, job_context, candidate)
            for candidate in candidates
        ]
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        output = {}
        for candidate, result in zip(candidates, results_list):
            if isinstance(result, Exception):
                logger.warning(f"[PlacementScoring] Error scoring candidate {candidate.id}: {result}")
                output[candidate.id] = self._fallback_result()
            else:
                output[candidate.id] = result

        return output

    # ──────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────────

    async def _score_one(
        self,
        semaphore: asyncio.Semaphore,
        provider,
        job_context: Dict,
        candidate,
    ) -> Dict:
        """Score a single candidate with semaphore-bounded concurrency."""
        async with semaphore:
            candidate_context = self._build_candidate_context(candidate)

            system_prompt = loader.render(
                "placement/candidate_match_scoring.md",
                {
                    "job_role": job_context,
                    "candidate": candidate_context,
                }
            )

            try:
                response = await provider.complete(
                    system_prompt=system_prompt,
                    user_message="Score this candidate against the job role. Return only valid JSON.",
                    temperature=0.1,
                    max_tokens=1024,
                )
                parsed = self._parse_response(response.content)
                return {
                    "score": round(float(parsed.get("total_score", 0)), 2),
                    "explanation": parsed.get("explanation", ""),
                    "recommendation": parsed.get("recommendation", ""),
                    "score_source": "ai",
                }
            except Exception as e:
                logger.warning(f"[PlacementScoring] AI call failed for candidate {candidate.id}: {e}")
                return self._fallback_result()

    def _build_job_context(self, job_role) -> Dict:
        """Extract job role data into a flat dict for the prompt template."""
        reqs = job_role.requirements or {}
        exp = job_role.experience or {}
        return {
            "title": job_role.title or "",
            "description": job_role.description or "",
            "required_skills": reqs.get("skills") or [],
            "required_qualifications": reqs.get("qualifications") or [],
            "disability_preferred": reqs.get("disability_preferred") or [],
            "experience_min": exp.get("min"),
            "experience_max": exp.get("max"),
        }

    def _build_candidate_context(self, candidate) -> Dict:
        """
        Aggregate all candidate data sources into a flat scoring context dict.
        Handles missing relationships gracefully.
        """
        # ── Basic Info ──────────────────────────────────────────────────────
        name = candidate.name or ""

        disability_type = ""
        if candidate.disability_details and isinstance(candidate.disability_details, dict):
            disability_type = candidate.disability_details.get("disability_type") or ""

        education = []
        if candidate.education_details and "degrees" in candidate.education_details:
            for deg in candidate.education_details["degrees"]:
                if isinstance(deg, dict):
                    deg_name = deg.get("degree_name") or deg.get("degree") or ""
                    if deg_name:
                        education.append(deg_name)

        year_of_experience = None
        if candidate.work_experience and isinstance(candidate.work_experience, dict):
            year_of_experience = candidate.work_experience.get("year_of_experience")

        # ── Skills (Screening + Counseling) ─────────────────────────────────
        screening_skills = self._extract_skills(
            candidate.screening.skills if candidate.screening else None
        )
        counseling_skills = self._extract_skills(
            candidate.counseling.skills if candidate.counseling else None
        )

        # ── Attendance ───────────────────────────────────────────────────────
        attended_sessions = 0
        total_sessions = 0
        attendance_pct = 0

        if candidate.attendance:
            total_sessions = len(candidate.attendance)
            attended_sessions = sum(
                1 for a in candidate.attendance
                if getattr(a, "status", "absent") in ("present", "late", "half_day")
            )
            attendance_pct = round((attended_sessions / total_sessions * 100) if total_sessions > 0 else 0, 1)

        # ── Mock Interviews ──────────────────────────────────────────────────
        mock_interview_status = None
        mock_interview_rating = None
        mock_interview_skills = []

        if candidate.mock_interviews:
            # Use the most recent mock interview (last in list)
            latest = candidate.mock_interviews[-1]
            mock_interview_status = getattr(latest, "status", None)
            mock_interview_rating = getattr(latest, "overall_rating", None)

            skills_data = getattr(latest, "skills", None) or []
            if isinstance(skills_data, list):
                for s in skills_data:
                    if isinstance(s, dict):
                        sname = s.get("skill_name") or s.get("name") or ""
                        rating = s.get("rating") or s.get("level") or ""
                        if sname:
                            mock_interview_skills.append(
                                f"{sname} ({rating})" if rating else sname
                            )
                    elif isinstance(s, str):
                        mock_interview_skills.append(s)

        # ── Counselor Endorsement ─────────────────────────────────────────────
        suitable_job_roles = []
        counselor_feedback = ""

        if candidate.counseling:
            counselor_feedback = getattr(candidate.counseling, "feedback", "") or ""
            others = getattr(candidate.counseling, "others", None) or {}
            if isinstance(others, dict):
                suitable_job_roles = others.get("suitable_job_roles") or []

        return {
            "name": name,
            "disability_type": disability_type,
            "education": education,
            "year_of_experience": year_of_experience,
            "screening_skills": screening_skills,
            "counseling_skills": counseling_skills,
            "attended_sessions": attended_sessions,
            "total_sessions": total_sessions,
            "attendance_pct": attendance_pct,
            "mock_interview_status": mock_interview_status,
            "mock_interview_rating": mock_interview_rating,
            "mock_interview_skills": mock_interview_skills,
            "suitable_job_roles": suitable_job_roles,
            "counselor_feedback": counselor_feedback,
        }

    def _extract_skills(self, skills_obj) -> List[str]:
        """Extract a flat list of skill names from screening/counseling skill JSON."""
        names = []
        if not skills_obj:
            return names

        if isinstance(skills_obj, dict):
            # Categorized: {"technical": [...], "soft": [...]}
            for key in ("technical", "soft", "technical_skills", "soft_skills"):
                items = skills_obj.get(key) or []
                for item in items:
                    if isinstance(item, str):
                        names.append(item)
                    elif isinstance(item, dict):
                        n = item.get("name") or item.get("skill") or ""
                        if n:
                            names.append(n)
        elif isinstance(skills_obj, list):
            for item in skills_obj:
                if isinstance(item, str):
                    names.append(item)
                elif isinstance(item, dict):
                    n = item.get("name") or item.get("skill") or ""
                    if n:
                        names.append(n)

        return list(set(names))  # deduplicate

    def _parse_response(self, content: str) -> Dict:
        """Robustly extract JSON from LLM response (same pattern as extraction_service)."""
        content = content.strip()

        # Try markdown code fence first
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1).strip())

        # Try raw JSON
        first_brace = content.find('{')
        last_brace = content.rfind('}')
        if first_brace != -1 and last_brace != -1:
            return json.loads(content[first_brace:last_brace + 1])

        return json.loads(content)

    def _fallback_result(self) -> Dict:
        """Return a neutral fallback result when AI is unavailable."""
        return {
            "score": None,       # None signals: keep rule-based score
            "explanation": None,
            "recommendation": None,
            "score_source": "rule_based",
        }
