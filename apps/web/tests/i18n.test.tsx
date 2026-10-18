import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { LanguageProvider, Text } from "@/components/language-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatExperience } from "@/components/chat-experience";
import { getCollection, getItemBySlug, getRelatedContent } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator } from "@/lib/i18n";

type Translation = {
  title: string;
  description: string;
  body: string;
  sourceHash: string;
  media: Record<string, string>[];
};
const root = resolve(process.cwd(), "../../content");
const sourceFiles = ["articles", "projects", "pages", "notes"].flatMap((collection) => {
  try {
    return readdirSync(resolve(root, collection))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => `${collection}/${f}`);
  } catch {
    return [];
  }
});
const urls = (text: string) => text.match(/https?:\/\/[^\s<>"\)\]]+|\/(?:images|videos|downloads)\/[\w./-]+/g) ?? [];
const code = (text: string) => text.match(/```[\s\S]*?```|`[^`\n]+`/g) ?? [];
type MarkdownNode = {
  type: string;
  url?: string;
  position?: { start: { offset?: number } };
  children?: MarkdownNode[];
};
async function explicitLinks(source: string) {
  const links: string[] = [];
  await serialize(source, {
    mdxOptions: {
      remarkPlugins: [
        remarkGfm,
        () => (tree: MarkdownNode) => {
          const visit = (node: MarkdownNode) => {
            const offset = node.position?.start.offset ?? 0;
            if ((node.type === "link" || node.type === "image") && /^!?\[/.test(source.slice(offset)))
              links.push(`${node.type}:${node.url}`);
            node.children?.forEach(visit);
          };
          visit(tree);
        },
      ],
    },
  });
  return links;
}

describe("bilingual site", () => {
  it("translates the text boundaries used by Server Components", () => {
    const view = render(
      <LanguageProvider locale="es">
        <p>
          <Text>Timeline</Text>
        </p>
        <p>
          <Text>9 YRS IN TECH</Text>
        </p>
        <p>
          <Text>AI Lab</Text>
        </p>
      </LanguageProvider>,
    );
    expect(screen.getByText("Trayectoria")).toBeInTheDocument();
    expect(screen.getByText("9 AÑOS EN TECNOLOGÍA")).toBeInTheDocument();
    expect(screen.getByText("Laboratorio de IA")).toBeInTheDocument();
    view.unmount();
    render(
      <LanguageProvider locale="en">
        <Text>No encontré esa página.</Text>
      </LanguageProvider>,
    );
    expect(screen.getByText("Page not found.")).toBeInTheDocument();
  });
  for (const locale of ["en", "es"] as const) {
    it(`covers and compiles every published document in ${locale}, preserving URLs, examples and media`, async () => {
      const catalog = JSON.parse(readFileSync(resolve(root, "translations", `${locale}.json`), "utf8")) as Record<
        string,
        Translation
      >;
      const keys: string[] = [];
      for (const file of sourceFiles) {
        const raw = readFileSync(resolve(root, file), "utf8").replace(/\r\n/g, "\n");
        const { data, content } = matter(raw);
        if (data.draft) continue;
        const key = file.replace(/\.mdx$/, "");
        keys.push(key);
        const translated = catalog[key];
        expect(translated, key).toBeDefined();
        expect(translated.sourceHash, `stale ${locale} translation: ${key}`).toBe(
          createHash("sha256").update(raw).digest("hex"),
        );
        expect(translated.title.trim(), key).not.toBe("");
        expect(translated.description.trim(), key).not.toBe("");
        expect(translated.body, key).not.toMatch(/ZXQ\d+QXZ|ZXBLANK|�/);
        expect(urls(translated.body), key).toEqual(urls(content));
        expect(code(translated.body), key).toEqual(code(content));
        expect(await explicitLinks(translated.body), key).toEqual(await explicitLinks(content));
        for (const [i, media] of (data.media ?? []).entries()) {
          for (const field of ["src", "poster", "id", "type"])
            expect(translated.media[i][field], `${key}: ${field}`).toBe(media[field]);
        }
        await expect(
          serialize(translated.body, { mdxOptions: { remarkPlugins: [remarkGfm] } }),
          key,
        ).resolves.toBeDefined();
      }
      expect(Object.keys(catalog).sort()).toEqual(keys.sort());
    }, 30_000);
  }

  it("uses Spanish for navigation, accessible controls and chat suggestions", () => {
    render(
      <LanguageProvider locale="es">
        <SiteHeader />
        <ChatExperience />
      </LanguageProvider>,
    );
    expect(screen.getAllByRole("link", { name: "Proyectos" }).length).toBe(2);
    expect(screen.getAllByRole("button", { name: "Switch to English" }).length).toBe(2);
    expect(screen.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();
    expect(screen.getByLabelText("Pregunta")).toHaveAttribute("placeholder", expect.stringContaining("Hermes"));
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /¿Qué.*LLMs/ })).toBeInTheDocument();
  });

  it("loads Spanish content and related cards with identical canonical codes and links", async () => {
    const [en, es] = await Promise.all([getCollection("projects", "en"), getCollection("projects", "es")]);
    expect(es.map((p) => [p.slug, p.catalogCode, p.links])).toEqual(en.map((p) => [p.slug, p.catalogCode, p.links]));
    expect(es.every((p) => p.language === "es")).toBe(true);
    const article = await getItemBySlug("articles", "hermes-agent-en-un-vps-de-hetzner-con-openrouter", "en");
    expect(article.title).toBe("Hermes Agent on a Hetzner VPS with OpenRouter");
    expect((await getRelatedContent(es[0])).every((p) => p.language === "es")).toBe(true);
  });

  it("falls back to English for missing or unsupported preferences", async () => {
    expect(await getLocale()).toBe("en");
    vi.mocked(cookies).mockResolvedValueOnce({ get: () => ({ value: "fr" }) } as never);
    expect(await getLocale()).toBe("en");
    vi.mocked(cookies).mockResolvedValueOnce({ get: () => ({ value: "es" }) } as never);
    expect(await getLocale()).toBe("es");
    expect(createTranslator("es")("OpenRouter")).toBe("OpenRouter");
    expect(createTranslator("es")("https://example.com/path")).toBe("https://example.com/path");
  });
});
