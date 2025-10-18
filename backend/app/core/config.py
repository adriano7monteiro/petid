from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB: str = "petid_db"
    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24*30
    UPLOAD_DIR: str = "./app/uploads"
    ALLOWED_ORIGINS: str = ""  # comma-separated
    OPENAI_API_KEY: str = ""  # OpenAI API Key

    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()