import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Doodle, Squiggle, Tape } from "@/components/notebook";
import { getContentHref, type ContentItem } from "@/lib/content";

const DOODLE_KINDS = ["gear", "bolt", "spark", "star"] as const;

/** Articles as a maker's logbook (bitácora). */
export function Bitacora({ items }: { items: ContentItem[] }) {
  return (
    <section className="dotted-paper relative overflow-hidden border-y border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Writing</p>
          <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
            Bitácora <span className="font-hand font-normal text-accent">(logbook)</span>
          </h2>
          <Squiggle className="mt-3" color="hsl(var(--accent))" height={12} seed={7} strokeWidth={2.5} width={280} />
          <p className="mt-4 font-serif text-lg leading-relaxed text-foreground/75">
            Notes from the bench: applied AI, software delivery, and experiments written up as I go.
          </p>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal delay={(index % 2) * 0.06} key={`${item.collection}-${item.slug}`}>
              <Link
                className="group relative block border border-border bg-paper-2/80 p-7 shadow-paper transition-transform duration-200 hover:-translate-y-1"
                href={getContentHref(item)}
              >
                <Tape angle={index % 2 ? 4 : -5} height={16} style={{ top: -9, left: 26 }} width={70} />
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString("en-US")}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.readingTime}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-accent">
                  {item.title}
                  <ArrowUpRight className="ml-1 inline size-5 align-text-top" />
                </h3>

                {/* cover image, with a technical-drawing placeholder fallback */}
                <div
                  className="relative mt-4 grid h-36 place-items-center overflow-hidden border border-dashed border-[rgba(150,110,70,0.5)] bg-[#f3ecde] dark:bg-foreground/5"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(150,110,70,0.12) 8px 9px)" }}
                >
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={item.title}
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                      src={item.coverImage}
                    />
                  ) : (
                    <Doodle color="hsl(var(--accent-deep))" kind={DOODLE_KINDS[index % DOODLE_KINDS.length]} size={56} />
                  )}
                </div>

                <p className="mt-4 line-clamp-2 font-serif text-base leading-relaxed text-foreground/75">
                  {item.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      className="border border-border bg-background/50 px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] text-foreground/70"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link className="font-hand text-2xl text-accent-deep hover:text-accent" href="/articles">
            read the whole logbook →
          </Link>
        </div>
      </div>
    </section>
  );
}
