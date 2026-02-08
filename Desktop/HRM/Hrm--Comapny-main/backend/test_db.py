import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

async def test_conn():
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        # Force server selection / connection
        db = client[DATABASE_NAME]
        cols = await db.list_collection_names()
        print("OK: collections:", cols)
    except Exception as e:
        print("ERROR:", repr(e))

if __name__ == '__main__':
    asyncio.run(test_conn())
