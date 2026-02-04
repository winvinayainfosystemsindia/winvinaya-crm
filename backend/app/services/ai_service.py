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
        "You are an internal CRM Assistant with access to real-time database tools. "
        "Strictly follow these rules: "
        "1. You are friendly and can respond to greetings, thank yous, and general conversation. "
        "2. For any information about candidates, users, deals, leads, or stats, you MUST use your tools. "
        "3. NEVER hallucinate or make up data. If tool results are empty, say so. "
        "4. If you don't have a tool for a specific data request, say 'I don't have access to that information.' "
        "5. Be concise and data-driven for all business queries."
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
        return [{"full_name": u.full_name, "username": u.username, "role": u.role, "email": u.email} for u in users]

    # --- Chat Implementation ---

    async def chat(self, message: str, history: List[Dict[str, str]] = []) -> str:
        """Send a message to the AI and get a response"""
        if not self.enabled:
            return "AI feature is currently disabled."

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
                            "parameters": {
                                "type": "object",
                                "properties": {},
                                "required": []
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "search_candidates",
                            "description": "Search for candidates by name, email, or city",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "query": {"type": "string", "description": "Search term"}
                                },
                                "required": ["query"]
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
                                "properties": {
                                    "name": {"type": "string", "description": "Company name"}
                                },
                                "required": ["name"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "get_deal_stats",
                            "description": "Get CRM deal statistics",
                            "parameters": {
                                "type": "object",
                                "properties": {},
                                "required": []
                            }
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
                        "get_company_info": self.get_company_info,
                        "get_deal_stats": self.get_deal_stats,
                        "search_users": self.search_users
                    }

                    for tool_call in tool_calls:
                        function_name = tool_call.function.name
                        function_to_call = available_tools.get(function_name)
                        
                        # Fix: Ensure function_args is always a dict, even if arguments is null or empty
                        try:
                            function_args = json.loads(tool_call.function.arguments) or {}
                        except (json.JSONDecodeError, TypeError):
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
                    return final_response.choices[0].message.content or "No response received."
                
                return response_message.content or "No response received."
            
            return "AI client not initialized correctly."
        except Exception as e:
            logger.error(f"Error in AI chat: {e}")
            return f"Sorry, I encountered an error: {str(e)}"
