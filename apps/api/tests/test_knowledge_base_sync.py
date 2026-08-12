import json
from pathlib import Path

import pytest

from app.config import Settings
from app.db import SqliteRepository
from app.embeddings import HashingEmbedder
from app.knowledge_base import KnowledgeBase
from app.vector_index import FaissVectorStore


def write_document(content_root: Path, collection: str, slug: str, body: str) -> None:
    directory = content_root / collection
    directory.mkdir(parents=True, exist_ok=True)
    (directory / f"{slug}.mdx").write_text(
        f"""---
title: {slug.replace('-', ' ').title()}
description: Knowledge-base sync fixture for {slug}.
slug: {slug}
publishedAt: '2026-08-12'
updatedAt: '2026-08-12'
tags:
  - indexing
---
{body}
""",
        encoding="utf-8",
    )


def build_knowledge_base(settings: Settings) -> KnowledgeBase:
    repository = SqliteRepository(settings.sqlite_path)
    embedder = HashingEmbedder(settings.faiss_dimension)
    knowledge_base = KnowledgeBase(settings=settings, repository=repository)
    knowledge_base.attach(
        embedder,
        FaissVectorStore(dimension=embedder.dimension, index_path=settings.faiss_index_path),
    )
    knowledge_base.sync()
    return knowledge_base


@pytest.mark.parametrize("collection", ["projects", "articles"])
def test_new_published_content_invalidates_and_rebuilds_the_persisted_index(tmp_path: Path, collection: str):
    content_root = tmp_path / "content"
    write_document(content_root, "pages", "about", "Baseline portfolio information.")
    settings = Settings(
        SQLITE_PATH=tmp_path / "site.db",
        FAISS_INDEX_PATH=tmp_path / "faiss.index",
        FAISS_META_PATH=tmp_path / "index_meta.json",
        CONTENT_ROOT=content_root,
        EMBEDDINGS_BACKEND="hash",
        FAISS_DIMENSION=64,
    )

    initial = build_knowledge_base(settings)
    initial_meta = json.loads(settings.faiss_meta_path.read_text(encoding="utf-8"))
    initial_size = initial.vector_store.size

    slug = f"new-{collection[:-1]}"
    write_document(content_root, collection, slug, f"Fresh searchable content for the new {collection[:-1]}.")
    rebuilt = build_knowledge_base(settings)
    rebuilt_meta = json.loads(settings.faiss_meta_path.read_text(encoding="utf-8"))

    assert rebuilt_meta["signature"] != initial_meta["signature"]
    assert rebuilt.vector_store.size > initial_size
    assert any(document["slug"] == slug and document["collection"] == collection for document in rebuilt.catalog())
