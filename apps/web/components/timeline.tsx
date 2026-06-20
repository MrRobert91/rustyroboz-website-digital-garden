import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { InkCircle, Tape } from "@/components/notebook";
import { TimelineMedia } from "@/components/timeline-media";
import {
  formatDuration,
  formatRange,
  groupTimelineByEra,
  isOngoing,
  kindLabel,
  spanMonths,
  type TimelineEntry,
  type TimelineEra,
  type TimelineLink,
} from "@/lib/timeline";

const CARD_ROTATE = ["-rotate-[0.4deg]", "rotate-[0.5deg]", "-rotate-[0.3deg]", "rotate-[0.6deg]"];

const ERA_LABEL_CLASS = "font-display text-2xl font-bold uppercase tracking-tight text-foreground/35 sm:text-3xl";

/** Compact "era" label drawn big and faded next to each entry. */
function eraLabel(entry: TimelineEntry) {
  const startYear = entry.start.slice(0, 4);
  if (!entry.end) {
    return startYear;
  }
  const endYear = entry.end === "present" ? "now" : entry.end.slice(0, 4);
  return startYear === endYear ? startYear : `${startYear}–${endYear}`;
}

/** Min-height (px) so longer roles visibly occupy more vertical space. */
function entryMinHeight(entry: TimelineEntry) {
  const months = spanMonths(entry);
  if (months <= 0) {
    return undefined;
  }
  return Math.min(330, 150 + months * 4);
}

function TimelineLinkChip({ link }: { link: TimelineLink }) {
  const isInternal = link.href.startsWith("/");
  const className =
    "inline-flex items-center gap-1 border border-dashed border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:border-accent hover:text-accent";

  if (isInternal) {
    return (
      <Link className={className} href={link.href}>
        {link.label} →
      </Link>
    );
  }
  return (
    <a className={className} href={link.href} rel="noreferrer" target="_blank">
      {link.label} ↗
    </a>
  );
}

/** Inked dot drawn on the timeline rail. */
function EntryDot({ entry, index, className }: { entry: TimelineEntry; index: number; className?: string }) {
  const ranged = Boolean(entry.end);
  return (
    <span className={className}>
      <InkCircle color="hsl(var(--accent))" seed={index + 1} size={ranged ? 34 : 24} strokeWidth={ranged ? 2.5 : 2}>
        <span className={`block rounded-full bg-accent ${ranged ? "size-3" : "size-2"}`} />
      </InkCircle>
    </span>
  );
}

