import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h2>
      <p className="mt-4 font-serif text-base leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
