import type { MetadataRoute } from "next";
import { collections, getCollection, getContentHref } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rustyroboz.dev";
  const contentCollections = collections.filter((collection) => collection !== "tutorials" && collection !== "talks" && collection !== "fiction");
  const entries = await Promise.all(contentCollections.map((collection) => getCollection(collection)));

  const routes = [
    "/",
    "/about",
    "/contact",
    "/projects",
    "/articles",
    "/notes",
    "/lab",
    "/chat",
  ];

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...entries.flat().map((item) => ({
      url: `${baseUrl}${getContentHref(item)}`,
      lastModified: new Date(item.updatedAt),
    })),
  ];
}
