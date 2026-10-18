"use client";

import { useTranslation } from "@/components/language-provider";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tape } from "@/components/notebook";
import type { ContentItem } from "@/lib/content";
import { getContentHref } from "@/lib/content-href";

type ContentCardProps = {
  item: ContentItem;
};

export function ContentCard({ item }: ContentCardProps) {
  const { t, locale } = useTranslation();
  const href = getContentHref(item);
  return (
    <article
      className="hover-card group relative h-full border border-border bg-paper-2/80 shadow-paper transition-transform duration-200 focus-within:outline focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-[hsl(var(--focus))]"
      lang={item.language}
    >
      <Tape angle={-5} height={16} style={{ top: -9, left: 28 }} width={70} />
      <Link aria-label={t(item.title)} className="block h-full" href={href}>
        {item.coverImage ? (
          <div className="border-b border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={t("")}
              className="hover-image-target aspect-[16/10] w-full object-cover transition-transform duration-300"
              src={item.coverImage}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm uppercase tracking-[0.16em] text-accent">{t(item.collection)}</span>
            <span className="font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">
              {t(item.readingTime)}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-accent">
              {t(item.title)}
              <ArrowUpRight aria-hidden className="size-4" />
            </span>
          </h2>
          <p className="font-serif text-sm leading-6 text-muted-foreground">{t(item.description)}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                className="border border-border bg-background/50 px-2.5 py-1 font-mono text-sm tracking-[0.12em] text-foreground/70"
                key={tag}
              >
                {t(tag)}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
            <span className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">
              {t(new Date(item.publishedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { timeZone: "UTC" }))}
            </span>
            <span className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-accent-deep group-hover:underline">
              {t("see notes →")}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
