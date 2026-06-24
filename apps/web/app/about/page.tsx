import { AboutFieldNotes } from "@/components/sections/about-field-notes";
import { StackToolbox } from "@/components/sections/stack-toolbox";
import { getItemBySlug } from "@/lib/content";
import { firstPublicImage } from "@/lib/public-image";

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
  const paragraphs = toParagraphs(aboutPage.body).slice(0, 5);
  const photos = {
    first: firstPublicImage(
      "/images/about/workshop-01.jpg",
      "/images/about/workshop-01.png",
      "/images/about/portrait.jpg",
      "/images/about/portrait.png",
    ),
    second: firstPublicImage(
      "/images/about/workshop-02.jpg",
      "/images/about/workshop-02.png",
      "/images/about/robot-04.jpg",
      "/images/about/robot-04.png",
    ),
  };

  return (
    <>
      <AboutFieldNotes paragraphs={paragraphs} photos={photos} />
      <StackToolbox />
    </>
  );
}
