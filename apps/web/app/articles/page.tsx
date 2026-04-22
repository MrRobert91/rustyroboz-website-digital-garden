import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export default async function ArticlesPage() {
  const items = await getCollection("articles");

  return (
    <ContentListPage
      description="Ensayos y textos largos sobre entrega de software, IA aplicada, ética y diseño de sistemas."
      eyebrow="Blog"
      items={items}
      title="Artículos"
    />
  );
}

