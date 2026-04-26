import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export default async function ProjectsPage() {
  const items = await getCollection("projects");

  return (
    <ContentListPage
      description="Projects that combine backend, frontend, product thinking, and AI systems with an operational bias."
      eyebrow="Portfolio"
      items={items}
      title="Projects"
    />
  );
}
