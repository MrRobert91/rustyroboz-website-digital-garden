from pathlib import Path

import faiss
import numpy as np


class FaissVectorStore:
    def __init__(self, dimension: int, index_path: Path) -> None:
        self.dimension = dimension
        self.index_path = index_path
        self.index = faiss.IndexFlatL2(dimension)

    @property
    def size(self) -> int:
        return self.index.ntotal

    def add(self, vectors: np.ndarray) -> None:
        normalized = np.asarray(vectors, dtype="float32")
        if normalized.ndim != 2 or normalized.shape[1] != self.dimension:
            raise ValueError(f"Expected vectors with shape (n, {self.dimension})")
        self.index.add(normalized)

    def save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))

    def load(self) -> None:
        if self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))

