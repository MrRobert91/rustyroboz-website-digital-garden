import { Hero } from "@/components/sections/hero";
import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import { Bitacora } from "@/components/sections/bitacora";
import { StackToolbox } from "@/components/sections/stack-toolbox";
import { getCollection } from "@/lib/content";

export default async function HomePage() {
  const [allProjects, allArticles] = await Promise.all([
    getCollection("projects"),
    getCollection("articles"),
  ]);
  const projects = allProjects.slice(0, 4);
  const articles = allArticles.slice(0, 4);

  return (
    <>
      <Hero />
      <ProjectsPrototypes items={projects} withHeader={false} />
      <Bitacora items={articles} />
      <StackToolbox />
    </>
  );
}
