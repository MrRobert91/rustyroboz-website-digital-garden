import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export default async function ProjectsPage() {
  const items = await getCollection("projects");

  return (
    <ContentListPage
      description="Piezas donde combino backend, frontend, producto y sistemas de IA con foco en claridad operativa."
      eyebrow="Portfolio"
      items={items}
      title="Proyectos"
    />
  );
}

