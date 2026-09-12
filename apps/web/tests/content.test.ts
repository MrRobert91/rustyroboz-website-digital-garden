import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
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

  it("assigns canonical project and experiment codes from the full catalog", async () => {
    const projects = await getCollection("projects");
    const learningFactory = projects.find((project) => project.slug === "learning-ai-factory");
    const qiskitPrep = projects.find((project) => project.slug === "qiskit-certification-prep");

    expect(learningFactory?.catalogCode).toBe("PROJ-15");
    expect(qiskitPrep?.catalogCode).toBe("EXP-15");
    expect(new Set(projects.map((project) => project.catalogCode)).size).toBe(projects.length);
  });

  it("resolves content by slug", async () => {
    const article = await getItemBySlug("articles", "de-mvp-cogiendo-polvo-a-google-play-la-resurreccion-de-cartastrofe");
    expect(article.title).toContain("Cartastrofe");
    expect(article.tags).toContain("google-play-store");
  });

  it("loads El autor material with its published metadata and download link", async () => {
    const article = await getItemBySlug(
      "articles",
      "cuando-los-humanos-trabajan-para-los-agentes-como-nacio-el-autor-material",
    );

    expect(article.title).toContain("El autor material");
    expect(article.language).toBe("es");
    expect(article.coverImage).toContain("el-autor-material.webp");
    expect(article.body).toContain("/downloads/el-autor-material.pdf");
  });

  it("requires an explicit supported language on every published entry", async () => {
    const collections = await Promise.all([
      getCollection("articles"),
      getCollection("projects"),
      getCollection("notes"),
      getCollection("pages"),
    ]);
    const entries = collections.flat();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.language === "en" || entry.language === "es")).toBe(true);
    expect(
      entries.find((entry) => entry.slug === "hermes-agent-en-un-vps-de-hetzner-con-openrouter")?.language,
    ).toBe("es");
  });

  it("loads the Learning AI Factory case study with its local video sample", async () => {
    const project = await getItemBySlug("projects", "learning-ai-factory");

    expect(project.title).toContain("AI Learning Factory");
    expect((project.links as Record<string, string>).GitHub).toBe("https://github.com/MrRobert91/Learning-AI-Factory");
    expect(project.media).toContainEqual(
      expect.objectContaining({ type: "video", src: "/videos/nlp-course-sample.mp4" }),
    );
    expect(project.body).toContain("FastAPI");
    expect(project.body).toContain("Factoría F5");
  });

  it("loads the Qiskit certification prep prototype with real screenshots", async () => {
    const project = await getItemBySlug("projects", "qiskit-certification-prep");

    expect(project.title).toContain("Qiskit Certification Prep");
    expect((project.links as Record<string, string>).GitHub).toBe(
      "https://github.com/MrRobert91/QuantumComputingGuide",
    );
    expect(project.coverImage).toContain("quantum-computing-guide/01-study-dashboard.png");
    expect(project.body).toContain("68-question mock exam");
    expect(project.body).toContain("04-circuit-playground.png");
  });

  it("loads the enriched project links, stories and local galleries", async () => {
    const [apolo, miraLink, socraticGemma, cuentee, thorRunner] = await Promise.all([
      getItemBySlug("projects", "apolo-vs-zeus"),
      getItemBySlug("projects", "mira-link"),
      getItemBySlug("projects", "socratic-gemma"),
      getItemBySlug("projects", "cuentee"),
      getItemBySlug("projects", "thor-runner"),
    ]);

    expect((apolo.links as Record<string, string>).GitHub).toBe(
      "https://github.com/MrRobert91/juego_zeus_y_apolo",
    );
    expect(apolo.media?.filter((item) => item.type === "image")).toHaveLength(4);
    expect(apolo.body).toContain("two five-year-old children");

    expect((miraLink.links as Record<string, string>).GitHub).toBe("https://github.com/MrRobert91/MiraLink");
    expect(miraLink.media?.filter((item) => item.type === "image")).toHaveLength(4);

    expect((socraticGemma.links as Record<string, string>)["Live app"]).toBe(
      "https://socraticgemma-js7p6v.sliplane.app/",
    );

    expect(cuentee.media?.filter((item) => item.type === "image")).toHaveLength(5);
    expect(cuentee.body).toContain("character sheet");
    expect(cuentee.body).toContain("child-safety evaluation layer");

    expect((thorRunner.links as Record<string, string>)["Play on itch.io"]).toBe(
      "https://rustyroboz.itch.io/thor-runner",
    );
    expect((thorRunner.links as Record<string, string>).GitHub).toBe("https://github.com/MrRobert91/JuegoThor");
    expect(thorRunner.media?.filter((item) => item.type === "image")).toHaveLength(14);
    expect(thorRunner.body).toContain("two five-year-old children");

    for (const project of [apolo, miraLink, cuentee, thorRunner]) {
      for (const item of project.media ?? []) {
        if (item.type === "image" && item.src.startsWith("/")) {
          expect(existsSync(path.join(process.cwd(), "public", item.src.slice(1))), item.src).toBe(true);
        }
      }
    }
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
