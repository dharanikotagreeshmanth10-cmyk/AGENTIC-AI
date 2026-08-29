from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoGenius AI Sustainability Command Center"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./ecogenius.db"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://agentic-ai-2-g2zu.onrender.com"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-pro"
    DEMO_MODE: bool = True

    # MongoDB Atlas
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "ecogenius"

    # Security
    SECRET_KEY: str = "change_this_to_a_long_random_secret_key"

    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS_ORIGINS as a list."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        case_sensitive = True
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
