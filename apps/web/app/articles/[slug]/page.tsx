import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content-detail-page";
import { getCollection, getItemBySlug, getRelatedContent } from "@/lib/content";

type ArticleDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await getCollection("articles");
  return items.map((item) => ({ slug: item.slug }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailProps) {
  const { slug } = await params;

  try {
    const item = await getItemBySlug("articles", slug);
    const related = await getRelatedContent(item);
    return <ContentDetailPage item={item} related={related} />;
  } catch {
    notFound();
  }
}
