import type { Metadata } from "next";
import { InkStamp, Sticky } from "@/components/notebook";
import { EraTimeline } from "@/components/timeline";
import { timeline } from "@/lib/timeline";

export const metadata: Metadata = {
  title: "Timeline | David Robert",
  description:
    "A chronological timeline of David Robert's work — AI engineering and training roles, certifications, studies, and personal projects, most recent first.",
};

export default function TimelinePage() {
  return (
    <section className="ruled-paper-plain relative">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§05 — Logbook</p>
            <h1 className="mt-2 font-display text-6xl font-bold tracking-tight text-foreground lg:text-8xl">Timeline</h1>
            <p className="mt-4 font-hand text-2xl text-accent-deep -rotate-1">the whole thing, most recent first ↓</p>
            <p className="mt-5 font-serif text-lg leading-relaxed text-foreground/80">
              Roles, certifications, studies and personal projects. Longer roles take up more space, so you can see at a
              glance how the years line up.
            </p>
          </div>
          <Sticky angle={-4} className="hidden sm:block" color="#fcd9c8" style={{ width: 190 }}>
            ↓ time goes <span className="font-bold text-accent-deep">down</span> the page
          </Sticky>
        </div>

        <div className="mt-10 flex">
          <InkStamp angle={-5} label="9 YRS IN TECH" />
        </div>

        <div className="mt-12">
          <EraTimeline entries={timeline} />
        </div>

        <p className="mt-6 pl-8 font-hand text-xl text-accent-deep -rotate-1 sm:pl-12">↓ to be continued</p>
      </div>
    </section>
  );
}
