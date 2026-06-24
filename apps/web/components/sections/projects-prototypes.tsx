import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Doodle, InkStamp, Squiggle, Tape } from "@/components/notebook";
import { getContentHref, type ContentItem } from "@/lib/content";
import { projectStatusStamp } from "@/lib/site-config";

const DOODLE_KINDS = ["gear", "bolt", "spark", "star"] as const;
// Slight wobble only from `sm` up — on mobile cards stay straight so they keep
// equal left/right margins (the rotation otherwise nudges them off-center).
const CARD_ROTATE = ["sm:-rotate-1", "sm:rotate-1", "sm:-rotate-[0.5deg]", "sm:rotate-[0.75deg]"];

type CardItem = ContentItem & { tech?: string[]; status?: string; type?: "project" | "experiment" };

type ProjectsPrototypesProps = {
  items: ContentItem[];
  /** Show the page-style header (used on /projects, hidden on the home teaser). */
  withHeader?: boolean;
};

/**
 * Number each item within its own type so projects read PROJ-01.. and
 * experiments EXP-01.., oldest first. Items arrive newest-first.
 */
function buildTypeNumbers(items: CardItem[]) {
  const numbers = new Map<string, { prefix: "PROJ" | "EXP"; num: string }>();
  for (const type of ["project", "experiment"] as const) {
    const ofType = items.filter((item) => (item.type ?? "experiment") === type);
    ofType.forEach((item, index) => {
      numbers.set(`${item.collection}:${item.slug}`, {
        prefix: type === "project" ? "PROJ" : "EXP",
        num: String(ofType.length - index).padStart(2, "0"),
      });
    });
  }
  return numbers;
}

function PrototypeCard({
  item,
  index,
  prefix,
  num,
}: {
  item: CardItem;
  index: number;
  prefix: "PROJ" | "EXP";
  num: string;
}) {
  const isProject = (item.type ?? "experiment") === "project";
  // Status stamp is independent of the project/experiment tag; skip it if unset.
  const stamp = item.status ? projectStatusStamp[item.status] : undefined;
  const tags = item.tech?.length ? item.tech : item.tags;
  const href = getContentHref(item);

  // Projects get a slightly stronger frame so they stand out in the mixed grid.
  const frame = isProject
    ? "border-[1.5px] border-accent/35 shadow-soft"
    : "border border-border shadow-paper";

  return (
    <div className={`relative bg-paper-2 p-7 ${frame} ${CARD_ROTATE[index % CARD_ROTATE.length]}`}>
      <Tape angle={index % 2 ? 5 : -7} height={18} style={{ top: -10, [index % 2 ? "right" : "left"]: 30 }} width={78} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            {prefix}-{num}
          </span>
          {isProject ? (
            <span className="bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fdf6ea]">
              Project
            </span>
          ) : (
            <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Experiment
            </span>
          )}
        </div>
        {stamp ? <InkStamp angle={-4} label={stamp} style={{ fontSize: 10, padding: "5px 10px" }} /> : null}
      </div>

      <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
        <Link className="transition-colors hover:text-accent" href={href}>
          {item.title}
        </Link>
      </h3>

      {/* cover image, with a technical-drawing placeholder fallback */}
      <Link
        aria-label={`Open ${item.title}`}
        className="relative mt-4 grid h-32 place-items-center overflow-hidden border border-dashed border-[rgba(120,120,130,0.4)] bg-[#f4f1ea] dark:bg-foreground/5"
        href={href}
        style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 8px, rgba(120,120,130,0.1) 8px 9px)" }}
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
        <span className="absolute bottom-1.5 right-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(60,60,70,0.5)]">
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
          View project →
        </Link>
      </div>
    </div>
  );
}

export function ProjectsPrototypes({ items, withHeader = true }: ProjectsPrototypesProps) {
  const cards = items as CardItem[];
  const numbers = buildTypeNumbers(cards);

  return (
    <section className="dotted-paper relative overflow-hidden border-y border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        {withHeader ? (
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§03 — Work</p>
              <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
                Projects <span className="font-hand font-normal text-accent">&amp; Experiments</span>
              </h2>
              <div className="mt-3">
                <Squiggle color="hsl(var(--accent))" height={14} seed={4} strokeWidth={3} width={320} />
              </div>
            </div>
            {/* Legend so the two card styles read clearly. */}
            <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="bg-accent px-2 py-0.5 text-[10px] font-semibold text-[#fdf6ea]">Project</span>
                polished work
              </span>
              <span className="flex items-center gap-2">
                <span className="border border-border px-2 py-0.5 text-[10px]">Experiment</span>
                short build
              </span>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Selected work</p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Projects <span className="font-hand font-normal text-accent">&amp; Experiments</span>
            </h2>
          </div>
        )}

        <div className="mt-12 grid gap-7 md:grid-cols-2">
          {cards.map((item, index) => {
            const meta = numbers.get(`${item.collection}:${item.slug}`) ?? { prefix: "EXP" as const, num: "00" };
            return (
              <Reveal delay={(index % 2) * 0.06} key={`${item.collection}-${item.slug}`}>
                <PrototypeCard index={index} item={item} num={meta.num} prefix={meta.prefix} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
