import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";
import { getCollection } from "@/lib/content";

export const metadata: Metadata = {
  title: "Digital Garden",
  description: "Short linked notes about applied AI, software, and product experiments.",
};

export default async function NotesPage() {
  const items = await getCollection("notes");

  return (
    <ContentListPage
      description="Short linked notes for capturing ideas, intuitions, and relationships between topics."
      eyebrow="Notes"
      items={items}
      title="Digital Garden"
    />
  );
}
