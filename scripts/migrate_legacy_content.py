from __future__ import annotations

import json
import math
import re
import shutil
from dataclasses import dataclass
from datetime import date, datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, urlparse
import xml.etree.ElementTree as ET

import requests


ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content"
WEB_IMAGES_DIR = ROOT / "apps" / "web" / "public" / "images"
TIMEOUT = 30
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/135.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
}

PROJECT_ORDER = [
    ("susbeer-vr-experience", "Susbeer VR Experience"),
    ("technical-interview-chatbot", "Technical Interview Chatbot"),
    ("metroidvania-game-using-ai-generated-art", "Metroidvania game using AI ART"),
    ("low-cost-vr-digital-twin", "Low Cost VR Digital Twin"),
    ("nasa-hackathon", "NASA Hackathon"),
    ("virtual-reality-game", "Virtual Reality Game"),
    ("brain-computer-interface-project", "Brain Computer Interface Project"),
    ("there-are-more-things", "There are more things"),
    ("nft-collection-ai-art-quantum", "NFT Collection: AI Art + Quantum"),
    ("art-made-with-artificial-intelligence", "Art made with artificial intelligence"),
    ("quantum-random-number-generator", "Quantum Random Number Generator"),
    ("crazy-ride", "Crazy Ride"),
    ("toxic-adventure", "Toxic Adventure"),
    ("rpi-console", "RPI Console"),
    ("drone-programming-contest", "Drone Programming Contest"),
    ("recognition-of-traffic-signal-images-with-deep-learning", "Recognition of traffic signal images with deep learning"),
    ("face-recognition-and-tracking-with-opencv", "Face recognition and tracking with opencv"),
    ("arduino-safe-brake-ligths", "Arduino Safe Brake Ligths"),
]

