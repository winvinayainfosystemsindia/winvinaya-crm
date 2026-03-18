
import asyncio
import sys
import os
from dotenv import load_dotenv

# Load .env first
load_dotenv()

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine
from app.models.user import User

async def check_users():
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User))
            users = result.scalars().all()
            if not users:
                print("No users found in database.")
                return
            
            print(f"Found {len(users)} users:")
            for u in users:
                print(f"ID: {u.id} | Email: {u.email} | Active: {u.is_active} | Deleted: {u.is_deleted} | Role: {u.role.value if hasattr(u.role, 'value') else u.role}")
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_users())
