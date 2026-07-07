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


IMPORT_LINE = re.compile(r"^\s*(import|export)\s.+$", re.MULTILINE)
JSX_SELF_CLOSING = re.compile(r"<[A-Z][a-zA-Z0-9]*[^>]*/>")
JSX_TAG = re.compile(r"</?[A-Z][a-zA-Z0-9]*[^>]*>")
HTML_COMMENT = re.compile(r"\{/\*.*?\*/\}|<!--.*?-->", re.DOTALL)
MD_IMAGE = re.compile(r"!\[([^\]]*)\]\([^)]*\)")
MD_LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")
HEADING = re.compile(r"^(#{1,4})\s+(.+)$", re.MULTILINE)


def clean_mdx_body(body: str) -> str:
    """Strip MDX/JSX noise before indexing: imports, component tags, comments,
    image URLs, link URLs. Keeps human-readable text (alt texts, link labels)."""
    text = HTML_COMMENT.sub(" ", body)
    text = IMPORT_LINE.sub(" ", text)
    text = JSX_SELF_CLOSING.sub(" ", text)
    text = JSX_TAG.sub(" ", text)  # keeps inner text of paired components
    text = MD_IMAGE.sub(r"\1", text)
    text = MD_LINK.sub(r"\1", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def chunk_document(document: ContentDocument, target_size: int = 1000, max_size: int = 1300) -> list[str]:
    """Heading-aware chunking with paragraph overlap.

    The body is split by markdown headings; paragraphs are packed up to
    ~target_size chars per chunk and the last paragraph of a chunk is carried
    into the next one (overlap) so ideas cut at a boundary stay retrievable.
    Every chunk carries a metadata header + its section heading, so isolated
    chunks still "know" which document and section they belong to.
    """
    body = clean_mdx_body(document.body)
    prefix = f"{document.title}\n{document.description}\nColección: {document.collection}\nTags: {', '.join(document.tags)}\n"

    # split into (heading, section_text) pairs
    sections: list[tuple[str, str]] = []
    last_pos = 0
    last_heading = ""
    for match in HEADING.finditer(body):
        text = body[last_pos : match.start()].strip()
        if text:
            sections.append((last_heading, text))
        last_heading = match.group(2).strip()
        last_pos = match.end()
    tail = body[last_pos:].strip()
    if tail:
        sections.append((last_heading, tail))
    if not sections:
        sections = [("", body)]

    chunks: list[str] = []
    for heading, section in sections:
        header = f"{prefix}{f'Sección: {heading}' if heading else ''}\n\n"
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", section) if p.strip()]
        buffer: list[str] = []
        size = 0
        for paragraph in paragraphs:
            # hard-split pathological paragraphs
            while len(paragraph) > max_size:
                cut = paragraph.rfind(" ", 0, max_size)
                cut = cut if cut > max_size // 2 else max_size
                buffer.append(paragraph[:cut])
                chunks.append(header + "\n\n".join(buffer))
                buffer, size = [], 0
                paragraph = paragraph[cut:].strip()
            if size + len(paragraph) > target_size and buffer:
                chunks.append(header + "\n\n".join(buffer))
                # overlap: carry the last paragraph into the next chunk
                carry = buffer[-1] if len(buffer[-1]) < target_size // 2 else ""
                buffer = [carry, paragraph] if carry else [paragraph]
                size = len(carry) + len(paragraph)
            else:
                buffer.append(paragraph)
                size += len(paragraph)
        if buffer and "\n\n".join(buffer).strip():
            chunks.append(header + "\n\n".join(buffer))

    return [chunk.strip() for chunk in chunks if chunk.strip()] or [prefix.strip()]

