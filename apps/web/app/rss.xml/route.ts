import { NextResponse } from "next/server";
import { getCollection, getContentHref } from "@/lib/content";
import { getLocale } from "@/lib/i18n/server";

export async function GET() {
  const locale = await getLocale();
  const articles = await getCollection("articles", locale);

  const items = articles
    .map(
      (article) => `
        <item>
          <title><![CDATA[${article.title}]]></title>
          <description><![CDATA[${article.description}]]></description>
          <link>https://rustyroboz.dev${getContentHref(article)}</link>
          <guid>https://rustyroboz.dev${getContentHref(article)}</guid>
          <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>David Robert</title>
        <description>${locale === "es" ? "Artículos sobre sistemas, IA y desarrollo de producto." : "Articles about systems, AI, and product work."}</description>
        <language>${locale}</language>
        <link>https://rustyroboz.dev</link>
        ${items}
      </channel>
    </rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
