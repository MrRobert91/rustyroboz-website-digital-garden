import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content-detail-page";
import { getCollection, getItemBySlug, getRelatedContent } from "@/lib/content";

type NoteDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await getCollection("notes");
  return items.map((item) => ({ slug: item.slug }));
}

export default async function NoteDetailPage({ params }: NoteDetailProps) {
  const { slug } = await params;

  try {
    const item = await getItemBySlug("notes", slug);
    const related = await getRelatedContent(item);
    return <ContentDetailPage item={item} related={related} />;
  } catch {
    notFound();
  }
}
