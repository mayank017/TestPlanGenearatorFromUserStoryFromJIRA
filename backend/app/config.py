from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    jira_base_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""
    groq_api_key: str = ""
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    log_level: str = "INFO"
    groq_model: str = "openai/gpt-oss-120b"
    request_timeout: int = 30

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()