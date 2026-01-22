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

class ManagementReportResponse(BaseModel):
    users: List[UserReportMetric]
    summary: Dict[str, int] = {}
