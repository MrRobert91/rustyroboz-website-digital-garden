import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatRange,
  isOngoing,
  kindLabel,
  spanMonths,
  type TimelineEntry,
  type TimelineLink,
} from "@/lib/timeline";

function TimelineLinkChip({ link }: { link: TimelineLink }) {
  const isInternal = link.href.startsWith("/");
  const className =
    "inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-accent hover:text-accent";

  if (isInternal) {
    return (
      <Link className={className} href={link.href}>
        {link.label}
      </Link>
    );
  }

  return (
    <a className={className} href={link.href} rel="noreferrer" target="_blank">
      {link.label}
      <ArrowUpRight className="size-3" />
    </a>
  );
}

/** Min-height (px) so longer roles visibly occupy more vertical space. */
function entryMinHeight(entry: TimelineEntry) {
  const months = spanMonths(entry);
  if (months <= 0) {
    return undefined;
  }
  return Math.min(340, 150 + months * 4);
}

function TimelineCard({ entry, delay }: { entry: TimelineEntry; delay: number }) {
  const ranged = Boolean(entry.end);
  const ongoing = isOngoing(entry);
  const duration = formatDuration(entry);
  const minHeight = entryMinHeight(entry);

  return (
    <li className="relative pl-10 sm:pl-14">
      {/* Rail node */}
      <span
        aria-hidden
        className={cn(
          "absolute left-[0.30rem] top-2 size-3.5 rounded-full ring-4 ring-background sm:left-[1.05rem]",
          ongoing ? "bg-accent" : ranged ? "bg-foreground" : "bg-border",
        )}
      />
      {ongoing ? (
        <span
          aria-hidden
          className="absolute left-[0.30rem] top-2 size-3.5 animate-ping rounded-full bg-accent/60 sm:left-[1.05rem]"
        />
      ) : null}
      {/* Duration bar for ranged entries */}
      {ranged ? (
        <span
          aria-hidden
          className="absolute left-[0.92rem] top-6 bottom-3 w-0.5 rounded bg-accent/40 sm:left-[1.67rem]"
        />
      ) : null}

      <Reveal
        className={cn(
          "rounded-[1.75rem] border border-border bg-card shadow-soft",
          ranged ? "p-7 lg:p-8" : "p-6",
        )}
        delay={delay}
      >
        <div
          className={cn("flex h-full flex-col", ranged && "justify-between")}
          style={minHeight ? { minHeight } : undefined}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={ranged ? "default" : "muted"}>{kindLabel(entry.kind)}</Badge>
              <Badge variant="outline">{formatRange(entry)}</Badge>
              {duration ? <Badge variant="outline">{duration}</Badge> : null}
              {ongoing ? <Badge variant="default">Now</Badge> : null}
            </div>
            <h3
              className={cn(
                "mt-4 font-manrope font-semibold tracking-tight text-foreground",
                ranged ? "text-2xl lg:text-3xl" : "text-xl",
              )}
            >
              {entry.title}
            </h3>
            {entry.org ? <p className="mt-1 text-sm font-medium text-accent">{entry.org}</p> : null}
            <p className="mt-3 text-sm leading-7 text-muted-foreground lg:text-base lg:leading-8">
              {entry.description}
            </p>
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
    </li>
  );
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-1 space-y-6 border-l border-border/70 sm:ml-3">
      {entries.map((entry, index) => (
        <TimelineCard delay={Math.min(index * 0.04, 0.3)} entry={entry} key={entry.id} />
      ))}
    </ol>
  );
}
