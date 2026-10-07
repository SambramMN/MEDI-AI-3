"""
MedSafe AI — Application Configuration
Loads all settings from environment variables / .env file.
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application ---
    app_name: str = "MedSafe AI"
    app_env: str = "development"
    debug: bool = False
    secret_key: str = "change-me"

    # --- Database ---
    database_url: str = "postgresql://medsafe_user:medsafe_password@localhost:5432/medsafe_db"
    test_database_url: str = "postgresql://medsafe_user:medsafe_password@localhost:5432/medsafe_test_db"

    # --- JWT ---
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # --- LLM ---
    llm_provider: str = "openai"
    llm_api_key: Optional[str] = None
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.2
    llm_max_tokens: int = 2048

    # --- Vector DB ---
    chroma_persist_directory: str = "./data/chroma"
    chroma_collection_name: str = "medsafe_knowledge"

    # --- OCR ---
    tesseract_cmd: Optional[str] = None
    ocr_language: str = "eng"
    max_upload_size_mb: int = 10

    # --- External APIs ---
    openfda_api_base: str = "https://api.fda.gov/drug"
    openfda_api_key: Optional[str] = None
    rxnorm_api_base: str = "https://rxnav.nlm.nih.gov/REST"

    # --- CORS ---
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # --- Rate Limiting ---
    rate_limit_per_minute: int = 60
    auth_rate_limit_per_minute: int = 10

    # --- Redis ---
    redis_url: Optional[str] = "redis://localhost:6379/0"

    # --- Logging ---
    log_level: str = "INFO"
    log_format: str = "json"

    # --- File Storage ---
    upload_dir: str = "./data/uploads"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: str) -> str:
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()
