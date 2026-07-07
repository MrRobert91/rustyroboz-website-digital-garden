from __future__ import annotations

import hashlib
import re
import time
from functools import lru_cache

import httpx
import numpy as np

from .config import Settings


TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{2,}")


class HashingEmbedder:
    """Dependency-free feature-hashing embedder.

    Only captures lexical overlap (no semantics) — kept as the offline/test
    fallback and for environments where the fastembed model can't be loaded.
    """

    name = "hash"

    def __init__(self, dimension: int) -> None:
        self.dimension = dimension
        self.model = f"hash-{dimension}"

    def _embed(self, text: str) -> np.ndarray:
        vector = np.zeros(self.dimension, dtype="float32")
        tokens = TOKEN_PATTERN.findall(text.lower())
        if not tokens:
            return vector
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            bucket = int.from_bytes(digest[:4], "big") % self.dimension
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            weight = 1.0 + (digest[5] / 255.0) * 0.1
            vector[bucket] += sign * weight
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector.astype("float32")

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype="float32")
        return np.vstack([self._embed(text) for text in texts])

    def embed_query(self, text: str) -> np.ndarray:
        return self._embed(text)


class FastEmbedEmbedder:
    """Local semantic embeddings via fastembed (ONNX, CPU, multilingual)."""

    name = "fastembed"

    def __init__(self, model_name: str) -> None:
        from fastembed import TextEmbedding  # lazy: heavy import + model download

        self.model = model_name
        self._engine = TextEmbedding(model_name=model_name)
        probe = next(iter(self._engine.embed(["dimension probe"])))
        self.dimension = int(np.asarray(probe).shape[0])
        # E5-family models expect these prefixes; others ignore them.
        self._doc_prefix = "passage: " if "e5" in model_name.lower() else ""
        self._query_prefix = "query: " if "e5" in model_name.lower() else ""

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype="float32")
        prefixed = [f"{self._doc_prefix}{text}" for text in texts]
        # Small batches keep the onnxruntime memory arena small: the arena grows
        # to fit the largest batch ever processed and never shrinks (with the
        # default 256 the process settles at ~2.3GB; with 8 it stays ~0.7GB).
        return np.vstack(
            [np.asarray(vector, dtype="float32") for vector in self._engine.embed(prefixed, batch_size=8)]
        )

    def embed_query(self, text: str) -> np.ndarray:
        return next(
            iter(np.asarray(vector, dtype="float32") for vector in self._engine.embed([f"{self._query_prefix}{text}"]))
        )


class ApiEmbedder:
    """Remote embeddings via an OpenAI-compatible /embeddings endpoint.

    Default target is OpenRouter (same API key as the LLM), which routes to
    OpenAI/Cohere/Google/Mistral embedding models. Keeps the API process free
    of onnxruntime + model weights (~2GB less resident memory than fastembed).
    """

    name = "api"
    BATCH_SIZE = 96

    def __init__(self, settings: Settings) -> None:
        self.model = settings.embeddings_api_model
        self._url = settings.embeddings_api_url
        api_key = settings.resolved_embeddings_api_key
        if not api_key:
            raise RuntimeError("Embeddings backend 'api' requires EMBEDDINGS_API_KEY or OPENROUTER_API_KEY.")
        self._headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        self._timeout = settings.llm_timeout_seconds
        # Short queries repeat often (follow-ups, retries) — cache them.
        self._cached_query = lru_cache(maxsize=256)(self._embed_query_uncached)
        probe = self._request(["dimension probe"])
        self.dimension = int(probe.shape[1])

    def _request(self, texts: list[str]) -> np.ndarray:
        payload = {"model": self.model, "input": texts}
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                with httpx.Client(timeout=self._timeout) as client:
                    response = client.post(self._url, headers=self._headers, json=payload)
                if response.status_code >= 400:
                    raise RuntimeError(f"Embeddings API returned {response.status_code}: {response.text[:200]}")
                data = response.json()["data"]
                ordered = sorted(data, key=lambda item: item["index"])
                return np.asarray([item["embedding"] for item in ordered], dtype="float32")
            except (httpx.HTTPError, KeyError, ValueError, RuntimeError) as exc:
                last_error = exc
                if attempt < 2:
                    time.sleep(0.6 * (attempt + 1))
        raise RuntimeError(f"Embeddings API request failed after retries: {last_error}")

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype="float32")
        batches = [texts[start : start + self.BATCH_SIZE] for start in range(0, len(texts), self.BATCH_SIZE)]
        return np.vstack([self._request(batch) for batch in batches])

    def _embed_query_uncached(self, text: str) -> tuple[float, ...]:
        return tuple(self._request([text])[0].tolist())

    def embed_query(self, text: str) -> np.ndarray:
        return np.asarray(self._cached_query(text), dtype="float32")


Embedder = HashingEmbedder | FastEmbedEmbedder | ApiEmbedder


def create_embedder(settings: Settings) -> Embedder:
    if settings.embeddings_backend == "api":
        return ApiEmbedder(settings)
    if settings.embeddings_backend == "fastembed":
        return FastEmbedEmbedder(settings.embedding_model)
    return HashingEmbedder(settings.faiss_dimension)


def embed_text(text: str, dimension: int) -> np.ndarray:
    """Backwards-compatible helper (hashing backend)."""
    return HashingEmbedder(dimension)._embed(text)
