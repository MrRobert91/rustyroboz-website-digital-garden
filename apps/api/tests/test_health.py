from pathlib import Path
from uuid import uuid4

from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.main import app, create_app


async def test_health_endpoint_reports_ready_storage():
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["storage"]["sqlite"] == "ready"
    assert response.json()["storage"]["faiss"] == "ready"


async def test_root_route_answers_platform_healthchecks():
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


async def test_background_startup_serves_before_index_is_built():
    root = Path(__file__).resolve().parents[3]
    temp_dir = root / ".tmp" / f"bg-start-{uuid4().hex}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    settings = Settings(
        SQLITE_PATH=temp_dir / "site.db",
        FAISS_INDEX_PATH=temp_dir / "faiss.index",
        FAISS_META_PATH=temp_dir / "meta.json",
        CONTENT_ROOT=root / "content",
        EMBEDDINGS_BACKEND="hash",
        FAISS_DIMENSION=256,
        INDEX_STARTUP_MODE="background",
    )
    # create_app must return without building the index (the port would be
    # bound at this point in production, keeping healthchecks green)
    background_app = create_app(settings)
    transport = ASGITransport(app=background_app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        root_response = await client.get("/")
        health_response = await client.get("/health")

    assert root_response.status_code == 200
    # ASGITransport does not run the lifespan, so the index stays "building"
    assert health_response.json()["storage"]["faiss"] == "building"

