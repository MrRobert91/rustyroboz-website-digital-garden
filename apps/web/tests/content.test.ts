import { describe, expect, it } from "vitest";
import { getCollection, getItemBySlug, getRelatedContent, getTagIndex } from "@/lib/content";

describe("content loader", () => {
  it("loads published projects from MDX", async () => {
    const projects = await getCollection("projects");
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toMatchObject({
      slug: "ai-safety-evals-workbench",
      collection: "projects",
    });
  });

  it("resolves content by slug", async () => {
    const article = await getItemBySlug("articles", "spec-driven-delivery-for-ai-products");
    expect(article.title).toContain("Spec-Driven");
    expect(article.tags).toContain("ai");
  });

  it("builds a tag index across collections", async () => {
    const tags = await getTagIndex();
    expect(tags.get("ai")).toBeDefined();
    expect(tags.get("ai")?.length).toBeGreaterThan(1);
  });

  it("returns related content for notes and articles", async () => {
    const item = await getItemBySlug("notes", "thinking-in-public-systems");
    const related = await getRelatedContent(item, 3);
    expect(related.some((entry) => entry.slug === "spec-driven-delivery-for-ai-products")).toBe(true);
  });
});

