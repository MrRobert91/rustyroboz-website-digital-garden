import { Reveal } from "@/components/reveal";
import { Doodle } from "@/components/notebook";
import { siteConfig } from "@/lib/site-config";

/** Screen 04 — Stack / Toolbox. Handwritten chips of the working tech. */
export function StackToolbox() {
  return (
    <section className="ruled-paper relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">§04 — Toolbox</p>
            <h2 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-7xl">
              Stack <span className="font-hand font-normal text-accent">(toolbox)</span>
            </h2>
          </div>
          <Doodle className="hidden sm:block" color="hsl(var(--accent-deep))" kind="gear" size={52} />
        </div>

        <div className="mt-14 grid gap-9 md:grid-cols-2">
          {siteConfig.stack.map((group, gi) => (
            <Reveal delay={(gi % 2) * 0.06} key={group.title}>
              <div className="relative border border-border bg-paper-2/70 p-6">
                <span
                  className="absolute -top-4 left-6 bg-accent px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fdf6ea]"
                  style={{ transform: `rotate(${gi % 2 ? -2 : 1.5}deg)` }}
                >
                  {group.title}
                </span>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {group.items.map((item, i) => (
                    <span
                      className="inline-block rounded-sm border border-border bg-paper-2 px-3.5 py-1 font-hand text-2xl text-foreground shadow-paper"
                      key={item}
                      style={{ transform: `rotate(${((i * 7) % 5) - 2}deg) scale(0.96)` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
