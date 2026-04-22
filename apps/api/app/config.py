from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="rustyroboz-api", alias="APP_NAME")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    sqlite_path: Path = Field(default=Path("./data/site.db"), alias="SQLITE_PATH")
    faiss_index_path: Path = Field(default=Path("./data/faiss.index"), alias="FAISS_INDEX_PATH")
    faiss_dimension: int = Field(default=1536, alias="FAISS_DIMENSION")
    cors_origins: str = Field(default="http://localhost:3000,http://web:3000", alias="CORS_ORIGINS")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

