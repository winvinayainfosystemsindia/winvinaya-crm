import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from openai import AsyncOpenAI
from app.repositories.system_setting_repository import SystemSettingRepository
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SystemSettingRepository(db)
        self.enabled = False
        self.provider = "google"  # "google" or "openai-compatible"
        self.api_key = None
        self.provider_url = None
        self.model_name = "gemini-pro"
        self.google_client = None
        self.openai_client = None

    SYSTEM_INSTRUCTION = (
        "You are Sarathi, an internal CRM Assistant for WinVinaya. Your goal is to provide helpful, data-driven insights from the CRM database. "
        "Strictly follow these rules: "
        "1. You are friendly and can respond to greetings, thank yous, and general conversation. "
        "2. Identify yourself as Sarathi when asked. "
        "3. For information about candidates, users, deals, leads, stats, USER PERFORMANCE, or DAILY REPORTS, you MUST use your tools. "
        "4. **CRITICAL:** NEVER mention tool names (like 'get_daily_report' or 'search_candidates') in your response to the user. "
        "5. Use clear, professional formatting (bullet points, bold text) for reports and data summaries. "
        "6. NEVER hallucinate or make up data. If tool results are empty, say so. "
        "7. If you don't have a tool for a specific data request, say 'I don't have access to that information.' "
        "8. Start data-heavy responses with a brief professional confirmation like 'Certainly, let me pull those details for you...'."
    )

    async def initialize(self):
        """Fetch configurations and initialize the appropriate AI client"""
        settings = await self.repo.get_all_settings()
        config = {s.key: s.value for s in settings}
        
        self.enabled = config.get("ai_enabled", "false").lower() == "true"
        self.api_key = (config.get("ai_api_key") or "").strip()
        self.provider_url = (config.get("ai_provider_url") or "").strip()
        self.model_name = (config.get("ai_model") or "gemini-pro").strip()
        
        # Adaptive Provider Detection
        self.provider = self._detect_provider()
        
        if not self.enabled or not self.api_key:
            logger.warning("AI Service is disabled or missing API key")
            return

        try:
            if self.provider == "google":
                genai.configure(api_key=self.api_key)
                tools = [
                    self.get_candidate_stats,
                    self.search_candidates,
                    self.get_company_info,
                    self.get_deal_stats,
                    self.search_leads,
                    self.search_users
                ]
                self.google_client = genai.GenerativeModel(
                    model_name=self.model_name, 
                    tools=tools,
                    system_instruction=self.SYSTEM_INSTRUCTION
                )
                logger.info(f"AI Service (Adaptive -> Google) initialized with model: {self.model_name}")
            else:
                self.openai_client = AsyncOpenAI(
                    api_key=self.api_key,
                    base_url=self.provider_url or "https://api.groq.com/openai/v1"
                )
                logger.info(f"AI Service (Adaptive -> OpenAI-compatible) initialized at: {self.openai_client.base_url}")
        except Exception as e:
            logger.error(f"Failed to initialize AI client: {e}")
            self.enabled = False

    def _detect_provider(self) -> str:
        """Heuristically detect the AI provider based on URL or model strings"""
        url = (self.provider_url or "").lower()
        model = (self.model_name or "").lower()
        
        if "googleapis.com" in url or "gemini" in model:
            return "google"
        
        # Default to OpenAI-compatible for Groq, Local LLMs, etc.
        return "openai-compatible"

    # --- Tool Definitions ---

    async def get_candidate_stats(self) -> Dict[str, Any]:
        """Get high-level candidate statistics (total, screened, not screened, etc.)"""
        from app.repositories.candidate_repository import CandidateRepository
        repo = CandidateRepository(self.db)
        stats = await repo.get_stats()
        return stats

    async def search_candidates(self, query: str) -> List[Dict[str, Any]]:
        """Search for candidates by name, email, or city. Returns a list of candidates."""
        from app.repositories.candidate_repository import CandidateRepository
        repo = CandidateRepository(self.db)
        candidates, _ = await repo.get_screened(search=query, limit=5)
        return [{"name": c.name, "email": c.email, "city": c.city, "status": c.screening_status} for c in candidates]

    async def get_company_info(self, name: str) -> Dict[str, Any]:
        """Fetch details about a company and its current status."""
        from app.repositories.company_repository import CompanyRepository
        repo = CompanyRepository(self.db)
        companies, _ = await repo.get_all(search=name, limit=1)
        if companies:
            c = companies[0]
            return {"name": c.name, "industry": c.industry, "status": c.status, "website": c.website}
        return {"error": "Company not found"}

    async def get_deal_stats(self) -> Dict[str, Any]:
        """Get high-level CRM deal statistics (total deals, amount by stage, etc.)"""
        from app.repositories.deal_repository import DealRepository
        repo = DealRepository(self.db)
        deals, _ = await repo.get_all(limit=100)
        
        stats = {
            "total_deals": len(deals),
            "by_stage": {}
        }
        for d in deals:
            stats["by_stage"][d.stage] = stats["by_stage"].get(d.stage, 0) + 1
        return stats

    async def search_leads(self, query: str) -> List[Dict[str, Any]]:
        """Search for potential CRM leads. Returns a list of leads with their source and status."""
        from app.repositories.lead_repository import LeadRepository
        repo = LeadRepository(self.db)
        leads, _ = await repo.get_all(search=query, limit=5)
        return [{"name": f"{l.first_name} {l.last_name}", "source": l.source, "status": l.status} for l in leads]

    async def search_users(self, query: str = None, role: str = None) -> List[Dict[str, Any]]:
        """Search for system users by name or role (e.g., 'admin', 'manager'). Returns real names from DB."""
        from app.repositories.user_repository import UserRepository
        repo = UserRepository(self.db)
        users = await repo.search_users(query=query, role=role, limit=10)
        return [{"id": u.id, "full_name": u.full_name, "username": u.username, "role": u.role, "email": u.email} for u in users]

    async def get_user_performance(self, username: str) -> Dict[str, Any]:
        """Fetch performance metrics for a specific system user (e.g., how many screenings they've done)."""
        from app.repositories.user_repository import UserRepository
        from app.repositories.candidate_screening_repository import CandidateScreeningRepository
        
        user_repo = UserRepository(self.db)
        screening_repo = CandidateScreeningRepository(self.db)
        
        user = await user_repo.get_by_username(username)
        if not user:
            # Try searching by full name if username lookup fails
            users = await user_repo.search_users(query=username, limit=1)
            if users:
                user = users[0]
            else:
                return {"error": f"User '{username}' not found in the system."}
        
        screening_count = await screening_repo.count_screenings_by_user(user.id)
        
        return {
            "full_name": user.full_name,
            "username": user.username,
            "role": user.role,
            "screenings_performed": screening_count,
            "status": "Active" if user.is_active else "Inactive"
        }

    async def get_daily_report(self) -> Dict[str, Any]:
        """Generate a summarized report of all activities performed today."""
        from datetime import datetime, time
        from app.repositories.candidate_repository import CandidateRepository
        from app.repositories.candidate_screening_repository import CandidateScreeningRepository
        from app.repositories.crm_activity_log_repository import CRMActivityLogRepository
        
        today_start = datetime.combine(datetime.now().date(), time.min)
        today_end = datetime.combine(datetime.now().date(), time.max)
        
        candidate_repo = CandidateRepository(self.db)
        screening_repo = CandidateScreeningRepository(self.db)
        crm_repo = CRMActivityLogRepository(self.db)
        
        # 1. New Candidates
        new_candidates = await candidate_repo.get_new_candidates_by_date(today_start, today_end)
        
        # 2. Screenings
        screenings = await screening_repo.get_screenings_by_date(today_start, today_end)
        
        # 3. CRM Activities
        crm_activities = await crm_repo.get_activities_by_date(today_start, today_end)
        
        # Format the summary
        report = {
            "date": datetime.now().date().isoformat(),
            "new_candidates_count": len(new_candidates),
            "new_candidates": [c.name for c in new_candidates[:10]],
            "screenings_count": len(screenings),
            "screenings_details": [
                f"{s.candidate.name} screened by {s.screened_by.full_name} ({s.status})" 
                for s in screenings if s.candidate and s.screened_by
            ],
            "crm_activities_count": len(crm_activities),
            "crm_activities_summary": [
                f"{a.performer.full_name}: {a.summary} ({a.activity_type})"
                for a in crm_activities if a.performer
            ]
        }
        
        return report

    # --- Chat Implementation ---

    async def chat(self, message: str, history: List[Dict[str, str]] = []) -> str:
        """Send a message to the AI and get a response"""
        if not self.enabled:
            return "Sarathi is currently offline. Please check back later or contact support."

        try:
            if self.provider == "google" and self.google_client:
                gemini_history = []
                for h in history:
                    role = "user" if h["role"] == "user" else "model"
                    gemini_history.append({"role": role, "parts": [h["content"]]})
                
                chat_session = self.google_client.start_chat(history=gemini_history, enable_automatic_function_calling=True)
                response = await chat_session.send_message_async(message)
                return response.text
            
            elif self.openai_client:
                # Prepare tools for OpenAI/Groq
                openai_tools = [
                    {
                        "type": "function",
                        "function": {
                            "name": "get_candidate_stats",
                            "description": "Get high-level candidate statistics",
                            "parameters": {"type": "object", "properties": {}, "required": []}
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "search_candidates",
                            "description": "Search for candidates by name, email, or city",
                            "parameters": {
                                "type": "object",
                                "properties": {"query": {"type": "string", "description": "Search term"}},
                                "required": ["query"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "get_user_performance",
                            "description": "Fetch performance metrics for a specific system user (e.g., how many screenings they've done)",
                            "parameters": {
                                "type": "object",
                                "properties": {"username": {"type": "string", "description": "Username or full name of the user"}},
                                "required": ["username"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "get_company_info",
                            "description": "Fetch details about a company",
                            "parameters": {
                                "type": "object",
                                "properties": {"name": {"type": "string", "description": "Company name"}},
                                "required": ["name"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "get_deal_stats",
                            "description": "Get CRM deal statistics",
                            "parameters": {"type": "object", "properties": {}, "required": []}
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "get_daily_report",
                            "description": "Generate a summarized report of all activities performed today (new candidates, screenings, CRM logs)",
                            "parameters": {"type": "object", "properties": {}, "required": []}
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "search_users",
                            "description": "Search for system users by name or role",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "query": {"type": "string", "description": "Name or email search term"},
                                    "role": {"type": "string", "description": "User role (e.g., admin, manager)"}
                                },
                                "required": []
                            }
                        }
                    }
                ]

                messages = [{"role": "system", "content": self.SYSTEM_INSTRUCTION}]
                for h in history:
                    messages.append({"role": h["role"], "content": h["content"]})
                messages.append({"role": "user", "content": message})
                
                # First attempt to see if LLM wants to call a tool
                response = await self.openai_client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    tools=openai_tools,
                    tool_choice="auto"
                )
                
                response_message = response.choices[0].message
                tool_calls = response_message.tool_calls

                if tool_calls:
                    messages.append(response_message)
                    
                    # Available tools mapping
                    available_tools = {
                        "get_candidate_stats": self.get_candidate_stats,
                        "search_candidates": self.search_candidates,
                        "get_user_performance": self.get_user_performance,
                        "get_company_info": self.get_company_info,
                        "get_deal_stats": self.get_deal_stats,
                        "get_daily_report": self.get_daily_report,
                        "search_users": self.search_users
                    }

                    for tool_call in tool_calls:
                        function_name = tool_call.function.name
                        if function_name not in available_tools:
                            logger.error(f"AI attempted to call unknown tool: {function_name}")
                            messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": json.dumps({"error": f"Unknown tool: {function_name}"}),
                            })
                            continue

                        function_to_call = available_tools[function_name]
                        
                        try:
                            function_args = json.loads(tool_call.function.arguments) or {}
                        except:
                            function_args = {}
                        
                        if function_to_call:
                            tool_result = await function_to_call(**function_args)
                            messages.append({
                                "tool_call_id": tool_call.id,
                                "role": "tool",
                                "name": function_name,
                                "content": json.dumps(tool_result),
                            })
                    
                    # Final response with tool results
                    final_response = await self.openai_client.chat.completions.create(
                        model=self.model_name,
                        messages=messages
                    )
                    return final_response.choices[0].message.content or "I couldn't process that data right now."
                
                return response_message.content or "I'm sorry, I couldn't generate a response."
            
            return "Sarathi is currently unable to process requests. Please ensure your AI configuration is correct."
        except Exception as e:
            logger.error(f"Error in AI chat: {e}")
            msg = str(e).lower()
            if "validation" in msg or "tool" in msg:
                return "I apologize, but I encountered a technical issue while trying to fetch that information. I've logged the error and our team will look into it."
            return "I'm sorry, I'm having a bit of trouble connecting to my knowledge base. Could you try asking that again in a moment?"
