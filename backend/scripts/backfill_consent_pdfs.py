"""
Backfill script to generate missing Consent Form PDFs for existing candidates
who have previously accepted the consent form (consent_status == "Accepted").
"""

import sys
import os
import asyncio

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import AsyncSessionLocal
from app.services.consent_pdf_service import ConsentPDFService


async def run_backfill():
    print("=" * 60)
    print("Starting retroactive Consent PDF Backfill for past candidates...")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        count = await ConsentPDFService.backfill_all_accepted_candidates(db)

    print("=" * 60)
    print(f"Backfill Completed Successfully!")
    print(f"Total Consent PDFs generated and attached: {count}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_backfill())
