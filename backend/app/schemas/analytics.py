from typing import List, Dict, Optional
from pydantic import BaseModel

class UserReportMetric(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    role: str
    screening_counts: Dict[str, int] = {}  # status -> count
    today_screening_counts: Dict[str, int] = {}  # status -> count (today)
    counseling_counts: Dict[str, int] = {}  # status -> count
    today_counseling_counts: Dict[str, int] = {}  # status -> count (today)
    documents_collected_count: int = 0

from datetime import date

class AnalyticsSummary(BaseModel):
    total_candidates: int = 0
    today_candidates: int = 0
    total_screened: int = 0
    total_counseled: int = 0
    total_docs_collected: int = 0
    report_date: date
    overall_yet_to_screen: int = 0
    overall_yet_to_counsel: int = 0
    overall_documents_collected: int = 0
    overall_documents_yet_to_collect: int = 0

class ManagementReportResponse(BaseModel):
    users: List[UserReportMetric]
    summary: AnalyticsSummary