PROJECT_META = {
    "susbeer-vr-experience": {
        "publishedAt": "2024-11-01",
        "tags": ["vr", "unity", "meta-quest-2", "3d-scanning", "interactive-experience", "ai-music"],
        "tech": ["Unity", "Meta Quest 2", "Kiri Engine", "Suno AI"],
        "status": "completed",
        "featured": True,
    },
    "technical-interview-chatbot": {
        "publishedAt": "2024-08-01",
        "tags": ["llm", "chatbot", "langchain", "groq", "streamlit", "technical-interviews"],
        "tech": ["LangChain", "Groq API", "Streamlit", "Streamlit Cloud"],
        "status": "completed",
        "featured": True,
    },
    "metroidvania-game-using-ai-generated-art": {
        "publishedAt": "2023-03-20",
        "tags": ["game-development", "ai-art", "midjourney", "unity", "game-jam", "dalle-2"],
        "tech": ["Unity", "Midjourney", "DALL·E 2", "Krita"],
        "status": "completed",
        "featured": True,
    },
    "low-cost-vr-digital-twin": {
        "publishedAt": "2022-11-26",
        "tags": ["vr", "digital-twin", "unity", "oculus-quest-2", "3d-scanning"],
        "tech": ["Unity", "Oculus Quest 2", "Kiri Engine"],
        "status": "completed",
        "featured": True,
    },
    "nasa-hackathon": {
        "publishedAt": "2024-05-01",
        "tags": ["stable-diffusion", "fine-tuning", "space-art", "hackathon", "generative-ai"],
        "tech": ["Stable Diffusion", "Python"],
        "status": "completed",
        "featured": False,
    },
    "virtual-reality-game": {
        "publishedAt": "2022-09-01",
        "tags": ["vr", "unity", "game-jam", "virtual-reality"],
        "tech": ["Unity", "VR"],
        "status": "completed",
        "featured": False,
    },
    "brain-computer-interface-project": {
        "publishedAt": "2021-11-01",
        "tags": ["brain-computer-interface", "drone", "robotics", "experimentation"],
        "tech": ["BCI", "Drone"],
        "status": "completed",
        "featured": False,
    },
    "there-are-more-things": {
        "publishedAt": "2021-10-15",
        "tags": ["walking-simulator", "unity", "horror", "game-jam"],
        "tech": ["Unity", "Windows", "Linux", "Android"],
        "status": "completed",
        "featured": False,
    },
    "nft-collection-ai-art-quantum": {
        "publishedAt": "2022-06-15",
        "tags": ["nft", "ai-art", "quantum-computing", "opensea"],
        "tech": ["OpenSea", "Quantum RNG"],
        "status": "completed",
        "featured": False,
    },
    "art-made-with-artificial-intelligence": {
        "publishedAt": "2022-06-01",
        "tags": ["artificial-intelligence", "vqgan-clip", "ai-art", "nft"],
        "tech": ["VQGAN + CLIP", "Google Colab"],
        "status": "completed",
        "featured": False,
    },
    "quantum-random-number-generator": {
        "publishedAt": "2021-08-01",
        "tags": ["quantum-computing", "randomness", "ibm-quantum"],
        "tech": ["IBM Quantum", "Python"],
        "status": "completed",
        "featured": False,
    },
    "crazy-ride": {
        "publishedAt": "2021-06-01",
        "tags": ["game-development", "unity", "android", "3d-game"],
        "tech": ["Unity 3D", "Android"],
        "status": "completed",
        "featured": False,
    },
    "toxic-adventure": {
        "publishedAt": "2021-05-01",
        "tags": ["platformer", "unity", "android", "2d-game"],
        "tech": ["Unity", "Android"],
        "status": "completed",
        "featured": False,
    },
    "rpi-console": {
        "publishedAt": "2020-10-01",
        "tags": ["raspberry-pi", "retropie", "hardware", "retro-gaming"],
        "tech": ["Raspberry Pi 3 Model B", "RetroPie"],
        "status": "completed",
        "featured": False,
    },
    "drone-programming-contest": {
        "publishedAt": "2020-03-01",
        "tags": ["drone", "robotics", "competition", "programming"],
        "tech": ["Drone Programming"],
        "status": "completed",
        "featured": False,
    },
    "recognition-of-traffic-signal-images-with-deep-learning": {
        "publishedAt": "2019-06-01",
        "tags": ["deep-learning", "computer-vision", "traffic-signs", "cnn"],
        "tech": ["Python", "TensorFlow", "CNN"],
        "status": "completed",
        "featured": False,
    },
    "face-recognition-and-tracking-with-opencv": {
        "publishedAt": "2019-02-01",
        "tags": ["opencv", "computer-vision", "face-recognition"],
        "tech": ["Python", "OpenCV"],
        "status": "completed",
        "featured": False,
    },
    "arduino-safe-brake-ligths": {
        "publishedAt": "2018-04-01",
        "tags": ["arduino", "hardware", "automotive", "embedded"],
        "tech": ["Arduino"],
        "status": "completed",
        "featured": False,
    },
}


@dataclass
class Block:
    kind: str
    value: str


class LegacyProjectPageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.events: list[tuple[str, str]] = []
        self._in_script = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        if tag in {"script", "style"}:
            self._in_script = True
            return
        if self._in_script:
            return
        if tag == "a":
            self.events.append(("a_start", attrs_dict.get("href", "")))
        elif tag == "img":
            self.events.append(("img", attrs_dict.get("src", "")))
        elif tag in {"p", "h1", "h2", "h3", "li", "blockquote", "pre", "code", "br"}:
            self.events.append(("start", tag))

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"}:
            self._in_script = False
            return
        if self._in_script:
            return
        if tag == "a":
            self.events.append(("a_end", tag))
        elif tag in {"p", "h1", "h2", "h3", "li", "blockquote", "pre", "code", "br"}:
            self.events.append(("end", tag))

    def handle_data(self, data: str) -> None:
        if self._in_script:
            return
        text = normalize_text(data)
        if text:
            self.events.append(("text", text))


