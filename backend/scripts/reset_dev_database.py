"""
WinVinaya CRM - Dev Environment Database Reset Script
Location: backend/scripts/reset_dev_database.py

Safely truncates all transactional records across all modules in the development environment
while preserving system users, core system settings, and master skills.
"""

import asyncio
import sys
import os

# Ensure Windows async event loop compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Setup paths and environment
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(BACKEND_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Dev Database Connection URL
DB_URL = os.getenv(
    "DEV_DATABASE_URL",
    "postgresql+asyncpg://winvinaya_user:winvinaya12345@65.2.67.195:5432/winvinaya_dev?ssl=disable"
)

# Tables to clear in dependency order (CASCADE handles relations cleanly)
TABLES_TO_CLEAR = [
    # Placement Module
    "placement_pipeline_history",
    "placement_notes",
    "placement_offers",
    "placement_interviews",
    "placement_mappings",
    "job_roles",

    # Training Module
    "training_mock_interviews",
    "training_candidate_analysis",
    "training_batch_plans",
    "training_batch_events",
    "training_assignments",
    "training_attendance",
    "training_candidate_allocations",
    "training_batch_extensions",
    "training_batches",

    # Candidate Module
    "candidate_counseling",
    "candidate_screenings",
    "candidate_documents",
    "candidate_assignments",
    "candidates",

    # CRM Module
    "crm_activity_logs",
    "crm_tasks",
    "deals",
    "leads",
    "contacts",
    "companies",

    # DSR / Daily Timesheet Module
    "dsr_entries",
    "dsr_leave_applications",
    "dsr_permission_requests",
    "dsr_project_requests",
    "dsr_activity_assignments",
    "dsr_activities",
    "dsr_activity_types",
    "dsr_projects",
    "company_holidays",

    # Support Tickets & Communication Logs
    "ticket_messages",
    "tickets",
    "notifications",
    "activity_logs",
    "ai_chat_messages",
    "ai_chat_sessions",
    "ai_task_logs",
]


async def reset_dev_database():
    print("=" * 70)
    print("WINVINAYA CRM - DEV ENVIRONMENT DATABASE RESET")
    print("=" * 70)
    print(f"Connecting to database...")

    engine = create_async_engine(DB_URL, connect_args={"ssl": False})

    async with engine.begin() as conn:
        # Check available tables in public schema
        result = await conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
        )
        existing_tables = set(r[0] for r in result.fetchall())
        print(f"Discovered {len(existing_tables)} tables in database.")

        cleared_count = 0
        for table in TABLES_TO_CLEAR:
            if table in existing_tables:
                print(f"  [CLEARING] Table: {table} ...")
                await conn.execute(
                    text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;")
                )
                cleared_count += 1
            else:
                print(f"  [SKIPPED] Table does not exist: {table}")

        # Verify preserved tables
        user_cnt = (await conn.execute(text("SELECT COUNT(*) FROM users;"))).scalar()
        settings_cnt = (await conn.execute(text("SELECT COUNT(*) FROM system_settings;"))).scalar()
        skills_cnt = (await conn.execute(text("SELECT COUNT(*) FROM skills;"))).scalar()

        print("-" * 70)
        print(f"Cleared {cleared_count} transactional tables.")
        print("Preserved Master / Configuration Tables:")
        print(f"  - users: {user_cnt} accounts intact")
        print(f"  - system_settings: {settings_cnt} rows intact")
        print(f"  - skills: {skills_cnt} master skills intact")
        print("-" * 70)
        print("RESET COMPLETE: Dev database is now completely clean!")
        print("=" * 70)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(reset_dev_database())

