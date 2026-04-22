from pathlib import Path

from httpx import ASGITransport, AsyncClient

from app.config import Settings
from app.main import create_app


def build_test_app() -> tuple:
    root = Path(__file__).resolve().parents[3]
    temp_dir = root / ".tmp" / "phase2-tests"
    temp_dir.mkdir(parents=True, exist_ok=True)

    settings = Settings(
        APP_NAME="rustyroboz-api-test",
        SQLITE_PATH=temp_dir / "chat-test.db",
        FAISS_INDEX_PATH=temp_dir / "chat-test.index",
        FAISS_META_PATH=temp_dir / "chat-test.meta.json",
        CONTENT_ROOT=root / "content",
        FAISS_DIMENSION=256,
    )
    return create_app(settings), settings


async def test_chat_endpoint_returns_relevant_project_context():
    app, _ = build_test_app()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/chat",
            json={"message": "What is the Technical Interview Chatbot?", "session_id": None},
        )

    assert response.status_code == 200
    payload = response.json()
    assert "Technical Interview Chatbot" in payload["answer"]
    assert payload["citations"][0]["slug"] == "technical-interview-chatbot"
    assert payload["citations"][0]["href"] == "/projects/technical-interview-chatbot"


async def test_chat_endpoint_handles_out_of_scope_questions():
    app, _ = build_test_app()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/chat",
            json={"message": "¿Cuál es la capital de Marte?", "session_id": None},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["citations"] == []
    assert "No tengo suficiente contexto" in payload["answer"]


async def test_chat_stream_emits_chunks_and_done_event():
    app, _ = build_test_app()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with client.stream(
            "POST",
            "/api/v1/chat/stream",
            json={"message": "Tell me about the metroidvania game using AI generated art", "session_id": None},
        ) as response:
            body = ""
            async for chunk in response.aiter_text():
                body += chunk

    assert response.status_code == 200
    assert "event: chunk" in body
    assert "event: done" in body
    assert "metroidvania-game-using-ai-generated-art" in body
