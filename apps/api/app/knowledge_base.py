from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import numpy as np

from .config import Settings
from .content_source import (
    ContentDocument,
    build_content_signature,
    build_href,
    chunk_document,
    load_content_documents,
)
from .db import SqliteRepository
from .embeddings import Embedder
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
    """Semantic index + raw document access for the chat agent.

    Documents (full MDX bodies, catalog) are loaded eagerly and cheaply at
    construction so `read_document`/`list_site_content` work immediately.
    The embedder + FAISS store attach later via `attach()` — in production
    the index is built in a background thread after the port is bound, so
    `ready` gates the semantic `search()`.
    """

    def __init__(
        self,
        settings: Settings,
        repository: SqliteRepository,
        vector_store: FaissVectorStore | None = None,
        embedder: Embedder | None = None,
    ) -> None:
        self.settings = settings
        self.repository = repository
        self.vector_store = vector_store
        self.embedder = embedder
        self.vector_meta: list[dict[str, Any]] = []
        self.documents: list[ContentDocument] = load_content_documents(self.settings.resolved_content_root)
        self.ready = False
        self.fts_enabled = False

    def attach(self, embedder: Embedder, vector_store: FaissVectorStore) -> None:
        self.embedder = embedder
        self.vector_store = vector_store

    def sync(self) -> None:
        if self.embedder is None or self.vector_store is None:
            raise RuntimeError("KnowledgeBase.sync() requires an attached embedder and vector store.")
        documents = load_content_documents(self.settings.resolved_content_root)
        self.documents = documents
        signature = self._build_signature(documents)

        if self._can_load_existing(signature):
            self.vector_store.load()
            self.vector_meta = self._load_meta()["vectors"]
            self.fts_enabled = self.repository.has_fts()
            self.ready = True
            return

        self.rebuild(documents, signature)

    def rebuild(self, documents: list[ContentDocument], signature: str | None = None) -> None:
        self.documents = documents
        signature = signature or self._build_signature(documents)
        documents_payload: list[dict[str, Any]] = []
        chunks_payload: list[dict[str, Any]] = []
        meta: list[dict[str, Any]] = []
        chunk_texts: list[str] = []

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
                chunk_texts.append(chunk)
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
                        "token_count": len(chunk.split()),
                        "metadata_json": {
                            "slug": document.slug,
                            "title": document.title,
                            "collection": document.collection,
                        },
                        "faiss_vector_id": vector_id,
                    }
                )

        vectors = self.embedder.embed_documents(chunk_texts)
        for chunk_payload, embedding in zip(chunks_payload, vectors):
            chunk_payload["embedding"] = np.asarray(embedding).tolist()

        self.repository.replace_knowledge_base(documents_payload, chunks_payload)
        self.fts_enabled = self.repository.rebuild_fts(chunks_payload)
        self.vector_store.reset()
        if len(chunk_texts) > 0:
            self.vector_store.add(vectors)
        self.vector_meta = meta
        self.vector_store.save()
        self._save_meta({"signature": signature, "vectors": meta})
        self.ready = True

    def search(self, query: str, limit: int = 5) -> list[SearchResult]:
        """Hybrid retrieval: semantic (FAISS) + keyword (SQLite FTS5 / BM25),
        fused with Reciprocal Rank Fusion. Keyword ranking catches the exact
        names (projects, tech, certs) that small embeddings miss."""
        if not self.ready or self.vector_store is None or self.vector_store.size == 0 or not self.vector_meta:
            return []

        pool = max(limit * 2, 10)
        query_vector = self.embedder.embed_query(query)
        scores, indices = self.vector_store.search(query_vector, pool)
        semantic_rank: list[int] = [
            int(index)
            for score, index in zip(scores[0], indices[0])
            if 0 <= index < len(self.vector_meta) and float(score) > 0
        ]
        semantic_scores = {int(index): float(score) for score, index in zip(scores[0], indices[0])}

        keyword_rank: list[int] = []
        if getattr(self, "fts_enabled", False):
            keyword_rank = [vid for vid in self.repository.fts_search(query, limit=pool) if vid < len(self.vector_meta)]

        # RRF: score = Σ 1/(60 + rank)
        fused: dict[int, float] = {}
        for rank_list in (semantic_rank, keyword_rank):
            for position, vector_id in enumerate(rank_list):
                fused[vector_id] = fused.get(vector_id, 0.0) + 1.0 / (60 + position)

        ordered = sorted(fused.items(), key=lambda item: item[1], reverse=True)[:limit]
        results: list[SearchResult] = []
        for vector_id, _fused_score in ordered:
            item = self.vector_meta[vector_id]
            results.append(
                SearchResult(
                    slug=item["slug"],
                    title=item["title"],
                    collection=item["collection"],
                    href=item["href"],
                    content=item["content"],
                    score=semantic_scores.get(vector_id, 0.0),
                )
            )
        return results

    # ---- Agent tool surface ----

    def catalog(self) -> list[dict[str, Any]]:
        """Everything published on the site, for the agent to browse."""
        return [
            {
                "collection": document.collection,
                "slug": document.slug,
                "title": document.title,
                "description": document.description,
                "tags": document.tags,
                "published_at": document.published_at,
                "href": build_href(document.collection, document.slug),
            }
            for document in self.documents
        ]

    def get_document(self, collection: str, slug: str) -> ContentDocument | None:
        for document in self.documents:
            if document.collection == collection and document.slug == slug:
                return document
        return None

    # ---- Index persistence ----

    def _build_signature(self, documents: list[ContentDocument]) -> str:
        content_signature = build_content_signature(documents)
        return f"{content_signature}:{self.embedder.name}:{self.embedder.model}:{self.embedder.dimension}"

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
