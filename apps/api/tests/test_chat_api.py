from pathlib import Path

from httpx import ASGITransport, AsyncClient

from app.chat_service import ChatService
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
        OPENROUTER_API_KEY="test-key",
    )
    return create_app(settings), settings


async def test_chat_endpoint_returns_relevant_project_context(monkeypatch):
    async def fake_request_completion(self, message, retrieved, citations):
        assert "Technical Interview Chatbot" in retrieved[0].title
        return "Technical Interview Chatbot es un asistente para practicar entrevistas técnicas."

    monkeypatch.setattr(ChatService, "_request_completion", fake_request_completion)
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


async def test_chat_stream_emits_chunks_and_done_event(monkeypatch):
    async def fake_request_completion(self, message, retrieved, citations):
        return "Metroidvania Game Using AI Generated Art mezcla exploración, combate y arte generado con IA."

    monkeypatch.setattr(ChatService, "_request_completion", fake_request_completion)
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


async def test_chat_endpoint_returns_openrouter_errors(monkeypatch):
    async def fake_request_completion(self, message, retrieved, citations):
        raise RuntimeError("OpenRouter devolvió 401: invalid key")

    monkeypatch.setattr(ChatService, "_request_completion", fake_request_completion)
    app, _ = build_test_app()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.post(
            "/api/v1/chat",
            json={"message": "Háblame del chatbot de entrevistas técnicas", "session_id": None},
        )

    assert response.status_code == 502
    assert "invalid key" in response.json()["detail"]


async def test_chat_stream_emits_error_event_when_model_request_fails(monkeypatch):
    async def fake_request_completion(self, message, retrieved, citations):
        raise RuntimeError("OpenRouter devolvió 429: rate limit")

    monkeypatch.setattr(ChatService, "_request_completion", fake_request_completion)
    app, _ = build_test_app()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        async with client.stream(
            "POST",
            "/api/v1/chat/stream",
            json={"message": "Háblame del chatbot de entrevistas técnicas", "session_id": None},
        ) as response:
            body = ""
            async for chunk in response.aiter_text():
                body += chunk

    assert response.status_code == 200
    assert "event: error" in body
    assert "rate limit" in body


def test_openrouter_payload_includes_fallback_models():
    _, settings = build_test_app()
    service = object.__new__(ChatService)
    service.settings = settings
    payload = service._build_openrouter_payload(
        message="Háblame del chatbot de entrevistas técnicas",
        retrieved=[],
        citations=[],
    )

    assert payload["model"] == settings.openrouter_model
    assert payload["models"] == ["openrouter/free"]
    assert payload["provider"]["allow_fallbacks"] is True


def test_openrouter_payload_omits_duplicate_fallback_model():
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
        OPENROUTER_API_KEY="test-key",
        OPENROUTER_MODEL="openrouter/free",
        OPENROUTER_FALLBACK_MODELS="openrouter/free",
    )
    service = object.__new__(ChatService)
    service.settings = settings

    payload = service._build_openrouter_payload(
        message="Háblame del chatbot de entrevistas técnicas",
        retrieved=[],
        citations=[],
    )

    assert payload["model"] == "openrouter/free"
    assert "models" not in payload
