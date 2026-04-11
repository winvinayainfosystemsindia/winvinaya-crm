"""
AI Engine — Phase 1: Foundation
================================

Package index for the WinVinaya AI Engine.

Architecture: MCP-based agentic orchestrator.
  - engine.py       → Main orchestrator (AIEngine class)
  - planner.py      → LLM-based task planner
  - context_loader.py → DB context fetcher before planning
  - task_journal.py → Structured task-step logging
  - tool_registry.py → All available tools registry
  - providers/      → LLM provider adapters (Gemini, OpenAI, Ollama)
  - tools/          → Domain-specific tool implementations
  - exceptions.py   → AI-specific exception hierarchy
"""
