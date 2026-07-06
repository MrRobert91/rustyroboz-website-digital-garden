from __future__ import annotations

import hashlib
import re

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
        return np.vstack([np.asarray(vector, dtype="float32") for vector in self._engine.embed(prefixed)])

    def embed_query(self, text: str) -> np.ndarray:
        return next(
            iter(np.asarray(vector, dtype="float32") for vector in self._engine.embed([f"{self._query_prefix}{text}"]))
        )


Embedder = HashingEmbedder | FastEmbedEmbedder


def create_embedder(settings: Settings) -> Embedder:
    if settings.embeddings_backend == "fastembed":
        return FastEmbedEmbedder(settings.embedding_model)
    return HashingEmbedder(settings.faiss_dimension)


def embed_text(text: str, dimension: int) -> np.ndarray:
    """Backwards-compatible helper (hashing backend)."""
    return HashingEmbedder(dimension)._embed(text)
