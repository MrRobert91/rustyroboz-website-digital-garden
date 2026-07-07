import json
import sqlite3
from pathlib import Path
from typing import Any
from uuid import uuid4


SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    source_path TEXT NOT NULL,
    checksum TEXT,
    published_at TEXT,
    updated_at TEXT,
    metadata_json TEXT
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding_json TEXT,
    token_count INTEGER DEFAULT 0,
    metadata_json TEXT,
    faiss_vector_id INTEGER,
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    session_title TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    citations_json TEXT,
    FOREIGN KEY(session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
"""


def initialize_database(database_path: Path) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(database_path) as connection:
        connection.executescript(SCHEMA)
        _ensure_column(connection, "document_chunks", "embedding_json", "TEXT")
        _ensure_column(connection, "document_chunks", "faiss_vector_id", "INTEGER")
        # Public, non-guessable session identifier (the numeric PK stays internal).
        _ensure_column(connection, "chat_sessions", "public_id", "TEXT")
        connection.commit()


def _ensure_column(connection: sqlite3.Connection, table: str, column: str, column_type: str) -> None:
    existing_columns = {row[1] for row in connection.execute(f"PRAGMA table_info({table})").fetchall()}
    if column not in existing_columns:
        connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {column_type}")


class SqliteRepository:
    def __init__(self, database_path: Path) -> None:
        self.database_path = database_path
        initialize_database(database_path)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def replace_knowledge_base(self, documents: list[dict[str, Any]], chunks: list[dict[str, Any]]) -> None:
        with self._connect() as connection:
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute("DELETE FROM document_chunks")
            connection.execute("DELETE FROM documents")

            slug_to_id: dict[str, int] = {}
            for document in documents:
                document_key = f'{document["content_type"]}:{document["slug"]}'
                cursor = connection.execute(
                    """
                    INSERT INTO documents (slug, title, content_type, source_path, checksum, published_at, updated_at, metadata_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        document_key,
                        document["title"],
                        document["content_type"],
                        document["source_path"],
                        document["checksum"],
                        document["published_at"],
                        document["updated_at"],
                        json.dumps(document["metadata_json"], ensure_ascii=False),
                    ),
                )
                slug_to_id[document_key] = int(cursor.lastrowid)

            for chunk in chunks:
                chunk_key = f'{chunk["metadata_json"]["collection"]}:{chunk["slug"]}'
                connection.execute(
                    """
                    INSERT INTO document_chunks (document_id, chunk_index, content, embedding_json, token_count, metadata_json, faiss_vector_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        slug_to_id[chunk_key],
                        chunk["chunk_index"],
                        chunk["content"],
                        json.dumps(chunk["embedding"], ensure_ascii=False),
                        chunk["token_count"],
                        json.dumps(chunk["metadata_json"], ensure_ascii=False),
                        chunk["faiss_vector_id"],
                    ),
                )

            connection.commit()

    def create_chat_session(self, prompt: str) -> str:
        """Creates a session and returns its public (non-guessable) id."""
        title = prompt.strip()[:80]
        public_id = uuid4().hex
        with self._connect() as connection:
            connection.execute(
                "INSERT INTO chat_sessions (session_title, public_id) VALUES (?, ?)",
                (title, public_id),
            )
            connection.commit()
        return public_id

    def _session_pk(self, connection: sqlite3.Connection, public_id: str) -> int | None:
        row = connection.execute("SELECT id FROM chat_sessions WHERE public_id = ?", (public_id,)).fetchone()
        return int(row["id"]) if row else None

    def session_exists(self, public_id: str) -> bool:
        with self._connect() as connection:
            return self._session_pk(connection, public_id) is not None

    def get_chat_messages(self, public_id: str, limit: int = 12) -> list[dict[str, str]]:
        """Most recent messages of a session, oldest first (for agent history)."""
        with self._connect() as connection:
            pk = self._session_pk(connection, public_id)
            if pk is None:
                return []
            rows = connection.execute(
                """
                SELECT role, content FROM chat_messages
                WHERE session_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (pk, limit),
            ).fetchall()
        return [{"role": row["role"], "content": row["content"]} for row in reversed(rows)]

    def append_chat_message(self, public_id: str, role: str, content: str, citations: list[dict[str, Any]] | None = None) -> None:
        with self._connect() as connection:
            pk = self._session_pk(connection, public_id)
            if pk is None:
                return
            connection.execute(
                """
                INSERT INTO chat_messages (session_id, role, content, citations_json)
                VALUES (?, ?, ?, ?)
                """,
                (
                    pk,
                    role,
                    content,
                    json.dumps(citations or [], ensure_ascii=False),
                ),
            )
            connection.execute(
                "UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (pk,),
            )
            connection.commit()

    # ---- FTS5 keyword index (hybrid retrieval) ----

    def rebuild_fts(self, chunks: list[dict[str, Any]]) -> bool:
        """(Re)creates the FTS5 chunk index. Returns False if FTS5 is unavailable."""
        with self._connect() as connection:
            try:
                connection.execute("DROP TABLE IF EXISTS chunk_fts")
                connection.execute(
                    "CREATE VIRTUAL TABLE chunk_fts USING fts5(content, vector_id UNINDEXED)"
                )
            except sqlite3.OperationalError:
                return False
            connection.executemany(
                "INSERT INTO chunk_fts (content, vector_id) VALUES (?, ?)",
                [(chunk["content"], chunk["faiss_vector_id"]) for chunk in chunks],
            )
            connection.commit()
        return True

    def has_fts(self) -> bool:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'chunk_fts'"
            ).fetchone()
        return row is not None

    def fts_search(self, query: str, limit: int = 10) -> list[int]:
        """BM25-ranked vector ids for a keyword query (best first)."""
        # Sanitize into a simple OR query — user text is not FTS syntax.
        tokens = [token for token in "".join(c if c.isalnum() else " " for c in query).split() if len(token) > 1]
        if not tokens:
            return []
        match = " OR ".join(f'"{token}"' for token in tokens[:12])
        with self._connect() as connection:
            try:
                rows = connection.execute(
                    "SELECT vector_id FROM chunk_fts WHERE chunk_fts MATCH ? ORDER BY bm25(chunk_fts) LIMIT ?",
                    (match, limit),
                ).fetchall()
            except sqlite3.OperationalError:
                return []
        return [int(row["vector_id"]) for row in rows]
