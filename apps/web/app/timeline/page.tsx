import type { Metadata } from "next";
import { Timeline } from "@/components/timeline";
import { timeline } from "@/lib/timeline";

export const metadata: Metadata = {
  title: "Timeline | David Robert",
  description:
    "A chronological timeline of David Robert's work — AI engineering and training roles, certifications, studies, and personal projects, most recent first.",
};

export default function TimelinePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Journey</p>
        <h1 className="mt-6 font-manrope text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Timeline
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          A chronological view of my work — roles, certifications, studies, and personal projects, most recent first.
          Longer roles take up more space, so you can see at a glance how the years line up.
        </p>
      </header>

      <div className="mt-14">
        <Timeline entries={timeline} />
      </div>
    </div>
  );
}
