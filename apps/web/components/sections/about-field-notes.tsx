import { Reveal } from "@/components/reveal";
import { CoffeeRing, HandCheck, InkStamp, Polaroid } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

type AboutFieldNotesProps = {
  /** Bio prose paragraphs (real content, e.g. from the about MDX page). */
  paragraphs: string[];
  /** Optional real photos for the two polaroids. Fall back to drawn placeholders when missing. */
  photos?: { first?: string; second?: string };
  headingLevel?: 1 | 2;
};

/** Screen 02 — About / Field notes. */
export function AboutFieldNotes({ paragraphs, photos, headingLevel = 2 }: AboutFieldNotesProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const specs: [string, React.ReactNode][] = [
    ["base", siteConfig.location],
    ["focus", "AI systems · games · product eng."],
    ["formats", "projects · articles · notes · experiments"],
    [
      "cv",
      <a className="text-link" href="/cv-david-robert.pdf" key="cv" rel="noreferrer" target="_blank">
        download PDF ↗
      </a>,
    ],
  ];

  return (
    <section className="dotted-paper relative overflow-hidden border-b border-border/70">
      <div className="reading-surface mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">§02 — Field notes</p>
            <Heading className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              About <span className="font-hand font-normal text-accent">(me)</span>
            </Heading>
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">PG. 02 / 06</p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* media column */}
          <div>
            {/* mobile/tablet: simple stack */}
            <div className="flex flex-wrap items-start gap-6 lg:hidden">
              <Polaroid alt="David Robert standing in front of a glass building." angle={-4} caption="WORKSHOP" height={300} src={photos?.first} width={260} />
              <Polaroid alt="David Robert giving a talk beside a screen showing a robotic hand." angle={5} caption="ROBOT-04" height={280} src={photos?.second} width={230} />
            </div>
            {/* desktop: scrapbook collage */}
            <div className="relative hidden h-[580px] lg:block">
              <Polaroid alt="David Robert standing in front of a glass building." angle={-5} caption="WORKSHOP" height={330} src={photos?.first} style={{ position: "absolute", top: 20, left: 0 }} width={300} />
              <Polaroid alt="David Robert giving a talk beside a screen showing a robotic hand." angle={6} caption="ROBOT-04" height={290} src={photos?.second} style={{ position: "absolute", top: 270, left: 140 }} width={250} />
              <div className="absolute right-6 top-0">
                <InkStamp angle={4} label="LAB · MADRID" />
              </div>
            </div>
          </div>

          {/* bio column */}
          <div>
            {paragraphs.map((p, i) => (
              <p
                className={`body-copy text-foreground/85 ${i === 0 ? "" : "mt-5"}`}
                key={i}
              >
                {p}
              </p>
            ))}

            {/* spec sheet */}
            <div className="relative mt-10 rounded border-2 border-dashed border-accent bg-paper-2/60 p-6">
              <span className="absolute -top-3.5 left-5 bg-background px-2.5 font-display text-base font-semibold text-accent-deep">
                spec sheet ✱
              </span>
              <dl className="grid grid-cols-[100px_1fr] gap-x-5 gap-y-3 sm:grid-cols-[120px_1fr]">
                {specs.map(([k, v]) => (
                  <div className="contents" key={k}>
                    <dt className="pt-1 font-mono text-sm uppercase tracking-[0.16em] text-muted-foreground">{k}</dt>
                    <dd className="font-serif text-lg text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* capabilities checklist */}
            <div className="mt-8">
              <p className="mb-3 inline-block font-display text-lg font-semibold text-accent-deep">Things I can do →</p>
              <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {siteConfig.capabilities.map((label) => (
                  <div className="flex items-center gap-3" key={label}>
                    <HandCheck color="hsl(var(--accent))" size={20} />
                    <span className="font-serif text-lg text-foreground">{label}</span>
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
