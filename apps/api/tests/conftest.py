import os

# Tests must run offline and fast: force the hashing embedder before any
# app module gets imported (app.main builds the index at import time).
os.environ.setdefault("EMBEDDINGS_BACKEND", "hash")
os.environ.setdefault("FAISS_DIMENSION", "256")
