import { getTranslation } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ProjectsPrototypes } from "@/components/sections/projects-prototypes";
import { getCollection } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t("Projects"),
    description: t("Projects and experiments built by David Robert across AI, software, games, and XR."),
  };
}

export default async function ProjectsPage() {
  const items = await getCollection("projects");

  return <ProjectsPrototypes headingLevel={1} items={items} withHeader />;
}
