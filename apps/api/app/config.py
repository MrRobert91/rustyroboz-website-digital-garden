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
    faiss_meta_path: Path = Field(default=Path("./data/index_meta.json"), alias="FAISS_META_PATH")
    faiss_dimension: int = Field(default=1536, alias="FAISS_DIMENSION")
    cors_origins: str = Field(default="http://localhost:3000,http://web:3000", alias="CORS_ORIGINS")
    content_root: Path = Field(default=Path("./content"), alias="CONTENT_ROOT")
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL")
    openrouter_model: str = Field(default="google/gemma-4-31b-it:free", alias="OPENROUTER_MODEL")
    openrouter_fallback_models: str = Field(default="openrouter/free", alias="OPENROUTER_FALLBACK_MODELS")
    openrouter_site_url: str = Field(default="", alias="OPENROUTER_SITE_URL")
    openrouter_site_name: str = Field(default="rustyroboz", alias="OPENROUTER_SITE_NAME")

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def resolved_content_root(self) -> Path:
        return self.content_root.resolve()

    @property
    def openrouter_chat_url(self) -> str:
        return f"{self.openrouter_base_url.rstrip('/')}/chat/completions"

    @property
    def parsed_openrouter_fallback_models(self) -> list[str]:
        return [model.strip() for model in self.openrouter_fallback_models.split(",") if model.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
