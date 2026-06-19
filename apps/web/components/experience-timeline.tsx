import { siteConfig } from "@/lib/site-config";

const PX_PER_YEAR = 104;
// Vertical breathing room above the newest point and below the oldest point.
const TOP_PADDING = 8;
const BOTTOM_PADDING = 8;
// Minimum vertical gap between two right-side milestone cards.
const MIN_MILESTONE_GAP = 84;

function currentYearFraction() {
  const now = new Date();
  return now.getFullYear() + now.getMonth() / 12;
}

type ResolvedExperience = {
  role: string;
  company: string;
  startLabel: string;
  endLabel: string;
  description: string;
  start: number;
  end: number;
};

type ResolvedMilestone = {
  year: number;
  type: string;
  title: string;
  detail: string;
  topY: number;
};

export function ExperienceTimeline() {
  const present = currentYearFraction();

  const experience: ResolvedExperience[] = siteConfig.experience.map((entry) => ({
    ...entry,
    end: entry.end === "present" ? present : entry.end,
  }));

  const milestoneYears = siteConfig.milestones.map((m) => m.year);
  const allValues = [
    ...experience.flatMap((e) => [e.start, e.end]),
    ...milestoneYears,
  ];

  const maxYear = Math.ceil(Math.max(...allValues));
  const minYear = Math.floor(Math.min(...allValues));

  // y grows downward; the newest year sits at the top.
  const y = (value: number) => TOP_PADDING + (maxYear - value) * PX_PER_YEAR;
  const chartHeight = TOP_PADDING + (maxYear - minYear) * PX_PER_YEAR + BOTTOM_PADDING;

  const yearTicks: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    yearTicks.push(year);
  }

  // Resolve milestone positions, pushing collisions downward so cards never overlap.
  const milestones: ResolvedMilestone[] = [];
  let lastTop = -Infinity;
  for (const m of siteConfig.milestones) {
    const desired = y(m.year);
    const topY = Math.max(desired, lastTop + MIN_MILESTONE_GAP);
    milestones.push({ ...m, topY });
    lastTop = topY;
  }

  return (
    <div>
      {/* Desktop: two-sided proportional timeline */}
      <div className="relative hidden lg:block" style={{ height: chartHeight }}>
        {/* Central line */}
        <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-border" aria-hidden />

        {/* Year ticks centered on the line */}
        {yearTicks.map((year) => (
          <div
            className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
            key={year}
            style={{ top: y(year) }}
            aria-hidden
          >
            <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-muted-foreground">
              {year}
            </span>
          </div>
        ))}

        {/* LEFT: experience bars, height proportional to duration */}
        {experience.map((entry) => {
          const top = y(entry.end);
          const height = Math.max((entry.end - entry.start) * PX_PER_YEAR, 64);
          return (
            <div
              className="absolute pr-8"
              key={`${entry.company}-${entry.role}`}
              style={{ top, height, left: 0, width: "calc(50% - 1.25rem)" }}
            >
              <div className="flex h-full flex-col justify-center rounded-[1.5rem] border border-accent/30 bg-accent/5 p-5 text-right shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {entry.startLabel} — {entry.endLabel}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{entry.role}</h3>
                <p className="text-sm font-medium text-muted-foreground">{entry.company}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.description}</p>
              </div>
              {/* connector to the line */}
              <div
                className="absolute right-0 h-px w-8 translate-x-full bg-accent/40"
                style={{ top: "50%" }}
                aria-hidden
              />
            </div>
          );
        })}

        {/* RIGHT: milestones (projects, courses, certifications) */}
        {milestones.map((m) => (
          <div
            className="absolute pl-8"
            key={`${m.title}-${m.year}`}
            style={{ top: m.topY, left: "50%", width: "calc(50% - 1.25rem)", transform: "translateY(-50%)" }}
          >
            <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {m.type} · {m.year}
              </p>
              <h3 className="mt-2 text-base font-semibold text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.detail}</p>
            </div>
            {/* connector to the line */}
            <div className="absolute left-0 top-1/2 h-px w-8 -translate-x-full bg-border" aria-hidden />
            <div className="absolute left-0 top-1/2 size-2.5 -translate-x-[calc(2rem+50%)] -translate-y-1/2 rounded-full border border-border bg-accent" aria-hidden />
          </div>
        ))}
      </div>

      {/* Mobile: stacked fallback */}
      <div className="space-y-10 lg:hidden">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Experience</p>
          <div className="space-y-4 border-l border-accent/30 pl-5">
            {experience.map((entry) => (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4" key={`${entry.company}-m`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {entry.startLabel} — {entry.endLabel}
                </p>
                <h3 className="mt-1 text-base font-semibold text-foreground">{entry.role}</h3>
                <p className="text-sm font-medium text-muted-foreground">{entry.company}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Projects, courses & certifications
          </p>
          <div className="space-y-4 border-l border-border pl-5">
            {siteConfig.milestones.map((m) => (
              <div className="rounded-2xl border border-border bg-card p-4" key={`${m.title}-m`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {m.type} · {m.year}
                </p>
                <h3 className="mt-1 text-base font-semibold text-foreground">{m.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
