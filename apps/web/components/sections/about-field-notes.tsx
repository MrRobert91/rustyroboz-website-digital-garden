import { Reveal } from "@/components/reveal";
import { CoffeeRing, HandCheck, InkStamp, Polaroid, Sticky } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

type AboutFieldNotesProps = {
  /** Bio prose paragraphs (real content, e.g. from the about MDX page). */
  paragraphs: string[];
};

/** Screen 02 — About / Field notes. */
export function AboutFieldNotes({ paragraphs }: AboutFieldNotesProps) {
  const specs: [string, React.ReactNode][] = [
    ["base", siteConfig.location],
    ["focus", "AI systems · games · product eng."],
    ["formats", "projects · articles · notes · experiments"],
    [
      "cv",
      <a className="text-accent-deep underline-offset-4 hover:text-accent hover:underline" href="/cv-david-robert.pdf" key="cv" rel="noreferrer" target="_blank">
        download PDF ↗
      </a>,
    ],
  ];

  return (
    <section className="dotted-paper relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§02 — Field notes</p>
            <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              About <span className="font-hand font-normal text-accent">(me)</span>
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">PG. 02 / 06</p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* media column */}
          <div>
            {/* mobile/tablet: simple stack */}
            <div className="flex flex-wrap items-start gap-6 lg:hidden">
              <Polaroid angle={-4} height={300} label="WORKSHOP" width={260} />
              <Polaroid angle={5} height={280} label="ROBOT-04" width={230} />
              <Sticky angle={-3} color="#ffd9c4" style={{ width: 240 }}>
                remember: <span className="font-semibold text-accent-deep">&quot;ship the rusty thing,</span> polish later&quot;
              </Sticky>
            </div>
            {/* desktop: scrapbook collage */}
            <div className="relative hidden h-[680px] lg:block">
              <Polaroid angle={-5} height={330} label="WORKSHOP" style={{ position: "absolute", top: 20, left: 0 }} width={300} />
              <Polaroid angle={6} height={290} label="ROBOT-04" style={{ position: "absolute", top: 270, left: 140 }} width={250} />
              <Sticky angle={-4} color="#ffd9c4" style={{ position: "absolute", top: 560, left: 20, width: 240 }}>
                remember: <br />
                <span className="font-semibold text-accent-deep">&quot;ship the rusty thing,</span>
                <br />
                polish later&quot;
              </Sticky>
              <div className="absolute right-6 top-0">
                <InkStamp angle={4} label="LAB · MADRID" />
              </div>
            </div>
          </div>

          {/* bio column */}
          <div>
            {paragraphs.map((p, i) => (
              <p
                className={`font-serif leading-relaxed text-foreground/85 ${i === 0 ? "text-xl" : "mt-5 text-lg"}`}
                key={i}
              >
                {p}
              </p>
            ))}

            {/* spec sheet */}
            <div className="relative mt-10 rounded border-2 border-dashed border-accent bg-paper-2/60 p-6">
              <span className="absolute -top-3.5 left-5 bg-background px-2.5 font-hand text-xl text-accent-deep">
                spec sheet ✱
              </span>
              <dl className="grid grid-cols-[100px_1fr] gap-x-5 gap-y-3 sm:grid-cols-[120px_1fr]">
                {specs.map(([k, v]) => (
                  <div className="contents" key={k}>
                    <dt className="pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
                    <dd className="font-hand text-xl text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* capabilities checklist */}
            <div className="mt-8">
              <p className="mb-3 inline-block font-hand text-2xl text-accent-deep -rotate-1">things I can do →</p>
              <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {siteConfig.capabilities.map((label) => (
                  <div className="flex items-center gap-3" key={label}>
                    <HandCheck color="hsl(var(--accent))" size={20} />
                    <span className="font-hand text-xl text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CoffeeRing className="hidden lg:block" size={130} style={{ bottom: 60, right: 180, opacity: 0.5 }} />
    </section>
  );
}
