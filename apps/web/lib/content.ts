import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const collections = [
  "articles",
  "projects",
  "notes",
  "pages",
  "tutorials",
  "talks",
  "fiction",
] as const;

export type CollectionName = (typeof collections)[number];

type CommonFrontmatter = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  coverImage: string;
  readingTime: string;
};

type ProjectFrontmatter = CommonFrontmatter & {
  status?: "planned" | "active" | "completed" | "archived";
  tech?: string[];
  links?: {
    github?: string;
    demo?: string;
    article?: string;
    video?: string;
  };
};

type NoteFrontmatter = CommonFrontmatter & {
  series?: string;
  related?: string[];
};

type PageFrontmatter = CommonFrontmatter;

export type ContentFrontmatter = ProjectFrontmatter | NoteFrontmatter | PageFrontmatter;

export type ContentItem = ContentFrontmatter & {
  body: string;
  collection: CollectionName;
  sourcePath: string;
  excerpt: string;
};

function getContentRoot() {
  const candidates = [
    process.env.CONTENT_ROOT,
    path.resolve(process.cwd(), "content"),
    path.resolve(process.cwd(), "../../content"),
  ].filter(Boolean) as string[];

  const match = candidates.find((candidate) => {
    try {
      return existsSync(candidate);
    } catch {
      return false;
    }
  });

  if (!match) {
    throw new Error("Unable to resolve the content root.");
  }

  return match;
}

async function readDirectory(collection: CollectionName) {
  const directory = path.join(getContentRoot(), collection);
  if (!existsSync(directory)) {
    return [];
  }
  const entries = await fs.readdir(directory);
  return entries.filter((entry) => entry.endsWith(".mdx"));
}

function assertCommonFrontmatter(frontmatter: Record<string, unknown>, filePath: string): asserts frontmatter is CommonFrontmatter {
  const requiredKeys = [
    "title",
    "description",
    "slug",
    "publishedAt",
    "updatedAt",
    "tags",
    "draft",
    "featured",
    "coverImage",
    "readingTime",
  ] as const;

  for (const key of requiredKeys) {
    if (frontmatter[key] === undefined) {
      throw new Error(`Missing frontmatter key "${key}" in ${filePath}`);
    }
  }
}

function normalizeFrontmatter(
  collection: CollectionName,
  raw: Record<string, unknown>,
  filePath: string,
): ContentFrontmatter {
  assertCommonFrontmatter(raw, filePath);
  const frontmatter = raw as Record<string, unknown> & CommonFrontmatter;

  const base = {
    title: String(frontmatter.title),
    description: String(frontmatter.description),
    slug: String(frontmatter.slug),
    publishedAt: String(frontmatter.publishedAt),
    updatedAt: String(frontmatter.updatedAt),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map((tag) => String(tag).toLowerCase()) : [],
    draft: Boolean(frontmatter.draft),
    featured: Boolean(frontmatter.featured),
    coverImage: String(frontmatter.coverImage),
    readingTime: String(frontmatter.readingTime),
  };

  if (collection === "projects") {
    return {
      ...base,
      status: frontmatter["status"] as ProjectFrontmatter["status"],
      tech: Array.isArray(frontmatter["tech"]) ? frontmatter["tech"].map((value) => String(value)) : [],
      links:
        typeof frontmatter["links"] === "object" && frontmatter["links"] !== null
          ? (frontmatter["links"] as ProjectFrontmatter["links"])
          : {},
    };
  }

  if (collection === "notes") {
    return {
      ...base,
      series: frontmatter["series"] ? String(frontmatter["series"]) : undefined,
      related: Array.isArray(frontmatter["related"]) ? frontmatter["related"].map((value) => String(value)) : [],
    };
  }

  return base;
}

function buildExcerpt(body: string) {
  return body
    .replace(/[#>*`]/g, "")
    .trim()
    .split("\n")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .slice(0, 180);
}

export async function getCollection<T extends CollectionName>(collection: T): Promise<ContentItem[]> {
  const entries = await readDirectory(collection);

  const items = await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(getContentRoot(), collection, entry);
      const raw = await fs.readFile(sourcePath, "utf8");
      const { data, content } = matter(raw);
      const normalized = normalizeFrontmatter(collection, data, sourcePath);

      return {
        ...normalized,
        body: content.trim(),
        collection,
        sourcePath,
        excerpt: buildExcerpt(content),
      } satisfies ContentItem;
    }),
  );

  return items
    .filter((item) => !item.draft)
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

export async function getItemBySlug<T extends CollectionName>(collection: T, slug: string) {
  const collectionItems = await getCollection(collection);
  const item = collectionItems.find((entry) => entry.slug === slug);

  if (!item) {
    throw new Error(`No content found for ${collection}/${slug}`);
  }

  return item;
}

export async function getFeaturedItems(collection: Extract<CollectionName, "articles" | "projects" | "notes">, limit = 3) {
  const items = await getCollection(collection);
  return items.filter((item) => item.featured).slice(0, limit);
}

export async function getAllPublicEntries() {
  const activeCollections = collections.filter((collection) => collection !== "pages");
  const entries = await Promise.all(activeCollections.map((collection) => getCollection(collection)));
  return entries.flat();
}

export async function getTagIndex() {
  const items = await getAllPublicEntries();
  const map = new Map<string, ContentItem[]>();

  for (const item of items) {
    for (const tag of item.tags) {
      const bucket = map.get(tag) ?? [];
      bucket.push(item);
      map.set(tag, bucket);
    }
  }

  return map;
}

export async function getEntriesByTag(tag: string) {
  const normalizedTag = tag.toLowerCase();
  const index = await getTagIndex();
  return (index.get(normalizedTag) ?? []).sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
}

export async function getRelatedContent(item: ContentItem, limit = 3) {
  const items = await getAllPublicEntries();
  const related = items
    .filter((candidate) => `${candidate.collection}:${candidate.slug}` !== `${item.collection}:${item.slug}`)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.filter((tag) => item.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);

  return related;
}

export function getContentHref(item: Pick<ContentItem, "collection" | "slug">) {
  if (item.collection === "pages") {
    return item.slug === "about" ? "/about" : `/${item.slug}`;
  }

  return `/${item.collection}/${item.slug}`;
}
