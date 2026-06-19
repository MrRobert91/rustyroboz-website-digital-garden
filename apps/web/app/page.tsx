import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { ContentHero } from "@/components/content-hero";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedItems } from "@/lib/content";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [projects, articles] = await Promise.all([getFeaturedItems("projects", 2), getFeaturedItems("articles", 2)]);

  return (
    <>
      <ContentHero
        bioDescription="I work across software, AI systems, robotics, quantum computing, and game development, with a preference for practical builds that ship."
        bioFacts={[
          { label: "Base", value: "Madrid, Spain" },
          { label: "Focus", value: "AI systems, games, product engineering" },
          { label: "Formats", value: "Projects, articles, notes, experiments" },
        ]}
        bioTitle="Computer engineer based in Madrid"
        description="A personal site for projects, writing, experiments, and small AI-driven tools."
        eyebrow="David Robert"
        primaryLink={{ href: "/projects", label: "View Projects" }}
        secondaryLink={{ href: "/articles", label: "Read Articles" }}
        title="AI, games, software, and strange prototypes."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <SectionHeading
          description="A cross-section of software, AI, VR, and game experiments."
          eyebrow="Selected Work"
          title="Projects"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <Reveal key={project.slug}>
              <ContentCard item={project} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border/80 bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">
          <SectionHeading
            description="Long-form writing on applied AI, software delivery, product decisions, and experiments."
            eyebrow="Writing"
            title="Articles"
          />
          <div className="grid gap-6">
            {articles.map((item, index) => (
              <Reveal delay={index * 0.06} key={`${item.collection}-${item.slug}`}>
                <ContentCard item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
        <SectionHeading
          description="Work experience runs down the left, anchored to the years; projects, courses, and certifications sit on the right."
          eyebrow="About"
          title="A timeline of experience and milestones"
        />
        <div className="mt-12 flex items-center justify-center gap-6 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm border border-accent/30 bg-accent/10" aria-hidden />
            Experience
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-full border border-border bg-accent" aria-hidden />
            Projects · courses · certifications
          </span>
        </div>
        <Reveal className="mt-10">
          <ExperienceTimeline />
        </Reveal>
      </section>

      <section className="border-t border-border/80 bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-20">
          <div>
            <Badge className="bg-background/10 text-background" variant="default">
              AI Lab
            </Badge>
            <h2 className="mt-5 max-w-3xl font-manrope text-4xl font-semibold tracking-tight">
              An evolving AI layer for retrieval, conversational interfaces, and small product experiments.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-background/72">
              The frontend and backend deploy independently, the content lives in MDX, and the retrieval pipeline is ready to
              grow with the site.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/contact">
              Contact
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/lab">
              Explore the Lab
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }), "border-background/30 text-background hover:border-background")} href="/chat">
              Open Chat
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
