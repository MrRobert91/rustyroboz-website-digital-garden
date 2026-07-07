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
    faiss_dimension: int = Field(default=384, alias="FAISS_DIMENSION")
    cors_origins: str = Field(default="http://localhost:3000,http://web:3000", alias="CORS_ORIGINS")
    content_root: Path = Field(default=Path("./content"), alias="CONTENT_ROOT")

    # Embeddings for the FAISS index.
    #   "api"       — remote OpenAI-compatible /embeddings endpoint (OpenRouter by
    #                 default): ~0 extra RAM, recommended on small servers.
    #   "fastembed" — local ONNX semantic model (multilingual, CPU): no network,
    #                 but keeps ~600MB resident.
    #   "hash"      — dependency-free lexical fallback (tests/offline).
    embeddings_backend: str = Field(default="fastembed", alias="EMBEDDINGS_BACKEND")
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        alias="EMBEDDING_MODEL",
    )
    # Settings for the "api" backend. Key/base URL fall back to the OpenRouter ones.
    embeddings_api_model: str = Field(default="openai/text-embedding-3-small", alias="EMBEDDINGS_API_MODEL")
    embeddings_api_base_url: str = Field(default="", alias="EMBEDDINGS_API_BASE_URL")
    embeddings_api_key: str = Field(default="", alias="EMBEDDINGS_API_KEY")

    # LLM provider — any OpenAI-compatible endpoint (OpenRouter by default).
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL")
    openrouter_model: str = Field(default="google/gemma-3-27b-it:free", alias="OPENROUTER_MODEL")
    openrouter_fallback_models: str = Field(
        default="meta-llama/llama-3.3-70b-instruct:free", alias="OPENROUTER_FALLBACK_MODELS"
    )
    openrouter_site_url: str = Field(default="", alias="OPENROUTER_SITE_URL")
    openrouter_site_name: str = Field(default="rustyroboz", alias="OPENROUTER_SITE_NAME")
    llm_timeout_seconds: float = Field(default=60.0, alias="LLM_TIMEOUT_SECONDS")

    # "eager" builds the FAISS index before serving (dev/tests); "background"
    # binds the port immediately and indexes in a thread (production — keeps
    # platform healthchecks happy while the embedding model warms up).
    index_startup_mode: str = Field(default="eager", alias="INDEX_STARTUP_MODE")

    # Agent + guardrails
    guardrails_enabled: bool = Field(default=True, alias="GUARDRAILS_ENABLED")
    agent_max_tool_rounds: int = Field(default=4, alias="AGENT_MAX_TOOL_ROUNDS")
    chat_history_limit: int = Field(default=12, alias="CHAT_HISTORY_LIMIT")

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
    def embeddings_api_url(self) -> str:
        base = self.embeddings_api_base_url.strip() or self.openrouter_base_url
        return f"{base.rstrip('/')}/embeddings"

    @property
    def resolved_embeddings_api_key(self) -> str:
        return self.embeddings_api_key.strip() or self.openrouter_api_key

    @property
    def parsed_openrouter_fallback_models(self) -> list[str]:
        return [model.strip() for model in self.openrouter_fallback_models.split(",") if model.strip()]

    @property
    def model_candidates(self) -> list[str]:
        """Primary model first, then de-duplicated fallbacks."""
        candidates = [self.openrouter_model]
        for model in self.parsed_openrouter_fallback_models:
            if model not in candidates:
                candidates.append(model)
        return candidates


@lru_cache
def get_settings() -> Settings:
    return Settings()
