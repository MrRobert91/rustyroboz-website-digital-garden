import time
from collections import defaultdict, deque
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
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
    session_id: str | None = None


class RateLimiter:
    """Tiny in-memory sliding-window limiter (per IP, per process).
    Enough to keep a public portfolio endpoint from burning API credits."""

    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self.hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.time()
        window = self.hits[key]
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= self.per_minute:
            return False
        window.append(now)
        if len(self.hits) > 10_000:  # bounded memory under address churn
            self.hits.clear()
        return True


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def create_app(settings=None) -> FastAPI:
    settings = settings or get_settings()
    initialize_database(settings.sqlite_path)
    repository = SqliteRepository(settings.sqlite_path)
    knowledge_base = KnowledgeBase(settings=settings, repository=repository)
    chat_service = ChatService(settings=settings, repository=repository, knowledge_base=knowledge_base)

    def build_index() -> None:
        """Load the embedding model and (re)build the FAISS index."""
        try:
            embedder = create_embedder(settings)
        except Exception as exc:  # model download/import failure — degrade, don't die
            print(f"[embeddings] falling back to hashing backend: {exc}")
            embedder = HashingEmbedder(settings.faiss_dimension)
        vector_store = FaissVectorStore(dimension=embedder.dimension, index_path=settings.faiss_index_path)
        knowledge_base.attach(embedder, vector_store)
        knowledge_base.sync()
        print(f"[index] semantic index ready ({embedder.name}/{embedder.model}, {vector_store.size} vectors)")

    # Eager (dev/tests): block until the index exists. Background (production):
    # bind the port immediately so platform healthchecks pass while the
    # embedding model warms up in a thread; the agent can already serve
    # read_document/list_site_content from the eagerly-loaded documents.
    if settings.index_startup_mode != "background":
        build_index()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        import asyncio

        build_task = None
        if settings.index_startup_mode == "background" and not knowledge_base.ready:
            build_task = asyncio.create_task(asyncio.to_thread(build_index))
        app.state.settings = settings
        app.state.knowledge_base = knowledge_base
        app.state.chat_service = chat_service
        yield
        if build_task and not build_task.done():
            build_task.cancel()
        await chat_service.client.aclose()
        if knowledge_base.ready and knowledge_base.vector_store is not None:
            knowledge_base.vector_store.save()

    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        # Platform healthchecks (Sliplane) probe "/" — answer fast and cheap.
        return {"status": "ok", "service": settings.app_name}

    @app.get("/health")
    async def health():
        embedder = knowledge_base.embedder
        return {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.environment,
            "storage": {
                "sqlite": "ready" if settings.sqlite_path.exists() else "missing",
                "faiss": "ready" if knowledge_base.ready else "building",
            },
            "llm": {
                "provider": "openrouter",
                "model": settings.openrouter_model,
                "fallback_models": settings.parsed_openrouter_fallback_models,
                "configured": bool(settings.openrouter_api_key),
            },
            "embeddings": {
                "backend": embedder.name if embedder else settings.embeddings_backend,
                "model": embedder.model if embedder else settings.embedding_model,
                "dimension": embedder.dimension if embedder else None,
            },
            "guardrails": settings.guardrails_enabled,
        }

    limiter = RateLimiter(settings.rate_limit_per_minute)

    def check_request(request: Request, payload: ChatRequest) -> None:
        if not payload.message.strip():
            raise HTTPException(status_code=400, detail="Message is empty.")
        if len(payload.message) > settings.max_message_chars:
            raise HTTPException(
                status_code=400,
                detail=f"Message too long (max {settings.max_message_chars} characters).",
            )
        if not limiter.allow(client_ip(request)):
            raise HTTPException(status_code=429, detail="Too many requests — try again in a minute.")

    @app.post("/api/v1/chat")
    async def chat(payload: ChatRequest, request: Request):
        check_request(request, payload)
        try:
            return await chat_service.ask(payload.message, payload.session_id)
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @app.post("/api/v1/chat/stream")
    async def chat_stream(payload: ChatRequest, request: Request):
        check_request(request, payload)
        return StreamingResponse(chat_service.stream(payload.message, payload.session_id), media_type="text/event-stream")

    return app


app = create_app()
