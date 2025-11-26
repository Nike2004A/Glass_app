import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    In production (Render), variables come from Environment settings.
    In development, variables come from .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env" if os.path.exists(".env") else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Database Configuration
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10

    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Belvo API Configuration
    BELVO_SECRET_ID: str
    BELVO_SECRET_PASSWORD: str
    BELVO_ENVIRONMENT: str = "sandbox"

    # Redis Configuration (optional in production)
    REDIS_URL: Optional[str] = None
    REDIS_PASSWORD: str = ""

    # Celery Configuration (optional in production)
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    # Application Settings
    APP_NAME: str = "Glass Finance API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:19006,http://localhost:8081"

    # Brevo Email Configuration (formerly Sendinblue)
    BREVO_API_KEY: Optional[str] = None
    BREVO_FROM_EMAIL: str = "noreply@glassfinance.com"
    BREVO_FROM_NAME: str = "Glass Finance"

    # Background Tasks
    BANK_SYNC_INTERVAL_HOURS: int = 24
    SUSPICIOUS_CHARGE_THRESHOLD: float = 1000.0
    SUBSCRIPTION_DETECTION_DAYS: int = 90

    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Initialize settings - will read from environment variables
settings = Settings()
