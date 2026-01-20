
import asyncio
import os
import sys

# Add backend to sys.path
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.company import Company
from app.models.crm_task import CRMTask, CRMRelatedToType

async def check_data():
    async with AsyncSessionLocal() as session:
        # Check all tasks
        stmt = select(CRMTask)
        result = await session.execute(stmt)
        tasks = result.scalars().all()
        print(f"Total tasks in database: {len(tasks)}")
        for t in tasks:
            print(f"Task: [ID:{t.id}] {t.title}, Type: {t.task_type}, Related To: {t.related_to_type}, Related ID: {t.related_to_id}")

        # Check companies
        stmt = select(Company)
        result = await session.execute(stmt)
        companies = result.scalars().all()
        print(f"\nTotal companies in database: {len(companies)}")
        for c in companies:
            print(f"Company: [ID:{c.id}] {c.name}")

        # Try the join manually
        print("\nChecking linked tasks via manual select...")
        stmt = select(CRMTask).where(CRMTask.related_to_type == CRMRelatedToType.COMPANY)
        result = await session.execute(stmt)
        tasks_linked = result.scalars().all()
        print(f"Tasks linked to ANY company (via enum): {len(tasks_linked)}")
        
        stmt = select(CRMTask).where(CRMTask.related_to_type == 'company')
        result = await session.execute(stmt)
        tasks_linked_str = result.scalars().all()
        print(f"Tasks linked to ANY company (via string 'company'): {len(tasks_linked_str)}")

if __name__ == "__main__":
    asyncio.run(check_data())
