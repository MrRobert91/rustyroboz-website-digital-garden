import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CoffeeRing, Doodle, Squiggle, Sticky, Tape } from "@/components/notebook";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Screen 01 — Cover / Hero. Notebook front page. */
export function Hero() {
  return (
    <section className="dotted-paper relative overflow-hidden border-b border-border/80">
      {/* taped corners */}
      <Tape angle={-4} className="hidden sm:block" height={24} style={{ top: -6, left: 80 }} width={120} />
      <Tape angle={3} className="hidden sm:block" height={24} style={{ top: -6, right: 80 }} width={120} />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-16 lg:pb-28 lg:pt-24">
        {/* headline */}
        <Reveal className="relative">
          <p className="font-hand text-3xl text-accent -rotate-1 sm:text-4xl">Hi, I&apos;m David,</p>
          <h1 className="mt-1 font-display text-6xl font-bold leading-[0.92] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-[9rem]">
            an AI
            <br />
            <span className="relative inline-block">
              <span className="font-serif italic font-normal text-accent">engineer</span>
              <span className="absolute -bottom-3 left-0 hidden sm:block">
                <Squiggle color="hsl(var(--accent))" height={14} seed={3} strokeWidth={3} width={420} />
              </span>
            </span>
          </h1>

          {/* annotations (desktop only) */}
          <div className="absolute right-0 top-8 hidden rotate-3 lg:block">
            <Sticky angle={6} color="#fde58a" style={{ whiteSpace: "nowrap" }}>
              <span className="text-2xl">↳ &quot;shipped &gt; perfect&quot;</span>
            </Sticky>
          </div>
        </Reveal>

        {/* subhead + CTAs */}
        <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
          <p className="max-w-xl font-serif text-xl leading-relaxed text-foreground/80">
            Currently interested in Machine Learning, Computer Vision, Agentic AI, Quantum Computing, Robotics, Game
            Development and Technology in general.
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
