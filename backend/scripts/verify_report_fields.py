import asyncio
import sys
import os

# Ensure we can import app
sys.path.append(os.getcwd())

from app.core.database import AsyncSessionLocal
from app.services.training_candidate_allocation_service import TrainingCandidateAllocationService
from app.schemas.training_candidate_allocation import TrainingCandidateAllocationResponse

async def main():
    print("=== START ALLOCATION FIELD VERIFICATION ===")
    async with AsyncSessionLocal() as session:
        service = TrainingCandidateAllocationService(session)
        print("Fetching allocations via get_multi...")
        allocations, total = await service.get_multi(limit=5)
        print(f"Total allocations fetched: {len(allocations)} (Total in DB: {total})")
        
        for idx, alloc in enumerate(allocations, 1):
            print(f"\n--- Allocation {idx} ---")
            print(f"ID: {alloc.id}")
            print(f"Candidate Name: {alloc.candidate.name if alloc.candidate else 'N/A'}")
            print(f"Candidate City (Location): {alloc.candidate.city if alloc.candidate else 'N/A'}")
            print(f"Batch Name: {alloc.batch.batch_name if alloc.batch else 'N/A'}")
            
            # Check batch tags (stored in other.tag)
            batch_tag = (alloc.batch.other or {}).get("tag") if alloc.batch else None
            print(f"Batch Tag: {batch_tag}")
            
            # Placement Details
            print(f"Placed Company: {getattr(alloc, 'placed_company', 'N/A')}")
            print(f"Placed Date: {getattr(alloc, 'placed_date', 'N/A')}")
            
            # Verify serialization
            try:
                serialized = TrainingCandidateAllocationResponse.model_validate(alloc)
                print(f"Serialization Check: SUCCESS")
                print(f"Serialized City: {serialized.candidate.city if serialized.candidate else 'N/A'}")
                print(f"Serialized Placed Company: {serialized.placed_company}")
                print(f"Serialized Placed Date: {serialized.placed_date}")
            except Exception as e:
                print(f"Serialization Check: FAILED with error: {e}")
                
    print("\n=== END ALLOCATION FIELD VERIFICATION ===")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
