import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CoffeeRing, Doodle, HandArrow, InkStamp, Squiggle, Sticky, Tape } from "@/components/notebook";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Screen 01 — Cover / Hero. Notebook front page. */
export function Hero() {
  return (
    <section className="ruled-paper relative overflow-hidden border-b border-border/80">
      {/* taped corners */}
      <Tape angle={-4} className="hidden sm:block" height={24} style={{ top: -6, left: 80 }} width={120} />
      <Tape angle={3} className="hidden sm:block" height={24} style={{ top: -6, right: 80 }} width={120} />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12 lg:px-16 lg:pb-28 lg:pt-16">
        {/* masthead */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-hand text-3xl text-accent-deep -rotate-1">Rusty Roboz Labs</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Notebook Nº 04 · 2026
            </p>
          </div>
          <div className="text-right">
            <p className="font-hand text-xl text-foreground/80 rotate-2">{siteConfig.name} · Madrid</p>
            <div className="mt-2 inline-block">
              <InkStamp angle={-6} label="VOL.04" />
            </div>
          </div>
        </div>

        {/* headline */}
        <Reveal className="relative mt-16 lg:mt-24">
          <p className="font-hand text-3xl text-accent -rotate-1 sm:text-4xl">Hello, I&apos;m a</p>
          <h1 className="mt-1 font-display text-6xl font-bold leading-[0.92] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-[9rem]">
            rusty AI
            <br />
            engineer
            <br />
            <span className="relative inline-block">
              <span className="font-serif italic font-normal text-accent">building</span>
              <span className="absolute -bottom-3 left-0 hidden sm:block">
                <Squiggle color="hsl(var(--accent))" height={14} seed={3} strokeWidth={3} width={420} />
              </span>
            </span>
            <br />
            small things.
          </h1>

          {/* annotations (desktop only) */}
          <div className="absolute right-0 top-8 hidden rotate-3 lg:block">
            <Sticky angle={6} color="#fde58a">
              ↳ &quot;small &amp;
              <br />
              shipped &gt;<br /> big &amp; planned&quot;
            </Sticky>
          </div>
          <div className="absolute right-10 top-72 hidden -rotate-3 font-hand text-xl text-accent-deep xl:block">
            ← (literally rusty)
            <HandArrow color="hsl(var(--accent-deep))" direction="left" height={30} seed={2} width={80} />
          </div>
        </Reveal>

        {/* subhead + CTAs */}
        <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <p className="max-w-xl font-serif text-xl leading-relaxed text-foreground/80">
            I make applied AI tools, retrieval pipelines, robotic prototypes and the occasional weird game. Computer
            engineer based in Madrid — half lab, half workshop, all notebooks.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-end">
            <Link className={cn(buttonVariants({ variant: "default" }), "w-full justify-center sm:w-auto")} href="/projects">
              View Projects
              <ArrowRight className="ml-2 size-4" />
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center sm:w-auto")} href="/articles">
              Read Articles
            </Link>
          </div>
        </div>

        {/* footer doodles */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Doodle color="hsl(var(--accent-deep))" kind="gear" size={44} />
            <Doodle color="hsl(var(--accent))" kind="bolt" size={32} />
            <Doodle color="hsl(var(--accent-deep))" kind="spark" size={28} />
            <span className="font-hand text-lg text-muted-foreground -rotate-1">ai · robots · prototypes · notes</span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">PG. 01 / COVER ↓</p>
        </div>
      </div>

      <CoffeeRing className="hidden lg:block" size={110} style={{ bottom: 120, left: 200, opacity: 0.6 }} />
    </section>
  );
}
