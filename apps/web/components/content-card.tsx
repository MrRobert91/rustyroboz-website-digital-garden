import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getContentHref, type ContentItem } from "@/lib/content";

type ContentCardProps = {
  item: ContentItem;
};

export function ContentCard({ item }: ContentCardProps) {
  return (
    <Card className="group h-full transition-transform duration-200 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="muted">{item.collection}</Badge>
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.readingTime}</span>
        </div>
        <CardTitle className="text-2xl">
          <Link className="inline-flex items-center gap-2 transition-colors hover:text-accent" href={getContentHref(item)}>
            {item.title}
            <ArrowUpRight className="size-4" />
          </Link>
        </CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-sm text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString("es-ES")}</span>
        <Link className="text-sm font-medium text-accent" href={getContentHref(item)}>
          Ver detalle
        </Link>
      </CardFooter>
    </Card>
  );
}

