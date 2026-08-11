import type { Metadata } from "next";
import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import { getCollection } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects and experiments built by David Robert across AI, software, games, and XR.",
};

export default async function ProjectsPage() {
  const items = await getCollection("projects");

  return <ProjectsPrototypes items={items} withHeader />;
}
