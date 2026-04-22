from pathlib import Path

import faiss
import numpy as np


class FaissVectorStore:
    def __init__(self, dimension: int, index_path: Path) -> None:
        self.dimension = dimension
        self.index_path = index_path
        self.index = faiss.IndexFlatIP(dimension)

    @property
    def size(self) -> int:
        return self.index.ntotal

    def add(self, vectors: np.ndarray) -> None:
        normalized = np.asarray(vectors, dtype="float32")
        if normalized.ndim != 2 or normalized.shape[1] != self.dimension:
            raise ValueError(f"Expected vectors with shape (n, {self.dimension})")
        faiss.normalize_L2(normalized)
        self.index.add(normalized)

    def search(self, vector: np.ndarray, limit: int = 4) -> tuple[np.ndarray, np.ndarray]:
        normalized = np.asarray(vector, dtype="float32")
        if normalized.ndim == 1:
            normalized = normalized.reshape(1, -1)
        if normalized.shape[1] != self.dimension:
            raise ValueError(f"Expected query vectors with shape (n, {self.dimension})")
        faiss.normalize_L2(normalized)
        return self.index.search(normalized, limit)

    def reset(self) -> None:
        self.index = faiss.IndexFlatIP(self.dimension)

    def save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))

    def load(self) -> None:
        if self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))
