import type { ContentItem } from "@/lib/content";

export function getContentHref(item: Pick<ContentItem, "collection" | "slug">) {
  if (item.collection === "pages") return item.slug === "about" ? "/about" : `/${item.slug}`;
  return `/${item.collection}/${item.slug}`;
}
