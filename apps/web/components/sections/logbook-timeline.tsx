import Link from "next/link";
import { Sticky } from "@/components/notebook";
import { Timeline } from "@/components/timeline";
import { getRecentTimeline } from "@/lib/timeline";

/** Screen 05 — Logbook / Timeline. Shows recent real entries; full list lives at /timeline. */
export function LogbookTimeline() {
  const recent = getRecentTimeline(5);

  return (
    <section className="ruled-paper-plain relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§05 — Logbook</p>
            <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              Timeline <span className="font-hand font-normal text-accent">(recent)</span>
            </h2>
          </div>
          <Sticky angle={-4} className="hidden sm:block" color="#fcd9c8" style={{ width: 190 }}>
            ↓ time goes <span className="font-bold text-accent-deep">down</span> the page
          </Sticky>
        </div>

        <div className="mt-14">
          <Timeline entries={recent} />
        </div>

        <Link
          className="mt-6 inline-block font-hand text-2xl text-accent-deep -rotate-1 underline-offset-4 hover:text-accent hover:underline sm:ml-12"
          href="/timeline"
        >
          → see the full timeline
        </Link>
      </div>
    </section>
  );
}
