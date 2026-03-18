
import asyncio
import sys
import os
from dotenv import load_dotenv

# Load .env first
load_dotenv()

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from sqlalchemy import select, text
from app.core.database import AsyncSessionLocal, engine
from app.models.company_holiday import CompanyHoliday

async def verify_schema():
    try:
        async with AsyncSessionLocal() as db:
            # Check if table exists by querying it
            result = await db.execute(select(CompanyHoliday).limit(1))
            print("Successfully queried 'company_holidays' table.")
    except Exception as e:
        print(f"Error querying table: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_schema())
