import asyncio
import sys
import os
import argparse
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from dotenv import load_dotenv

# Load environment variables from .env file
# This must happen before importing app modules that use Pydantic Settings
load_dotenv()

# Fix for Windows asyncio issue
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models
from app.models.user import User
from app.models.candidate import Candidate
from app.models.candidate_profile import CandidateProfile
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
from app.models.activity_log import ActivityLog

async def clear_database(engine_to_use, include_users: bool = False):
    """
    Clears records from the database tables in the correct order to respect FK constraints.
    """
    SessionLocal = async_sessionmaker(engine_to_use, expire_on_commit=False)
    
    async with SessionLocal() as session:
        try:
            # Order of deletion matters because of foreign keys
            print("Clearing Activity Logs...")
            await session.execute(delete(ActivityLog))
            
            print("Clearing Candidate Documents...")
            await session.execute(delete(CandidateDocument))
            
            print("Clearing Candidate Counseling...")
            await session.execute(delete(CandidateCounseling))
            
            print("Clearing Candidate Profiles...")
            await session.execute(delete(CandidateProfile))
            
            print("Clearing Candidates...")
            await session.execute(delete(Candidate))
            
            if include_users:
                print("Clearing Users (excluding superusers)...")
                await session.execute(delete(User).where(User.is_superuser == False))
            
            await session.commit()
            print("\nSuccessfully cleared the specified tables.")
            
        except Exception as e:
            await session.rollback()
            print(f"\nError occurred while clearing database: {e}")
            sys.exit(1)
        finally:
            # Dispose the engine to close all connections
            await engine_to_use.dispose()

def main():
    parser = argparse.ArgumentParser(description="Clear records from database tables.")
    parser.add_argument("--host", help="Database host (overrides .env.dev)")
    parser.add_argument("--port", help="Database port (overrides .env.dev)")
    parser.add_argument("--user", help="Database user (overrides .env.dev)")
    parser.add_argument("--password", help="Database password (overrides .env.dev)")
    parser.add_argument("--dbname", help="Database name (overrides .env.dev)")
    parser.add_argument(
        "--confirm", 
        action="store_true", 
        help="Confirm that you want to delete all records. This action is irreversible."
    )
    parser.add_argument(
        "--include-users", 
        action="store_true", 
        help="Also clear the users table (excluding superusers)."
    )

    args = parser.parse_args()

    # Determine which engine to use
    use_custom_engine = any([args.host, args.user, args.password, args.dbname])
    
    if use_custom_engine:
        # Construct custom URL if any override is provided
        # Use existing .env values as defaults if some fields are missing
        host = args.host or os.getenv("POSTGRES_SERVER", "localhost")
        port = args.port or os.getenv("POSTGRES_PORT", "5432")
        user = args.user or os.getenv("POSTGRES_USER", "postgres")
        password = args.password or os.getenv("POSTGRES_PASSWORD", "")
        dbname = args.dbname or os.getenv("POSTGRES_DB", "fastapi_db")
        
        database_url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{dbname}"
        print(f"Connecting to SPECIFIED database: {dbname} on {host}...")
        engine = create_async_engine(database_url, echo=False)
    else:
        # Use default engine from app.core.database if no manual overrides
        # We try to import it inside main to avoid the ValidationError during module load if .env is missing
        try:
            from app.core.database import engine as default_engine
            engine = default_engine
            print(f"Connecting to database using credentials from .env...")
        except Exception as e:
            print(f"Error: Could not load database configuration from .env: {e}")
            print("Please ensure your .env file is present or provide credentials via arguments.")
            print("Run with --help to see all options.")
            sys.exit(1)

    if not args.confirm:
        print("WARNING: This script will delete ALL records from the candidate-related tables.")
        print("This action is IRREVERSIBLE.")
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ")
        if confirm.strip().upper() != "YES":
            print("Operation cancelled.")
            sys.exit(0)

    try:
        asyncio.run(clear_database(engine, include_users=args.include_users))
    except KeyboardInterrupt:
        print("\nOperation interrupted by user.")
    except Exception as e:
        print(f"\nFailed to run script: {e}")

if __name__ == "__main__":
    main()
