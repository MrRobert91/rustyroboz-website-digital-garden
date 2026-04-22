from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import initialize_database
from .vector_index import FaissVectorStore

settings = get_settings()
initialize_database(settings.sqlite_path)
vector_store = FaissVectorStore(dimension=settings.faiss_dimension, index_path=settings.faiss_index_path)
vector_store.load()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.settings = settings
    app.state.vector_store = vector_store
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
    }

