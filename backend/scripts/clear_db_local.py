import asyncio
import sys
import os
import argparse
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal, engine
from app.models.user import User
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
from app.models.activity_log import ActivityLog

async def clear_database(include_users: bool = False):
    """
    Clears records from the database tables in the correct order to respect FK constraints.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Order of deletion matters because of foreign keys
            # 1. Activity Logs (Refers to Users)
            # 2. Candidate Documents (Refers to Candidates)
            # 3. Candidate Counseling (Refers to Candidates and Users)
            # 4. Candidate Profiles (Refers to Candidates)
            # 5. Candidates
            # 6. Users (Optional)

            print("Clearing Activity Logs...")
            await session.execute(delete(ActivityLog))
            
            print("Clearing Candidate Documents...")
            await session.execute(delete(CandidateDocument))
            
            print("Clearing Candidate Counseling...")
            await session.execute(delete(CandidateCounseling))
            
            print("Clearing Candidate Screenings...")
            await session.execute(delete(CandidateScreening))
            
            print("Clearing Candidates...")
            await session.execute(delete(Candidate))
            
            if include_users:
                print("Clearing Users (excluding superusers)...")
                # We usually want to keep superusers to avoid locking ourselves out
                await session.execute(delete(User).where(User.is_superuser == False))
            
            await session.commit()
            print("\nSuccessfully cleared the specified tables.")
            
        except Exception as e:
            await session.rollback()
            print(f"\nError occurred while clearing database: {e}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Clear records from database tables.")
    parser.add_argument(
        "--confirm", 
        action="store_true", 
        help="Confirm that you want to delete all records. This action is irreversible."
    )
    # parser.add_argument(
    #     "--include-users", 
    #     action="store_true", 
    #     help="Also clear the users table (excluding superusers)."
    # )

    args = parser.parse_args()

    if not args.confirm:
        print("WARNING: This script will delete ALL records from the candidate-related tables.")
        print("This action is IRREVERSIBLE.")
        confirm = input("Are you sure you want to proceed? Type 'YES' to confirm: ")
        if confirm != "YES":
            print("Operation cancelled.")
            sys.exit(0)

    asyncio.run(clear_database())

if __name__ == "__main__":
    main()
