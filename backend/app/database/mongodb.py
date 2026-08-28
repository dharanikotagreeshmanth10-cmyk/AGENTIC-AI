"""
MongoDB Atlas connection module using Motor (async driver).
Provides a singleton client and database accessor used across the app.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# ── Async client (used by FastAPI async routes) ───────────────
_async_client: AsyncIOMotorClient | None = None
_sync_client: MongoClient | None = None


def get_async_client() -> AsyncIOMotorClient:
    global _async_client
    if _async_client is None:
        raise RuntimeError("MongoDB async client not initialized. Call connect_mongodb() first.")
    return _async_client


def get_database():
    """Return the async MongoDB database instance."""
    return get_async_client()[settings.MONGODB_DB_NAME]


def get_collection(collection_name: str):
    """Return a specific async collection."""
    return get_database()[collection_name]


async def connect_mongodb():
    """Connect to MongoDB Atlas and verify the connection."""
    global _async_client, _sync_client

    if not settings.MONGODB_URI:
        logger.warning("MONGODB_URI not set — MongoDB connection skipped.")
        return

    try:
        logger.info("Connecting to MongoDB Atlas...")
        _async_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )
        # Verify connection with a ping
        await _async_client.admin.command("ping")
        logger.info(f"✅ MongoDB Atlas connected — database: '{settings.MONGODB_DB_NAME}'")

        # Also create sync client for any sync operations
        _sync_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)

        # Create indexes on startup
        await _create_indexes()

    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"❌ MongoDB connection FAILED: {e}")
        _async_client = None
        _sync_client = None
    except Exception as e:
        logger.error(f"❌ Unexpected MongoDB error: {e}")
        _async_client = None


async def disconnect_mongodb():
    """Gracefully close MongoDB connections."""
    global _async_client, _sync_client
    if _async_client:
        _async_client.close()
        _async_client = None
        logger.info("MongoDB connection closed.")
    if _sync_client:
        _sync_client.close()
        _sync_client = None


async def _create_indexes():
    """Create indexes for performance on startup."""
    try:
        db = get_database()

        # Users collection indexes
        await db["users"].create_index("unique_id", unique=True)
        await db["users"].create_index("email", unique=True)

        # Telemetry indexes
        await db["telemetry"].create_index([("facility_id", 1), ("timestamp", -1)])

        # Agent events indexes
        await db["agent_events"].create_index([("agent_id", 1), ("timestamp", -1)])
        await db["agent_events"].create_index("task_id")

        # Anomalies
        await db["anomalies"].create_index([("facility_id", 1), ("detected_at", -1)])
        await db["anomalies"].create_index("status")

        # Recommendations
        await db["recommendations"].create_index("status")

        # Agent results
        await db["agent_results"].create_index([("agent_id", 1), ("timestamp", -1)])

        logger.info("✅ MongoDB indexes created.")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


def is_connected() -> bool:
    """Check if MongoDB is connected."""
    return _async_client is not None
