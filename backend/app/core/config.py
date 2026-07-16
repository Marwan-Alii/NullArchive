from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application configuration, sourced from environment variables.

    See .env.example for the full list of variables and their defaults.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+pg8000://nullarchive:nullarchive@localhost:5432/nullarchive"

    # Auth
    secret_key: str = "dev-secret-change-me"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"

    # Storage abstraction (see app/core/storage.py)
    storage_backend: str = "local"  # "local" | "supabase"
    storage_local_path: str = "./uploads"
    supabase_url: str | None = None
    supabase_service_key: str | None = None
    supabase_bucket: str = "nullarchive-attachments"

    # CORS
    frontend_origin: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()