class MediumMarkdownParser(HTMLParser):
    BLOCK_TAGS = {"p", "h2", "h3", "h4", "blockquote", "li", "pre", "figcaption"}

    def __init__(self, image_dir: Path, web_prefix: str) -> None:
        super().__init__(convert_charrefs=True)
        self.image_dir = image_dir
        self.web_prefix = web_prefix
        self.blocks: list[Block] = []
        self._stack: list[str] = []
        self._current_kind: str | None = None
        self._current_parts: list[str] = []
        self._anchor_href: str | None = None
        self._anchor_parts: list[str] = []
        self._image_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        self._stack.append(tag)
        if tag in self.BLOCK_TAGS:
            self._flush_current()
            self._current_kind = tag
            self._current_parts = []
            return
        if tag == "a":
            self._anchor_href = attrs_dict.get("href")
            self._anchor_parts = []
            return
        if tag == "br" and self._current_kind:
            self._current_parts.append("  \n")
            return
        if tag == "img":
            self._flush_current()
            src = attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            if src:
                local = download_image(src, self.image_dir, f"image-{self._image_count + 1:02d}")
                if local:
                    self._image_count += 1
                    self.blocks.append(Block("image", f"![{alt or 'Article image'}]({self.web_prefix}/{Path(local).name})"))

    def handle_endtag(self, tag: str) -> None:
        if tag == "a":
            self._flush_anchor()
        if tag in self.BLOCK_TAGS:
            self._flush_current()
            self._current_kind = None
            self._current_parts = []
        if self._stack:
            self._stack.pop()

    def handle_data(self, data: str) -> None:
        text = normalize_text(data, preserve_linebreaks=True)
        if not text:
            return
        if self._anchor_href:
            self._anchor_parts.append(text)
        elif self._current_kind:
            self._current_parts.append(text)

    def get_markdown(self) -> str:
        self._flush_current()
        lines: list[str] = []
        for block in self.blocks:
            if block.kind == "p":
                lines.append(block.value)
            elif block.kind == "h2":
                lines.append(f"## {block.value}")
            elif block.kind == "h3":
                lines.append(f"### {block.value}")
            elif block.kind == "h4":
                lines.append(f"#### {block.value}")
            elif block.kind == "blockquote":
                lines.append("> " + block.value.replace("\n", "\n> "))
            elif block.kind == "li":
                lines.append(f"- {block.value}")
            elif block.kind == "pre":
                lines.append(f"```text\n{block.value}\n```")
            elif block.kind == "figcaption":
                lines.append(f"*{block.value}*")
            elif block.kind == "image":
                lines.append(block.value)
            if lines and lines[-1] != "":
                lines.append("")
        return "\n".join(lines).strip() + "\n"

    def _flush_anchor(self) -> None:
        if not self._anchor_href:
            return
        text = normalize_inline(" ".join(self._anchor_parts))
        if text:
            href = clean_google_redirect(self._anchor_href)
            rendered = f"[{text}]({href})" if href else text
            if self._current_kind:
                self._current_parts.append(rendered)
        self._anchor_href = None
        self._anchor_parts = []

    def _flush_current(self) -> None:
        if not self._current_kind:
            return
        self._flush_anchor()
        value = normalize_inline(" ".join(self._current_parts))
        if value:
            self.blocks.append(Block(self._current_kind, value))


def normalize_text(value: str, preserve_linebreaks: bool = False) -> str:
    value = unescape(value.replace("\xa0", " "))
    if preserve_linebreaks:
        value = value.replace("\r", "")
        value = re.sub(r"[ \t]+", " ", value)
        value = re.sub(r"\n{3,}", "\n\n", value)
        return value.strip()
    return " ".join(value.split()).strip()


def normalize_inline(value: str) -> str:
    value = value.replace(" ](", "](")
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    value = re.sub(r"\s{2,}", " ", value)
    value = value.replace(" .", ".")
    return value.strip()


def clean_google_redirect(url: str) -> str:
    if not url:
        return ""
    if url.startswith("https://www.google.com/url?"):
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        return query.get("q", [url])[0]
    return url


def request_text(url: str) -> str:
    response = requests.get(url, timeout=TIMEOUT, headers=DEFAULT_HEADERS)
    response.raise_for_status()
    return response.text


def download_image(url: str, destination_dir: Path, stem: str) -> str:
    destination_dir.mkdir(parents=True, exist_ok=True)
    cleaned_url = clean_google_redirect(url)
    if any(token in cleaned_url for token in ["medium.com/_/stat", "data:image"]):
        return ""
    try:
        response = requests.get(cleaned_url, timeout=TIMEOUT, headers=DEFAULT_HEADERS)
        response.raise_for_status()
    except requests.RequestException:
        return ""
    content_type = response.headers.get("content-type", "")
    extension = extension_from_url(cleaned_url, content_type)
    target = destination_dir / f"{stem}{extension}"
    target.write_bytes(response.content)
    return target.as_posix()


