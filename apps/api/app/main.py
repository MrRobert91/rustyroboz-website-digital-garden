from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .config import get_settings
from .chat_service import ChatService
from .db import SqliteRepository, initialize_database
from .embeddings import HashingEmbedder, create_embedder
from .knowledge_base import KnowledgeBase
from .vector_index import FaissVectorStore


class ChatRequest(BaseModel):
    message: str
    session_id: int | None = None


def create_app(settings=None) -> FastAPI:
    settings = settings or get_settings()
    initialize_database(settings.sqlite_path)
    repository = SqliteRepository(settings.sqlite_path)
    try:
        embedder = create_embedder(settings)
    except Exception as exc:  # model download/import failure — degrade, don't die
        print(f"[embeddings] falling back to hashing backend: {exc}")
        embedder = HashingEmbedder(settings.faiss_dimension)
    vector_store = FaissVectorStore(dimension=embedder.dimension, index_path=settings.faiss_index_path)
    knowledge_base = KnowledgeBase(
        settings=settings, repository=repository, vector_store=vector_store, embedder=embedder
    )
    knowledge_base.sync()
    chat_service = ChatService(settings=settings, repository=repository, knowledge_base=knowledge_base)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.settings = settings
        app.state.vector_store = vector_store
        app.state.knowledge_base = knowledge_base
        app.state.chat_service = chat_service
        yield
        app.state.vector_store.save()

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.environment,
            "storage": {
                "sqlite": "ready" if settings.sqlite_path.exists() else "missing",
                "faiss": "ready",
            },
            "llm": {
                "provider": "openrouter",
                "model": settings.openrouter_model,
                "fallback_models": settings.parsed_openrouter_fallback_models,
                "configured": bool(settings.openrouter_api_key),
            },
            "embeddings": {
                "backend": embedder.name,
                "model": embedder.model,
                "dimension": embedder.dimension,
            },
            "guardrails": settings.guardrails_enabled,
        }

    @app.post("/api/v1/chat")
    async def chat(payload: ChatRequest):
        try:
            return await chat_service.ask(payload.message, payload.session_id)
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @app.post("/api/v1/chat/stream")
    async def chat_stream(payload: ChatRequest):
        return StreamingResponse(chat_service.stream(payload.message, payload.session_id), media_type="text/event-stream")

    return app


app = create_app()
