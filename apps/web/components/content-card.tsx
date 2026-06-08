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
    <article className="group relative h-full border border-border bg-paper-2/80 shadow-paper transition-transform duration-200 hover:-translate-y-1">
      <Tape angle={-5} height={16} style={{ top: -9, left: 28 }} width={70} />
      {item.coverImage ? (
        <Link className="block border-b border-border" href={href}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={item.title}
            className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            src={item.coverImage}
          />
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{item.collection}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.readingTime}</span>
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
          <Link className="inline-flex items-center gap-1.5 transition-colors hover:text-accent" href={href}>
            {item.title}
            <ArrowUpRight className="size-4" />
          </Link>
        </h3>
        <p className="font-serif text-sm leading-6 text-muted-foreground">{item.description}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              className="border border-border bg-background/50 px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] text-foreground/70"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {new Date(item.publishedAt).toLocaleDateString("en-US")}
          </span>
          <Link className="font-hand text-lg text-accent-deep hover:text-accent" href={href}>
            see notes →
          </Link>
        </div>
      </div>
    </article>
  );
}