def extension_from_url(url: str, content_type: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}:
        return suffix
    if "png" in content_type:
        return ".png"
    if "webp" in content_type:
        return ".webp"
    if "svg" in content_type:
        return ".svg"
    return ".jpg"


def estimate_reading_time(text: str) -> str:
    words = len(re.findall(r"\w+", text))
    minutes = max(1, math.ceil(words / 220))
    return f"{minutes} min"


def ensure_clean_directory(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def clear_existing_mdx(collection: str) -> None:
    directory = CONTENT_DIR / collection
    directory.mkdir(parents=True, exist_ok=True)
    for mdx_file in directory.glob("*.mdx"):
        mdx_file.unlink()


def render_frontmatter(data: dict[str, object]) -> str:
    lines = ["---"]
    for key, value in data.items():
        lines.append(f"{key}: {serialize_yaml_value(value)}")
    lines.append("---")
    return "\n".join(lines)


def serialize_yaml_value(value: object) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return '""'
    if isinstance(value, (list, dict, str)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def parse_project_body(title: str, html: str, image_dir: Path, web_prefix: str) -> tuple[str, list[str]]:
    parser = LegacyProjectPageParser()
    parser.feed(html)
    footer_index = next((index for index, event in enumerate(parser.events) if event == ("text", "Google Sites")), len(parser.events))
    title_indexes = [index for index, event in enumerate(parser.events[:footer_index]) if event[0] == "text" and event[1].lower() == title.lower()]
    if not title_indexes:
        raise RuntimeError(f"Unable to find title block for project: {title}")

    start_index = title_indexes[-1] + 1
    blocks: list[Block] = []
    current_kind: str | None = None
    current_parts: list[str] = []
    anchor_href: str | None = None
    anchor_parts: list[str] = []
    external_links: list[str] = []
    image_count = 0
    seen_images: set[str] = set()

    def flush_anchor() -> None:
        nonlocal anchor_href, anchor_parts
        if not anchor_href:
            return
        href = clean_google_redirect(anchor_href)
        text = normalize_inline(" ".join(anchor_parts))
        if text:
            rendered = f"[{text}]({href})" if href else text
            current_parts.append(rendered)
            if href.startswith("http"):
                external_links.append(href)
        anchor_href = None
        anchor_parts = []

    def flush_current() -> None:
        nonlocal current_kind, current_parts
        flush_anchor()
        if current_kind:
            value = normalize_inline(" ".join(current_parts))
            if value:
                blocks.append(Block(current_kind, value))
        current_kind = None
        current_parts = []

    for event, value in parser.events[start_index:footer_index]:
        if event == "start" and value in {"p", "h2", "h3", "blockquote", "li", "pre"}:
            flush_current()
            current_kind = value
            current_parts = []
        elif event == "end" and value in {"p", "h2", "h3", "blockquote", "li", "pre"}:
            flush_current()
        elif event == "a_start":
            anchor_href = value
            anchor_parts = []
        elif event == "a_end":
            flush_anchor()
        elif event == "text":
            if value in {"Report abuse", "Cookie Policy", "Reject", "Accept"}:
                break
            if anchor_href:
                anchor_parts.append(value)
            elif current_kind:
                current_parts.append(value)
        elif event == "img":
            flush_current()
            if not value or value in seen_images:
                continue
            seen_images.add(value)
            local_path = download_image(value, image_dir, f"image-{image_count + 1:02d}")
            if local_path:
                image_count += 1
                blocks.append(Block("image", f"![{title} image {image_count}]({web_prefix}/{Path(local_path).name})"))

    flush_current()

    lines: list[str] = []
    for block in blocks:
        if block.kind == "p":
            lines.append(block.value)
        elif block.kind == "h2":
            lines.append(f"## {block.value}")
        elif block.kind == "h3":
            lines.append(f"### {block.value}")
        elif block.kind == "blockquote":
            lines.append("> " + block.value.replace("\n", "\n> "))
        elif block.kind == "li":
            lines.append(f"- {block.value}")
        elif block.kind == "pre":
            lines.append(f"```text\n{block.value}\n```")
        elif block.kind == "image":
            lines.append(block.value)
        lines.append("")

    return "\n".join(lines).strip() + "\n", unique_preserving_order(external_links)


def unique_preserving_order(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


def pick_project_links(external_links: list[str], article_links: dict[str, str]) -> dict[str, str]:
    links: dict[str, str] = {}
    for href in external_links:
        if "github.com" in href and "github" not in links:
            links["github"] = href
        elif any(domain in href for domain in ["itch.io", "streamlit.app", "opensea.io"]) and "demo" not in links:
            links["demo"] = href
        elif "youtube.com" in href and "video" not in links:
            links["video"] = href

    for title, href in article_links.items():
        links.setdefault("article", href)
        break
    return links


def build_article_body(html_fragment: str, image_dir: Path, web_prefix: str) -> str:
    parser = MediumMarkdownParser(image_dir=image_dir, web_prefix=web_prefix)
    parser.feed(html_fragment)
    return parser.get_markdown()


def find_first_image(body: str) -> str:
    match = re.search(r"!\[[^\]]*\]\(([^)]+)\)", body)
    return match.group(1) if match else ""


def find_matching_articles(article_index: dict[str, str], project_slug: str, title: str) -> dict[str, str]:
    matches: dict[str, str] = {}
    for article_title, article_link in article_index.items():
        normalized_title = slugify(article_title)
        if normalized_title == project_slug or normalized_title in project_slug or project_slug in normalized_title:
            matches[article_title] = article_link
        elif article_title.lower() == title.lower():
            matches[article_title] = article_link
    return matches


def slugify(value: str) -> str:
    value = unescape(value).strip().lower()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[\s_]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


def article_title_from_link(url: str) -> str:
    path = urlparse(url).path.split("/")[-1]
    title_part = re.sub(r"-[0-9a-f]{12,}$", "", path)
    return title_part


def write_content_file(collection: str, slug: str, frontmatter: dict[str, object], body: str) -> None:
    target = CONTENT_DIR / collection / f"{slug}.mdx"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_frontmatter(frontmatter) + "\n\n" + body.strip() + "\n", encoding="utf-8")


def migrate_articles() -> dict[str, str]:
    clear_existing_mdx("articles")
    ensure_clean_directory(WEB_IMAGES_DIR / "articles")

    xml_text = request_text("https://medium.com/feed/@rustyroboz")
    root = ET.fromstring(xml_text)
    channel = root.find("channel")
    if channel is None:
        raise RuntimeError("Medium feed channel was not found.")

    article_index: dict[str, str] = {}
    for position, item in enumerate(channel.findall("item")):
        title = item.findtext("title", "").strip()
        link = (item.findtext("link", "") or "").split("?")[0]
        pub_date = item.findtext("pubDate", "")
        published_at = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %Z").date().isoformat()
        categories = [tag.text.strip().lower() for tag in item.findall("category") if tag.text]
        content_html = item.findtext("{http://purl.org/rss/1.0/modules/content/}encoded", "")

        slug = article_title_from_link(link)
        image_dir = WEB_IMAGES_DIR / "articles" / slug
        web_prefix = f"/images/articles/{slug}"
        body = build_article_body(content_html, image_dir=image_dir, web_prefix=web_prefix)
        cover_image = find_first_image(body)

        paragraphs = [segment for segment in re.split(r"\n\s*\n", body) if segment.strip()]
        description = normalize_inline(re.sub(r"!\[[^\]]*\]\([^)]+\)", "", paragraphs[0])) if paragraphs else title
        description = description[:220].rstrip(".") + ("…" if len(description) > 220 else "")
        frontmatter = {
            "title": title,
            "description": description,
            "slug": slug,
            "publishedAt": published_at,
            "updatedAt": published_at,
            "tags": categories,
            "draft": False,
            "featured": position < 4,
            "coverImage": cover_image,
            "readingTime": estimate_reading_time(body),
        }
        write_content_file("articles", slug, frontmatter, body)
        article_index[title] = link

    return article_index


def migrate_projects(article_index: dict[str, str]) -> None:
    clear_existing_mdx("projects")
    ensure_clean_directory(WEB_IMAGES_DIR / "projects")

    for slug, expected_title in PROJECT_ORDER:
        try:
            html = request_text(f"https://www.rustyroboz.com/projects/{slug}")
            image_dir = WEB_IMAGES_DIR / "projects" / slug
            web_prefix = f"/images/projects/{slug}"
            body, external_links = parse_project_body(expected_title, html, image_dir=image_dir, web_prefix=web_prefix)
            cover_image = find_first_image(body)
            first_paragraph = next((segment for segment in body.split("\n\n") if segment and not segment.startswith("![")), expected_title)
            description = normalize_inline(first_paragraph)
            if len(description) > 220:
                description = description[:217].rstrip() + "..."

            meta = PROJECT_META[slug]
            article_links = find_matching_articles(article_index, slug, expected_title)
            links = pick_project_links(external_links, article_links)
            frontmatter = {
                "title": expected_title,
                "description": description,
                "slug": slug,
                "publishedAt": meta["publishedAt"],
                "updatedAt": meta["publishedAt"],
                "tags": meta["tags"],
                "draft": False,
                "featured": meta["featured"],
                "coverImage": cover_image,
                "readingTime": estimate_reading_time(body),
                "status": meta["status"],
                "tech": meta["tech"],
                "links": links,
            }
            write_content_file("projects", slug, frontmatter, body)
        except Exception as exc:  # pragma: no cover - migration fallback for flaky source pages
            print(f"Skipping project {slug}: {exc}")


def migrate_pages() -> None:
    clear_existing_mdx("pages")

    about_body = f"""
My name is David Robert, Im a computer engineer based in Madrid, interested in Big Data, Robotics, Funcional Programing, Machine Learning, Artificial Intelligence, Quantum Computing, Game Development and Technology in general.

This new site keeps the work from my previous personal website, but reorganized into a cleaner structure with projects, articles, contact details and an AI layer on top.

The original homepage closed with a simple line that still feels accurate:

> long live the robozs!
""".strip()

    about_frontmatter = {
        "title": "Sobre mí",
        "description": "David Robert, computer engineer based in Madrid, interested in data, robotics, AI, quantum computing and game development.",
        "slug": "about",
        "publishedAt": "2024-01-01",
        "updatedAt": str(date.today()),
        "tags": ["about", "personal", "madrid", "computer-engineering"],
        "draft": False,
        "featured": True,
        "coverImage": "",
        "readingTime": estimate_reading_time(about_body),
    }
    write_content_file("pages", "about", about_frontmatter, about_body)

    contact_links = [
        ("Instagram", "https://www.instagram.com/rustyroboz/"),
        ("GitHub", "https://github.com/MrRobert91"),
        ("LinkedIn", "https://www.linkedin.com/in/david-robert/"),
        ("Medium", "https://medium.com/@rustyroboz"),
    ]
    contact_lines = [f"- [{label}]({href})" for label, href in contact_links]
    contact_body = (
        "Hi, I'am David! You can find me here:\n\n"
        + "\n".join(contact_lines)
        + "\n\n"
        + "## Personal chatbot\n\n"
        + "Welcome to My Personal Chatbot Powered by ChatGPT.\n\n"
        + "This chatbot is designed to provide you with quick and informative responses to your questions about me, my projects, and my work.\n\n"
        + "It has been trained on information from my projects and experiences, ensuring that you receive accurate and relevant answers. Whether you're curious about my background, interested in my latest projects, or seeking insights into the world of AI and technology, this chatbot is here to assist you.\n\n"
        + "[Datascientist / Developer]\n\n"
        + "The one next to the horse"
    )

    contact_frontmatter = {
        "title": "Contacto",
        "description": "Social links, profile context and the original contact copy from the previous Rustyroboz website.",
        "slug": "contact",
        "publishedAt": "2024-01-01",
        "updatedAt": str(date.today()),
        "tags": ["contact", "social", "profile"],
        "draft": False,
        "featured": True,
        "coverImage": "",
        "readingTime": estimate_reading_time(contact_body),
    }
    write_content_file("pages", "contact", contact_frontmatter, contact_body)


def clear_notes() -> None:
    clear_existing_mdx("notes")


def main() -> None:
    migrate_pages()
    try:
        article_index = migrate_articles()
    except requests.RequestException:
        article_index = {}
    migrate_projects(article_index)
    clear_notes()
    print("Legacy content migration completed.")


if __name__ == "__main__":
    main()
