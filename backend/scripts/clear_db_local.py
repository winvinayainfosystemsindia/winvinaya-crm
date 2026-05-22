import asyncio
import sys
import os
import argparse
# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Manually load .env file from the backend directory
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path)
print(f"Loaded environment from: {env_path}")

# Set ENV_FILE explicitly for Pydantic
os.environ["ENV_FILE"] = env_path

from app.core.database import AsyncSessionLocal, engine, Base
import app.models  # Registers all models/tables onto Base.metadata

async def clear_database():
    """
    Clears records from all database tables except the users table.
    Deletion order is managed dynamically to respect Foreign Key constraints.
    """
    try:
        async with AsyncSessionLocal() as session:
            print("Clearing all tables except 'users'...")
            
            # Base.metadata.sorted_tables lists tables in topological dependency order.
            # Deleting in reverse order ensures child tables are deleted before their parents.
            for table in reversed(Base.metadata.sorted_tables):
                if table.name == "users":
                    print("Skipping users table")
                    continue
                
                print(f"Clearing table: {table.name}...")
                await session.execute(table.delete())
            
            await session.commit()
            print("\nSuccessfully cleared all tables except the users table.")
    except Exception as e:
        print(f"\nError occurred while clearing database: {e}")
        raise
    finally:
        # Crucial to avoid event loop issues
        print("Disposing database engine...")
        await engine.dispose()

def main():
    parser = argparse.ArgumentParser(description="Clear records from all database tables except the users table.")
    parser.add_argument(
        "--confirm", 
        action="store_true", 
        help="Confirm that you want to delete all records. This action is irreversible."
    )

    args = parser.parse_args()

    if not args.confirm:
        print("WARNING: This script will delete ALL records from almost all database tables.")
        print("EXCEPTED: users table.")
        print("This action is IRREVERSIBLE.")
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ")
        if confirm != "YES":
            print("Operation cancelled.")
            sys.exit(0)

    try:
        asyncio.run(clear_database())
    except Exception:
        sys.exit(1)

if __name__ == "__main__":
    main()
