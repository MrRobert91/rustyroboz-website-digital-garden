"""Retrieval eval: the golden questions must surface their expected document.

Runs fully offline on the hash embedder + BM25 hybrid, so this is a FLOOR for
retrieval quality — the production semantic embeddings only improve on it.
Failing this eval means a content or chunking regression.
"""

import json
from pathlib import Path
from uuid import uuid4

from app.config import Settings
from app.db import SqliteRepository, initialize_database
from app.embeddings import HashingEmbedder
from app.knowledge_base import KnowledgeBase
from app.vector_index import FaissVectorStore

GOLDEN = json.loads((Path(__file__).resolve().parents[1] / "evals" / "golden.json").read_text(encoding="utf-8"))


def build_knowledge_base() -> KnowledgeBase:
    root = Path(__file__).resolve().parents[3]
    temp_dir = root / ".tmp" / f"evals-{uuid4().hex}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    settings = Settings(
        SQLITE_PATH=temp_dir / "site.db",
        FAISS_INDEX_PATH=temp_dir / "faiss.index",
        FAISS_META_PATH=temp_dir / "meta.json",
        CONTENT_ROOT=root / "content",
        EMBEDDINGS_BACKEND="hash",
        FAISS_DIMENSION=512,
    )
    initialize_database(settings.sqlite_path)
    repository = SqliteRepository(settings.sqlite_path)
    embedder = HashingEmbedder(settings.faiss_dimension)
    knowledge_base = KnowledgeBase(settings=settings, repository=repository)
    knowledge_base.attach(embedder, FaissVectorStore(dimension=embedder.dimension, index_path=settings.faiss_index_path))
    knowledge_base.sync()
    return knowledge_base


def test_golden_retrieval_hit_rate():
    knowledge_base = build_knowledge_base()
    top_k = GOLDEN["top_k"]
    hits = []
    misses = []
    for case in GOLDEN["cases"]:
        results = knowledge_base.search(case["question"], limit=top_k)
        slugs = [result.slug for result in results]
        (hits if case["expected_slug"] in slugs else misses).append(case)

    hit_rate = len(hits) / len(GOLDEN["cases"])
    detail = "; ".join(f'"{case["question"]}" → wanted {case["expected_slug"]}' for case in misses)
    assert hit_rate >= GOLDEN["min_hit_rate"], (
        f"Retrieval hit rate {hit_rate:.2f} below floor {GOLDEN['min_hit_rate']}. Misses: {detail}"
    )
