import asyncio
import os
import sys

# Add the parent directory to sys.path to allow importing from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def fix_database():
    print(f"Connecting to {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        # 1. Find all tables with organization_id
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'organization_id' 
              AND table_schema = 'public'
        """))
        tables = [row[0] for row in result.fetchall()]
        
        for table in tables:
            print(f"Dropping organization_id from {table}...")
            await conn.execute(text(f"ALTER TABLE {table} DROP COLUMN IF EXISTS organization_id CASCADE"))
            
        # 2. Find all tables with org_id (just in case)
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.columns 
            WHERE column_name = 'org_id' 
              AND table_schema = 'public'
        """))
        tables_org_id = [row[0] for row in result.fetchall()]
        
        for table in tables_org_id:
            print(f"Dropping org_id from {table}...")
            await conn.execute(text(f"ALTER TABLE {table} DROP COLUMN IF EXISTS org_id CASCADE"))
            
        # 3. Drop organization tables
        print("Dropping organization tables if they exist...")
        await conn.execute(text("DROP TABLE IF EXISTS organization_memberships CASCADE"))
        await conn.execute(text("DROP TABLE IF EXISTS organizations CASCADE"))
        
        # 4. Update alembic_version to a6706489793f
        print("Updating alembic_version to a6706489793f...")
        await conn.execute(text("UPDATE alembic_version SET version_num = 'a6706489793f'"))
        
    print("Database fixed successfully.")

if __name__ == "__main__":
    asyncio.run(fix_database())
