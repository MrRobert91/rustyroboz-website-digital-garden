import { getTranslation } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslation();
  return {
    title: t("Articles"),
    description: t("Essays and long-form writing on software delivery, applied AI, ethics, and system design."),
  };
}

export default async function ArticlesPage() {
  const items = await getCollection("articles");

  return (
    <ContentListPage
      description="Essays and long-form writing on software delivery, applied AI, ethics, and system design."
      eyebrow="Blog"
      items={items}
      notebookFrame
      title="Articles"
    />
  );
}
