import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles",
  description: "Essays and long-form writing on software delivery, applied AI, ethics, and system design.",
};

export default async function ArticlesPage() {
  const items = await getCollection("articles");

  return (
    <ContentListPage
      description="Essays and long-form writing on software delivery, applied AI, ethics, and system design."
      eyebrow="Blog"
      items={items}
      title="Articles"
    />
  );
}
