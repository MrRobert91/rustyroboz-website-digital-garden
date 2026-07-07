import Link from "next/link";
import { Squiggle, Tape } from "@/components/notebook";
import { Reveal } from "@/components/reveal";
import { BlochSphere } from "@/components/widgets/bloch-sphere";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LabPage() {
  return (
    <section className="dotted-paper relative overflow-hidden border-b border-border/70">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Bench demos</p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
          AI Lab <span className="font-hand font-normal text-accent">(the bench)</span>
        </h1>
        <Squiggle className="mt-3" color="hsl(var(--accent))" height={12} seed={5} strokeWidth={2.5} width={260} />
        <p className="mt-5 max-w-3xl font-serif text-lg leading-8 text-muted-foreground">
          This route stays visible from the first version to reserve space for demos, evaluations, conversational
          interfaces, and small product experiments.
        </p>

        {/* Interactive demo — a qubit you can poke */}
        <Reveal>
          <div className="relative mt-12 border border-border bg-paper-2/80 p-6 shadow-paper sm:p-8">
            <Tape angle={-4} height={20} style={{ top: -10, left: 32 }} width={90} />
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Qubit on the bench
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Fig. Q1 — Bloch sphere
              </span>
            </div>
            <p className="mt-2 max-w-2xl font-serif text-base leading-relaxed text-foreground/75">
              A hand-drawn Bloch sphere, no libraries — just canvas and trigonometry. Drag to rotate the view and hit
              the gate buttons to watch the state vector travel its real rotation arc.
            </p>
            <div className="mt-6">
              <BlochSphere />
            </div>
          </div>
        </Reveal>

        <div className="relative mt-10 border border-border bg-paper-2/60 p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Active MVP</p>
          <p className="mt-4 max-w-2xl font-serif text-base leading-7 text-muted-foreground">
            The personal chat already works with local retrieval and streaming. The next phase will harden ingestion,
            reindexing, and knowledge traceability.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link className={cn(buttonVariants({ variant: "default" }))} href="/projects">
            View Projects
          </Link>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/chat">
            Open Chat
          </Link>
        </div>
      </div>
    </section>
  );
}
