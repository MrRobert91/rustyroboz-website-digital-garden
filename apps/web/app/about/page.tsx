import { AboutFieldNotes } from "@/components/sections/about-field-notes";
import { LogbookTimeline } from "@/components/sections/logbook-timeline";
import { StackToolbox } from "@/components/sections/stack-toolbox";
import { getItemBySlug } from "@/lib/content";

/** Strip light markdown so MDX prose can render as plain notebook paragraphs. */
function toParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((block) =>
      block
        .replace(/^!\[.*?\]\(.*?\)\s*$/gm, "") // drop image lines
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links -> text
        .replace(/[#>*`]/g, "")
        .trim(),
    )
    .filter(Boolean);
}

export default async function AboutPage() {
  const aboutPage = await getItemBySlug("pages", "about");
  const paragraphs = toParagraphs(aboutPage.body).slice(0, 4);

  return (
    <>
      <AboutFieldNotes paragraphs={paragraphs} />
      <StackToolbox />
      <LogbookTimeline />
    </>
  );
}
