import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Doodle, InkStamp, Squiggle, Sticky, Tape } from "@/components/notebook";
import { getContentHref, type ContentItem } from "@/lib/content";
import { projectStatusStamp } from "@/lib/site-config";

const DOODLE_KINDS = ["gear", "bolt", "spark", "star"] as const;
const CARD_ROTATE = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.75deg]"];

type ProjectsPrototypesProps = {
  items: ContentItem[];
  /** Show the page-style header (used on /projects, hidden on the home teaser). */
  withHeader?: boolean;
};

function PrototypeCard({ item, index }: { item: ContentItem & { tech?: string[]; status?: string }; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  const stamp = (item.status && projectStatusStamp[item.status]) || "EXPERIMENT";
  const tags = item.tech?.length ? item.tech : item.tags;
  const href = getContentHref(item);

  return (
    <div
      className={`relative border border-border bg-paper-2 p-7 shadow-paper ${CARD_ROTATE[index % CARD_ROTATE.length]}`}
    >
      <Tape angle={index % 2 ? 5 : -7} height={18} style={{ top: -10, [index % 2 ? "right" : "left"]: 30 }} width={78} />
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-accent">EXP-{num}</span>
        <InkStamp angle={-4} label={stamp} style={{ fontSize: 10, padding: "5px 10px" }} />
      </div>

      <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
        <Link className="transition-colors hover:text-accent" href={href}>
          {item.title}
        </Link>
      </h3>

      {/* cover image, with a technical-drawing placeholder fallback */}
      <Link
        aria-label={`Open ${item.title}`}
        className="relative mt-4 grid h-32 place-items-center overflow-hidden border border-dashed border-[rgba(150,110,70,0.5)] bg-[#f3ecde] dark:bg-foreground/5"
        href={href}
        style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(150,110,70,0.12) 8px 9px)" }}
      >
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={item.title}
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            src={item.coverImage}
          />
        ) : (
          <Doodle color="hsl(var(--accent-deep))" kind={DOODLE_KINDS[index % DOODLE_KINDS.length]} size={56} />
        )}
        <span className="absolute bottom-1.5 right-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(60,40,20,0.5)]">
          FIG.{num}
        </span>
      </Link>

      <p className="mt-4 line-clamp-3 font-serif text-base leading-relaxed text-foreground/75">{item.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {tags.slice(0, 4).map((tag) => (
          <span
            className="border border-border bg-background/50 px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] text-foreground/75"
            key={tag}
          >
            {tag}
          </span>
        ))}
        <Link className="ml-auto font-hand text-lg text-accent-deep hover:text-accent" href={href}>
          see notes →
        </Link>
      </div>
    </div>
  );
}

export function ProjectsPrototypes({ items, withHeader = true }: ProjectsPrototypesProps) {
  return (
    <section className="dotted-paper relative overflow-hidden border-y border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        {withHeader ? (
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§03 — Prototypes</p>
              <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
                Projects <span className="font-hand font-normal text-accent">&amp; messes</span>
              </h2>
              <div className="mt-3">
                <Squiggle color="hsl(var(--accent))" height={14} seed={4} strokeWidth={3} width={320} />
              </div>
            </div>
            <Sticky angle={5} className="hidden sm:block" color="#c8e0a8" style={{ width: 200 }}>
              ★ pick the ones that
              <br />
              smell like solder
            </Sticky>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Selected work</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Projects <span className="font-hand font-normal text-accent">&amp; messes</span>
            </h2>
          </div>
        )}

        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal delay={(index % 2) * 0.06} key={`${item.collection}-${item.slug}`}>
              <PrototypeCard index={index} item={item} />
            </Reveal>
          ))}
        </div>

        {withHeader ? (
          <p className="mt-12 font-hand text-lg text-muted-foreground">+ a dozen more in the closet drawer</p>
        ) : null}
      </div>
    </section>
  );
}
