import { describe, expect, it } from "vitest";
import { getCollection, getItemBySlug, getRelatedContent, getTagIndex } from "@/lib/content";

describe("content loader", () => {
  it("loads published projects from MDX", async () => {
    const projects = await getCollection("projects");
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0].collection).toBe("projects");
    expect(projects.some((project) => project.slug === "susbeer-vr-experience")).toBe(true);
    // Projects are sorted newest-first by publishedAt.
    expect(new Date(projects[0].publishedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(projects[projects.length - 1].publishedAt).getTime(),
    );
  });

  it("resolves content by slug", async () => {
    const article = await getItemBySlug("articles", "de-mvp-cogiendo-polvo-a-google-play-la-resurreccion-de-cartastrofe");
    expect(article.title).toContain("Cartastrofe");
    expect(article.tags).toContain("google-play-store");
  });

  it("builds a tag index across collections", async () => {
    const tags = await getTagIndex();
    expect(tags.get("ai-art")).toBeDefined();
    expect(tags.get("ai-art")?.length).toBeGreaterThan(1);
  });

  it("returns related content across projects and articles", async () => {
    const item = await getItemBySlug("projects", "metroidvania-game-using-ai-generated-art");
    const related = await getRelatedContent(item, 3);
    expect(related.some((entry) => entry.collection === "articles" && entry.slug === "metroidvania-game-using-ai-generated-art")).toBe(
      true,
    );
  });
});
