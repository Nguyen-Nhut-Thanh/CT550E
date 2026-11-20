from pathlib import Path

from pydantic import AliasChoices, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[3]
APP_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    OPENAI_API_KEY: SecretStr = SecretStr("")
    OPENAI_BASE_URL: str = "https://api.x-apikey.com/v1"
    DATABASE_URL: SecretStr = SecretStr("")
    AI_HOST: str = "127.0.0.1"
    AI_PORT: int = 8000
    # Keep the existing internal names for RAG/index compatibility.
    AI_CHAT_MODEL: str = Field(default="gpt-6-luna", validation_alias=AliasChoices("OPENAI_CHAT_MODEL", "AI_CHAT_MODEL"))
    AI_EMBEDDING_MODEL: str = Field(default="text-embedding-3-small", validation_alias=AliasChoices("OPENAI_EMBEDDING_MODEL", "AI_EMBEDDING_MODEL"))
    AI_INDEX_DIR: Path = APP_DIR / "data" / "faiss_index"

    model_config = SettingsConfigDict(env_file=ROOT / ".env", env_file_encoding="utf-8-sig", extra="ignore")


settings = Settings()
