import { Reveal } from "@/components/reveal";
import { InkCircle, Sticky, Tape } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

const CARD_ROTATE = ["-rotate-[0.4deg]", "rotate-[0.5deg]", "-rotate-[0.3deg]", "rotate-[0.6deg]"];

/** Screen 05 — Logbook / Timeline. */
export function LogbookTimeline() {
  return (
    <section className="ruled-paper-plain relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§05 — Logbook</p>
            <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              Timeline <span className="font-hand font-normal text-accent">(so far)</span>
            </h2>
          </div>
          <Sticky angle={-4} className="hidden sm:block" color="#fcd9c8" style={{ width: 190 }}>
            ↓ time goes <span className="font-bold text-accent-deep">down</span> the page
          </Sticky>
        </div>

        <ol className="mt-14 border-l-2 border-dashed border-accent/50 pl-8 sm:pl-12">
          {siteConfig.timeline.map((entry, i) => (
            <li className="relative pb-12 last:pb-0" key={entry.title}>
              {/* inked dot on the rail */}
              <span className="absolute -left-[2.6rem] top-1.5 sm:-left-[3.6rem]">
                <InkCircle color="hsl(var(--accent))" seed={i + 1} size={26} strokeWidth={2.5}>
                  <span className="block size-2.5 rounded-full bg-accent" />
                </InkCircle>
              </span>

              <p className="font-display text-2xl font-bold uppercase tracking-tight text-foreground/40 sm:text-3xl">
                {entry.period}
              </p>

              <Reveal>
                <div className={`relative mt-3 border border-border bg-paper-2/85 p-5 shadow-paper ${CARD_ROTATE[i % CARD_ROTATE.length]}`}>
                  <Tape
                    angle={i % 2 ? 4 : -6}
                    height={16}
                    style={{ top: -9, [i % 2 ? "right" : "left"]: 20 }}
                    width={64}
                  />
                  <h3 className="font-display text-2xl font-bold text-foreground">{entry.title}</h3>
                  <p className="mt-2 font-serif text-base leading-relaxed text-foreground/75">{entry.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <p className="mt-4 pl-8 font-hand text-xl text-accent-deep -rotate-1 sm:pl-12">↓ to be continued</p>
      </div>
    </section>
  );
}
