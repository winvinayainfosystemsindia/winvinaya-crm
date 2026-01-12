import asyncio
import sys
import os
import argparse
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Manually load .env file from the backend directory
from dotenv import load_dotenv
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(env_path)
print(f"Loaded environment from: {env_path}")

from app.core.database import AsyncSessionLocal, engine
from app.models.user import User
from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_document import CandidateDocument
from app.models.candidate_counseling import CandidateCounseling
from app.models.activity_log import ActivityLog
# New models
from app.models.training_attendance import TrainingAttendance
from app.models.training_assessment import TrainingAssessment
from app.models.training_mock_interview import TrainingMockInterview
from app.models.training_batch_event import TrainingBatchEvent
from app.models.training_candidate_allocation import TrainingCandidateAllocation
from app.models.training_batch import TrainingBatch
from app.models.training_batch_extension import TrainingBatchExtension
from app.models.ticket import Ticket, TicketMessage

async def clear_database(include_users: bool = False):
    """
    Clears records from the database tables in the correct order to respect FK constraints.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Order of deletion matters because of foreign keys
            
            # 1. Ticket System (Refers to Users)
            print("Clearing Ticket Messages & Tickets...")
            await session.execute(delete(TicketMessage))
            await session.execute(delete(Ticket))

            # 2. Training Extensions (Refers to Batches & Candidates)
            print("Clearing Training Extensions (Attendance, Assessments, Interviews, Events)...")
            await session.execute(delete(TrainingAttendance))
            await session.execute(delete(TrainingAssessment))
            await session.execute(delete(TrainingMockInterview))
            await session.execute(delete(TrainingBatchEvent))
            await session.execute(delete(TrainingBatchExtension))

            # 3. Allocations (Refers to Batches & Candidates)
            print("Clearing Candidate Allocations...")
            await session.execute(delete(TrainingCandidateAllocation))

            # 4. Batches (Refers to nothing/Users)
            print("Clearing Training Batches...")
            await session.execute(delete(TrainingBatch))

            # 5. Activity Logs (Refers to Users)
            print("Clearing Activity Logs...")
            await session.execute(delete(ActivityLog))
            
            # 6. Candidate Data (Refers to Candidates)
            print("Clearing Candidate Documents...")
            await session.execute(delete(CandidateDocument))
            
            print("Clearing Candidate Counseling...")
            await session.execute(delete(CandidateCounseling))
            
            print("Clearing Candidate Screenings...")
            await session.execute(delete(CandidateScreening))
            
            # 7. Candidates
            print("Clearing Candidates...")
            await session.execute(delete(Candidate))
            
            # 8. Users (Optional)
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
