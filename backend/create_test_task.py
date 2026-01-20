
import asyncio
import os
import sys

# Add backend to sys.path
sys.path.append(os.getcwd())

from datetime import datetime
from app.core.database import AsyncSessionLocal
from app.models.company import Company
from app.models.crm_task import CRMTask, CRMRelatedToType, CRMTaskType, CRMTaskPriority, CRMTaskStatus

async def create_test_task():
    async with AsyncSessionLocal() as session:
        # Get company with ID 1
        stmt = select(Company).where(Company.id == 1)
        res = await session.execute(stmt)
        company = res.scalars().first()
        
        if not company:
            print("Company 1 not found")
            return

        # Create a task linked to company 1
        new_task = CRMTask(
            title="Test Company Task",
            task_type=CRMTaskType.CALL,
            priority=CRMTaskPriority.HIGH,
            status=CRMTaskStatus.PENDING,
            assigned_to=1, # Assume user 1 exists
            created_by=1,
            related_to_type=CRMRelatedToType.COMPANY,
            related_to_id=company.id,
            due_date=datetime.utcnow()
        )
        session.add(new_task)
        await session.commit()
        print(f"Created task for company {company.name}")

if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(create_test_task())