/** The paper card for a single timeline entry. */
function TimelineCard({
  entry,
  index,
  tapeSide = "left",
}: {
  entry: TimelineEntry;
  index: number;
  tapeSide?: "left" | "right";
}) {
  const ranged = Boolean(entry.end);
  const ongoing = isOngoing(entry);
  const duration = formatDuration(entry);
  const minHeight = entryMinHeight(entry);

  return (
    <div
      className={`relative flex flex-col justify-between border border-border bg-paper-2/85 text-left shadow-paper ${
        ranged ? "p-6 lg:p-7" : "p-5"
      } ${CARD_ROTATE[index % CARD_ROTATE.length]}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <Tape angle={tapeSide === "right" ? 4 : -6} height={16} style={{ top: -9, [tapeSide]: 22 }} width={64} />
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="text-accent-deep">{kindLabel(entry.kind)}</span>
          <span aria-hidden>·</span>
          <span>{formatRange(entry)}</span>
          {duration ? (
            <>
              <span aria-hidden>·</span>
              <span>{duration}</span>
            </>
          ) : null}
          {ongoing ? <span className="font-semibold text-accent">● now</span> : null}
        </div>
        <h3 className={`mt-3 font-display font-bold text-foreground ${ranged ? "text-2xl lg:text-3xl" : "text-2xl"}`}>
          {entry.title}
        </h3>
        {entry.org ? <p className="mt-1 font-hand text-xl text-accent-deep">{entry.org}</p> : null}
        <p className="mt-2 font-serif text-base leading-relaxed text-foreground/75">{entry.description}</p>
        {entry.media?.length ? <TimelineMedia items={entry.media} title={entry.title} /> : null}
      </div>
      {entry.links?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {entry.links.map((link) => (
            <TimelineLinkChip key={`${entry.id}-${link.href}`} link={link} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compact two-sided timeline (home preview)                          */
/* ------------------------------------------------------------------ */

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  // Work experience sits on the LEFT of the rail; everything else on the RIGHT.
  const onLeft = entry.kind === "experience";

  return (
    <li className="relative pb-12 last:pb-0 sm:grid sm:grid-cols-2 sm:gap-x-16">
      <EntryDot className="absolute left-4 top-1 z-10 -translate-x-1/2 sm:left-1/2" entry={entry} index={index} />
      <div
        className={`pl-12 sm:pl-0 ${
          onLeft ? "sm:col-start-1 sm:pr-12 sm:text-right" : "sm:col-start-2 sm:pl-12"
        }`}
      >
        <p className={ERA_LABEL_CLASS}>{eraLabel(entry)}</p>
        <Reveal className="mt-3 block">
          <TimelineCard entry={entry} index={index} tapeSide={onLeft ? "right" : "left"} />
        </Reveal>
      </div>
    </li>
  );
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative">
      {/* central rail (left-aligned on mobile, centered from sm up) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 border-l-2 border-dashed border-accent/50 sm:left-1/2 sm:-translate-x-px"
      />
      {entries.map((entry, index) => (
        <TimelineItem entry={entry} index={index} key={entry.id} />
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Era timeline (full /timeline page) — experience cards pin to the   */
/* rail while you scroll through the years they span.                 */
/* ------------------------------------------------------------------ */

function EraRow({ era, index }: { era: TimelineEra; index: number }) {
  const exp = era.experience;
  // Approximate card height, used to vertically center the pinned card.
  const cardHeight = exp ? entryMinHeight(exp) ?? 320 : 0;

  return (
    <section className="relative sm:grid sm:grid-cols-2 sm:gap-x-16">
      {/* Solid accent segment over the rail marks the working period. */}
      {exp ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-4 border-l-2 border-accent sm:left-1/2 sm:-translate-x-px"
        />
      ) : null}

      {/* LEFT: the experience card, pinned (sticky) while its era is on screen. */}
      <div className="relative sm:col-start-1">
        {exp ? (
          <div className="pb-12 sm:sticky sm:pb-0" style={{ top: `calc(50vh - ${Math.round(cardHeight / 2)}px)` }}>
            <div className="pl-12 sm:pl-0 sm:pr-12 sm:text-right">
              <p className={ERA_LABEL_CLASS}>{eraLabel(exp)}</p>
              <Reveal className="mt-3 block">
                <TimelineCard entry={exp} index={index} tapeSide="right" />
              </Reveal>
            </div>
          </div>
        ) : null}
      </div>

      {/* RIGHT: the projects/courses/certs that happened during this era. */}
      <div className="relative sm:col-start-2">
        <div className="space-y-12 pb-12">
          {era.events.map((event, eventIndex) => (
            <div className="relative pl-12" key={event.id}>
              <EntryDot
                className="absolute left-4 top-1 z-10 -translate-x-1/2 sm:-left-8"
                entry={event}
                index={eventIndex}
              />
              <p className={ERA_LABEL_CLASS}>{eraLabel(event)}</p>
              <Reveal className="mt-3 block">
                <TimelineCard entry={event} index={eventIndex} tapeSide="left" />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EraTimeline({ entries }: { entries: TimelineEntry[] }) {
  const eras = groupTimelineByEra(entries);

  return (
    <div className="relative">
      {/* Dashed rail runs the full height behind the solid working-period segments. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-4 border-l-2 border-dashed border-accent/40 sm:left-1/2 sm:-translate-x-px"
      />
      {eras.map((era, index) => (
        <EraRow era={era} index={index} key={era.experience?.id ?? `gap-${index}`} />
      ))}
    </div>
  );
}
