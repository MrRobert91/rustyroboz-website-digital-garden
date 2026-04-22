from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from .config import Settings
from .content_source import build_content_signature, build_href, chunk_document, load_content_documents
from .db import SqliteRepository
from .embeddings import embed_text
from .vector_index import FaissVectorStore


@dataclass
class SearchResult:
    slug: str
    title: str
    collection: str
    href: str
    content: str
    score: float


class KnowledgeBase:
    def __init__(self, settings: Settings, repository: SqliteRepository, vector_store: FaissVectorStore) -> None:
        self.settings = settings
        self.repository = repository
        self.vector_store = vector_store
        self.vector_meta: list[dict[str, Any]] = []

    def sync(self) -> None:
        documents = load_content_documents(self.settings.resolved_content_root)
        signature = build_content_signature(documents)

        if self._can_load_existing(signature):
            self.vector_store.load()
            self.vector_meta = self._load_meta()["vectors"]
            return

        self.rebuild(documents, signature)

    def rebuild(self, documents: list, signature: str | None = None) -> None:
        signature = signature or build_content_signature(documents)
        vectors: list[np.ndarray] = []
        documents_payload: list[dict[str, Any]] = []
        chunks_payload: list[dict[str, Any]] = []
        meta: list[dict[str, Any]] = []

        for document in documents:
            documents_payload.append(
                {
                    "slug": document.slug,
                    "title": document.title,
                    "content_type": document.collection,
                    "source_path": document.source_path,
                    "checksum": document.checksum,
                    "published_at": document.published_at,
                    "updated_at": document.updated_at,
                    "metadata_json": {
                        "description": document.description,
                        "tags": document.tags,
                    },
                }
            )

            for chunk_index, chunk in enumerate(chunk_document(document)):
                vector_id = len(meta)
                embedding = embed_text(chunk, self.settings.faiss_dimension)
                vectors.append(embedding)
                meta_item = {
                    "faiss_vector_id": vector_id,
                    "slug": document.slug,
                    "title": document.title,
                    "collection": document.collection,
                    "href": build_href(document.collection, document.slug),
                    "content": chunk,
                    "source_path": document.source_path,
                }
                meta.append(meta_item)
                chunks_payload.append(
                    {
                        "slug": document.slug,
                        "chunk_index": chunk_index,
                        "content": chunk,
                        "embedding": embedding.tolist(),
                        "token_count": len(chunk.split()),
                        "metadata_json": {
                            "slug": document.slug,
                            "title": document.title,
                            "collection": document.collection,
                        },
                        "faiss_vector_id": vector_id,
                    }
                )

        self.repository.replace_knowledge_base(documents_payload, chunks_payload)
        self.vector_store.reset()
        if vectors:
            self.vector_store.add(np.vstack(vectors))
        self.vector_meta = meta
        self.vector_store.save()
        self._save_meta({"signature": signature, "vectors": meta})

    def search(self, query: str, limit: int = 4) -> list[SearchResult]:
        if self.vector_store.size == 0 or not self.vector_meta:
            return []

        query_vector = embed_text(query, self.settings.faiss_dimension)
        scores, indices = self.vector_store.search(query_vector, limit)
        results: list[SearchResult] = []

        for score, index in zip(scores[0], indices[0]):
            if index < 0 or index >= len(self.vector_meta):
                continue
            if float(score) <= 0:
                continue
            item = self.vector_meta[int(index)]
            results.append(
                SearchResult(
                    slug=item["slug"],
                    title=item["title"],
                    collection=item["collection"],
                    href=item["href"],
                    content=item["content"],
                    score=float(score),
                )
            )

        return results

    def _can_load_existing(self, signature: str) -> bool:
        if not self.settings.faiss_index_path.exists() or not self.settings.faiss_meta_path.exists():
            return False
        meta = self._load_meta()
        return meta.get("signature") == signature and isinstance(meta.get("vectors"), list)

    def _load_meta(self) -> dict[str, Any]:
        return json.loads(self.settings.faiss_meta_path.read_text(encoding="utf-8"))

    def _save_meta(self, payload: dict[str, Any]) -> None:
        self.settings.faiss_meta_path.parent.mkdir(parents=True, exist_ok=True)
        self.settings.faiss_meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

