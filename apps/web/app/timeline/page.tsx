import { getTranslation } from "@/lib/i18n/server";
import { Text } from "@/components/language-provider";
import type { Metadata } from "next";
import { InkStamp, Sticky } from "@/components/notebook";
import { EraTimeline } from "@/components/timeline";
import { timeline } from "@/lib/timeline";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t("Timeline"),
    description: t(
      "A chronological timeline of David Robert's work — AI engineering and training roles, certifications, studies, and personal projects, most recent first.",
    ),
  };
}

export default function TimelinePage() {
  return (
    <section className="dotted-paper relative">
      <div className="reading-surface mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
              <Text>§05 — Logbook</Text>
            </p>
            <h1 className="mt-2 font-display text-6xl font-bold tracking-tight text-foreground lg:text-8xl">
              <Text>Timeline</Text>
            </h1>
            <p className="mt-4 font-serif text-xl text-accent-deep">
              <Text>The whole thing, most recent first ↓</Text>
            </p>
            <p className="body-copy mt-5 text-foreground/80">
              <Text>
                Roles, certifications, studies and personal projects. Longer roles take up more space, so you can see at
                a glance how the years line up.
              </Text>
            </p>
          </div>
          <Sticky angle={-4} className="hidden sm:block" color="#fcd9c8" style={{ width: 190 }}>
            <Text>↓ time goes</Text>{" "}
            <span className="font-bold text-[#6b2d1a]">
              <Text>down</Text>
            </span>{" "}
            <Text>the page</Text>
          </Sticky>
        </div>

        <div className="mt-10 flex">
          <InkStamp angle={-5} label={<Text>9 YRS IN TECH</Text>} />
        </div>

        <div className="mt-12">
          <EraTimeline entries={timeline} />
        </div>

        <p className="mt-6 pl-8 font-serif text-lg text-accent-deep sm:pl-12">
          <Text>↓ To be continued</Text>
        </p>
      </div>
    </section>
  );
}
