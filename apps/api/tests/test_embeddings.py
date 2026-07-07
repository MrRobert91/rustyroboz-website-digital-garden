import json

import httpx
import numpy as np

from app.config import Settings
from app.embeddings import ApiEmbedder, HashingEmbedder


def build_settings(**overrides) -> Settings:
    values = {
        "EMBEDDINGS_BACKEND": "api",
        "OPENROUTER_API_KEY": "test-key",
        "EMBEDDINGS_API_MODEL": "openai/text-embedding-3-small",
    }
    values.update(overrides)
    return Settings(**values)


def fake_embeddings_transport(calls: list[dict]):
    """httpx transport that returns index-keyed fake embeddings and records payloads."""

    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        calls.append(payload)
        data = [
            {"index": i, "embedding": [float(i + 1), 0.5, 0.25]}
            for i in range(len(payload["input"]))
        ]
        # Return them shuffled to prove we re-sort by index.
        return httpx.Response(200, json={"data": list(reversed(data))})

    return httpx.MockTransport(handler)


def test_api_embedder_probes_dimension_batches_and_sorts(monkeypatch):
    calls: list[dict] = []
    transport = fake_embeddings_transport(calls)
    original_client = httpx.Client
    monkeypatch.setattr(httpx, "Client", lambda **kwargs: original_client(transport=transport, **kwargs))

    embedder = ApiEmbedder(build_settings())
    assert embedder.dimension == 3
    assert calls[0]["model"] == "openai/text-embedding-3-small"

    vectors = embedder.embed_documents([f"doc {i}" for i in range(100)])
    assert vectors.shape == (100, 3)
    # 100 docs at BATCH_SIZE=96 → two requests (plus the initial probe)
    assert len(calls) == 3
    # sorted by index: first vector of each batch must be [1.0, ...]
    assert vectors[0][0] == 1.0

    query = embedder.embed_query("hello")
    cached = embedder.embed_query("hello")
    assert np.allclose(query, cached)
    # the second call hit the LRU cache — no extra request
    assert len(calls) == 4


def test_api_embedder_requires_a_key():
    try:
        ApiEmbedder(build_settings(OPENROUTER_API_KEY=""))
    except RuntimeError as exc:
        assert "requires" in str(exc)
    else:
        raise AssertionError("ApiEmbedder must fail without an API key")


def test_embeddings_api_url_falls_back_to_openrouter():
    settings = build_settings()
    assert settings.embeddings_api_url == "https://openrouter.ai/api/v1/embeddings"
    custom = build_settings(EMBEDDINGS_API_BASE_URL="https://api.example.com/v2/")
    assert custom.embeddings_api_url == "https://api.example.com/v2/embeddings"


def test_hashing_embedder_stays_deterministic():
    embedder = HashingEmbedder(64)
    first = embedder.embed_query("stable text")
    second = embedder.embed_query("stable text")
    assert np.allclose(first, second)
