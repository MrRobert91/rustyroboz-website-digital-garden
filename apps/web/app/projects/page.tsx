import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import { getCollection } from "@/lib/content";

export default async function ProjectsPage() {
  const items = await getCollection("projects");

  return <ProjectsPrototypes items={items} withHeader />;
}
