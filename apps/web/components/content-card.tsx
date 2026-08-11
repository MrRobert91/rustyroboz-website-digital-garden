import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Tape } from "@/components/notebook";
import { getContentHref, type ContentItem } from "@/lib/content";

type ContentCardProps = {
  item: ContentItem;
};

export function ContentCard({ item }: ContentCardProps) {
  const href = getContentHref(item);
  return (
    <article
      className="group relative h-full border border-border bg-paper-2/80 shadow-paper transition-transform duration-200 hover:-translate-y-1 focus-within:outline focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-[hsl(var(--focus))]"
      lang={item.language}
    >
      <Tape angle={-5} height={16} style={{ top: -9, left: 28 }} width={70} />
      <Link aria-label={item.title} className="block h-full" href={href}>
        {item.coverImage ? (
          <div className="border-b border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            src={item.coverImage}
          />
          </div>
        ) : null}
        <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-sm uppercase tracking-[0.16em] text-accent">{item.collection}</span>
          <span className="font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">{item.readingTime}</span>
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
          <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-accent">
            {item.title}
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </h3>
        <p className="font-serif text-sm leading-6 text-muted-foreground">{item.description}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              className="border border-border bg-background/50 px-2.5 py-1 font-mono text-sm tracking-[0.12em] text-foreground/70"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
          <span className="font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("en-US")}
          </span>
          <span className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-accent-deep group-hover:underline">
            see notes →
          </span>
        </div>
        </div>
      </Link>
    </article>
  );
}
