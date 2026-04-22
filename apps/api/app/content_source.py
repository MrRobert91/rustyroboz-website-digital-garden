from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

import yaml


FRONTMATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)
SUPPORTED_COLLECTIONS = ("articles", "projects", "notes", "pages")


@dataclass
class ContentDocument:
    title: str
    description: str
    slug: str
    collection: str
    source_path: str
    checksum: str
    published_at: str
    updated_at: str
    tags: list[str]
    body: str


def parse_mdx_document(path: Path, collection: str) -> ContentDocument:
    raw = path.read_text(encoding="utf-8")
    match = FRONTMATTER_PATTERN.match(raw)
    if not match:
        raise ValueError(f"Missing frontmatter in {path}")

    frontmatter_raw, body = match.groups()
    frontmatter = yaml.safe_load(frontmatter_raw) or {}

    return ContentDocument(
        title=str(frontmatter["title"]),
        description=str(frontmatter["description"]),
        slug=str(frontmatter["slug"]),
        collection=collection,
        source_path=str(path),
        checksum=hashlib.sha256(raw.encode("utf-8")).hexdigest(),
        published_at=str(frontmatter["publishedAt"]),
        updated_at=str(frontmatter["updatedAt"]),
        tags=[str(tag).lower() for tag in frontmatter.get("tags", [])],
        body=body.strip(),
    )


def load_content_documents(content_root: Path) -> list[ContentDocument]:
    items: list[ContentDocument] = []
    for collection in SUPPORTED_COLLECTIONS:
        directory = content_root / collection
        if not directory.exists():
            continue
        for path in sorted(directory.glob("*.mdx")):
            items.append(parse_mdx_document(path, collection))
    return items


def build_content_signature(items: list[ContentDocument]) -> str:
    payload = "|".join(f"{item.collection}:{item.slug}:{item.checksum}" for item in items)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def build_href(collection: str, slug: str) -> str:
    if collection == "pages":
        if slug == "about":
            return "/about"
        if slug == "contact":
            return "/contact"
    return f"/{collection}/{slug}"


def chunk_document(document: ContentDocument, chunk_size: int = 520) -> list[str]:
    paragraphs = [segment.strip() for segment in re.split(r"\n\s*\n", document.body) if segment.strip()]
    if not paragraphs:
        paragraphs = [document.body]

    chunks: list[str] = []
    prefix = f"{document.title}\n{document.description}\nColección: {document.collection}\nTags: {', '.join(document.tags)}\n\n"
    buffer = prefix

    for paragraph in paragraphs:
        candidate = f"{buffer}{paragraph}\n\n"
        if len(candidate) <= chunk_size or buffer == prefix:
            buffer = candidate
            continue
        chunks.append(buffer.strip())
        buffer = f"{prefix}{paragraph}\n\n"

    if buffer.strip():
        chunks.append(buffer.strip())

    return chunks

