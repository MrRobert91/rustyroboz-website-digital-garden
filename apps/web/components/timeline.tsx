import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { InkCircle, Tape } from "@/components/notebook";
import {
  formatDuration,
  formatRange,
  isOngoing,
  kindLabel,
  spanMonths,
  type TimelineEntry,
  type TimelineLink,
} from "@/lib/timeline";

const CARD_ROTATE = ["-rotate-[0.4deg]", "rotate-[0.5deg]", "-rotate-[0.3deg]", "rotate-[0.6deg]"];

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

function TimelineItem({ entry, index }: { entry: TimelineEntry; index: number }) {
  const ranged = Boolean(entry.end);
  const ongoing = isOngoing(entry);
  const duration = formatDuration(entry);
  const minHeight = entryMinHeight(entry);
  const dotSize = ranged ? 34 : 24;
  // Work experience sits on the LEFT of the central rail; everything else
  // (projects, courses, certifications, education, awards) on the RIGHT.
  const onLeft = entry.kind === "experience";

  return (
    <li className="relative pb-12 last:pb-0 sm:grid sm:grid-cols-2 sm:gap-x-16">
      {/* inked dot on the central rail */}
      <span className="absolute left-4 top-1 z-10 -translate-x-1/2 sm:left-1/2">
        <InkCircle color="hsl(var(--accent))" seed={index + 1} size={dotSize} strokeWidth={ranged ? 2.5 : 2}>
          <span className={`block rounded-full bg-accent ${ranged ? "size-3" : "size-2"}`} />
        </InkCircle>
      </span>

      <div
        className={`pl-12 sm:pl-0 ${
          onLeft ? "sm:col-start-1 sm:pr-12 sm:text-right" : "sm:col-start-2 sm:pl-12"
        }`}
      >
        <p className="font-display text-2xl font-bold uppercase tracking-tight text-foreground/35 sm:text-3xl">
          {eraLabel(entry)}
        </p>

        <Reveal>
          <div
            className={`relative mt-3 flex flex-col justify-between border border-border bg-paper-2/85 text-left shadow-paper ${
              ranged ? "p-6 lg:p-7" : "p-5"
            } ${CARD_ROTATE[index % CARD_ROTATE.length]}`}
            style={minHeight ? { minHeight } : undefined}
          >
            <Tape angle={onLeft ? 4 : -6} height={16} style={{ top: -9, [onLeft ? "right" : "left"]: 22 }} width={64} />
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
            </div>
            {entry.links?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {entry.links.map((link) => (
                  <TimelineLinkChip key={`${entry.id}-${link.href}`} link={link} />
                ))}
              </div>
            ) : null}
          </div>
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
