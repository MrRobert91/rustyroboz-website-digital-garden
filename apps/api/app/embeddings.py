from __future__ import annotations

import hashlib
import re

import numpy as np


TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9áéíóúñüÁÉÍÓÚÑÜ]{2,}")


def embed_text(text: str, dimension: int) -> np.ndarray:
    vector = np.zeros(dimension, dtype="float32")
    tokens = TOKEN_PATTERN.findall(text.lower())

    if not tokens:
        return vector

    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        bucket = int.from_bytes(digest[:4], "big") % dimension
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        weight = 1.0 + (digest[5] / 255.0) * 0.1
        vector[bucket] += sign * weight

    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return vector.astype("float32")

