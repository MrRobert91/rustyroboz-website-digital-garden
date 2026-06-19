import { Hero } from "@/components/sections/hero";
import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import { Bitacora } from "@/components/sections/bitacora";
import { LogbookTimeline } from "@/components/sections/logbook-timeline";
import { StackToolbox } from "@/components/sections/stack-toolbox";
import { AiLabCta } from "@/components/sections/ai-lab-cta";
import { getFeaturedItems } from "@/lib/content";

export default async function HomePage() {
  const [projects, articles] = await Promise.all([
    getFeaturedItems("projects", 4),
    getFeaturedItems("articles", 4),
  ]);

  return (
    <>
      <Hero />
      <ProjectsPrototypes items={projects} withHeader={false} />
      <Bitacora items={articles} />
      <LogbookTimeline />
      <StackToolbox compact />
      <AiLabCta />
    </>
  );
}
