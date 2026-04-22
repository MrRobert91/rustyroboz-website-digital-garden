import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export default async function NotesPage() {
  const items = await getCollection("notes");

  return (
    <ContentListPage
      description="Notas cortas y conectadas para capturar ideas, intuiciones y relaciones entre temas."
      eyebrow="Notas"
      items={items}
      title="Digital Garden"
    />
  );
}

