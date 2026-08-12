import { describe, expect, it } from "vitest";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as aboutMetadata } from "@/app/about/page";
import { metadata as articlesMetadata } from "@/app/articles/page";
import { generateMetadata as articleMetadata } from "@/app/articles/[slug]/page";
import { generateMetadata as projectMetadata } from "@/app/projects/[slug]/page";
import { generateMetadata as tagMetadata } from "@/app/tags/[tag]/page";

describe("route metadata", () => {
  it("defines a branded title template and specific static titles", () => {
    expect(rootMetadata.title).toEqual({
      default: "David Robert | AI Engineer · Computer Engineer",
      template: "%s | Rusty Roboz Labs",
    });
    expect(aboutMetadata.title).toBe("About");
    expect(articlesMetadata.title).toBe("Articles");
  });

  it("uses the editorial title for articles and projects", async () => {
    const article = await articleMetadata({
      params: Promise.resolve({ slug: "cuando-los-humanos-trabajan-para-los-agentes-como-nacio-el-autor-material" }),
    });
    const project = await projectMetadata({ params: Promise.resolve({ slug: "technical-interview-chatbot" }) });

    expect(article.title).toMatch(/Cuando los humanos trabajan/);
    expect(project.title).toBe("Technical Interview Chatbot");
  });

  it("provides safe titles for missing content and tags", async () => {
    await expect(articleMetadata({ params: Promise.resolve({ slug: "missing" }) })).resolves.toMatchObject({
      title: "Article not found",
    });
    await expect(tagMetadata({ params: Promise.resolve({ tag: "agentic-ai" }) })).resolves.toMatchObject({
      title: "Tag: agentic-ai",
    });
  });
});
