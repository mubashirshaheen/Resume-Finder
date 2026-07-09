from functools import cached_property

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://resume_agent:resume_agent@postgres:5432/resume_agent"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    apify_token: str | None = None
    apify_actor_id: str = "bebity~linkedin-jobs-scraper"
    ollama_base_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.2:1b"
    upload_dir: str = "uploads"
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = Field(default="http://localhost:5173,http://localhost:3000")
    internal_fetch_token: str | None = None
    max_upload_mb: int = 8

    @cached_property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
