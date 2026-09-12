import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  className?: string;
  headingLevel?: 1 | 2;
};

export function SectionHeading({ eyebrow, title, description, className, headingLevel = 2 }: SectionHeadingProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <Heading className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</Heading>
      <p className="body-copy mt-4 text-muted-foreground">{description}</p>
    </div>
  );
}
