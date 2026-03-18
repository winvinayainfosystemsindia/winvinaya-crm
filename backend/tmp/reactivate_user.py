
import asyncio
import sys
import os
from dotenv import load_dotenv
from sqlalchemy import select, update

# Load .env first
load_dotenv()

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal, engine
from app.models.user import User, UserRole
from app.core.security import get_password_hash

async def reactivate_user(email: str):
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User).where(User.email == email))
            u = result.scalar_one_or_none()
            
            if not u:
                print(f"User {email} not found.")
                return
            
            # Reactivate and restore
            u.is_active = True
            u.is_deleted = False
            u.role = UserRole.ADMIN
            u.hashed_password = get_password_hash("Admin@123") # Default password for testing
            
            await db.commit()
            print(f"User {email} reactivated successfully. Password set to: Admin@123")
            
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
        await db.rollback()
    finally:
        await engine.dispose()

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "Test01@gmail.com"
    asyncio.run(reactivate_user(email))
