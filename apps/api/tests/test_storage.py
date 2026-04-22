from pathlib import Path
from uuid import uuid4

import numpy as np

from app.db import initialize_database
from app.vector_index import FaissVectorStore


def test_initialize_database_creates_required_tables():
    temp_directory = Path.cwd() / ".tmp" / f"db-{uuid4().hex}"
    temp_directory.mkdir(parents=True, exist_ok=True)
    database_path = temp_directory / "site.db"

    initialize_database(database_path)

    assert database_path.exists()


def test_faiss_snapshot_round_trip():
    temp_directory = Path.cwd() / ".tmp" / f"faiss-{uuid4().hex}"
    temp_directory.mkdir(parents=True, exist_ok=True)
    index_path = temp_directory / "vectors.index"
    store = FaissVectorStore(dimension=3, index_path=index_path)
    vectors = np.array([[0.1, 0.2, 0.3], [0.4, 0.2, 0.9]], dtype="float32")

    store.add(vectors)
    store.save()

    restored = FaissVectorStore(dimension=3, index_path=index_path)
    restored.load()

    assert restored.size == 2
