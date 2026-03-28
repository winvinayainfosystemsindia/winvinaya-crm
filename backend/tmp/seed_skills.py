import asyncio
import sys
import os

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.skill import Skill
from sqlalchemy import select

COMMON_SKILLS = [
	'Java', 'Python', 'JavaScript', 'React', 'Angular', 'Node.js', 'SQL', 'NoSQL',
	'C++', 'C#', '.NET', 'HTML/CSS', 'AWS', 'Azure', 'GCP', 'Data Analytics',
	'Soft Skills', 'Communication', 'Customer Support', 'BPO', 'Accounting',
	'Tally', 'Excel', 'Data Entry', 'Project Management', 'Agile', 'Salesforce'
]

async def seed_skills():
    engine = create_async_engine(settings.DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as db:
        for skill_name in COMMON_SKILLS:
            # Check if skill already exists
            stmt = select(Skill).where(Skill.name == skill_name)
            result = await db.execute(stmt)
            if not result.scalars().first():
                new_skill = Skill(name=skill_name, is_verified=True)
                db.add(new_skill)
                print(f"Adding skill: {skill_name}")
        
        await db.commit()
    
    await engine.dispose()
    print("Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_skills())
