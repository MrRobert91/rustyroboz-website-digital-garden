import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ContentCard } from "@/components/content-card";
import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import type { ContentItem } from "@/lib/content";

function item(slug: string, title: string): ContentItem {
  return {
    body: "",
    collection: "projects",
    coverImage: `/images/${slug}.jpg`,
    description: "A concise project description.",
    draft: false,
    excerpt: "A concise project description.",
    featured: true,
    language: "en",
    publishedAt: "2026-01-01",
    readingTime: "2 min read",
    slug,
    sourcePath: `content/projects/${slug}.mdx`,
    tags: ["AI"],
    tech: ["TypeScript"],
    title,
    type: "project",
    updatedAt: "2026-01-01",
  };
}

describe("content card links", () => {
  it("uses one named destination for a ContentCard", () => {
    const project = item("accessdoc", "AccessDoc");
    const view = render(<ContentCard item={project} />);
    const card = view.container.querySelector("article");

    expect(within(card as HTMLElement).getAllByRole("link")).toHaveLength(1);
    expect(within(card as HTMLElement).getByRole("link", { name: "AccessDoc" })).toHaveAttribute(
      "href",
      "/projects/accessdoc",
    );
    expect(card?.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("creates one keyboard stop per prototype card", () => {
    render(<ProjectsPrototypes items={[item("first", "First project"), item("second", "Second project")]} />);

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "First project" })).toHaveAttribute("href", "/projects/first");
    expect(screen.getByRole("link", { name: "Second project" })).toHaveAttribute("href", "/projects/second");
  });
});
