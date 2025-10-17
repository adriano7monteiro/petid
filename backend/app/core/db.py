from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings

settings = get_settings()
_client = None
_db = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGO_URI)
    return _client

def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[settings.MONGO_DB]
    return _db