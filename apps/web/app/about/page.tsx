import type { Metadata } from "next";
import { AboutFieldNotes } from "@/components/sections/about-field-notes";
import { StackToolbox } from "@/components/sections/stack-toolbox";
import { getItemBySlug } from "@/lib/content";
import { firstPublicImage } from "@/lib/public-image";

export const metadata: Metadata = {
  title: "About",
  description: "About David Robert, his experience, interests, and technical toolbox.",
};

/** Strip light markdown so MDX prose can render as plain notebook paragraphs. */
function toParagraphs(body: string): string[] {
  return body
    .split(/\r?\n\s*\r?\n/)
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
      <AboutFieldNotes headingLevel={1} paragraphs={paragraphs} photos={photos} />
      <StackToolbox />
    </>
  );
}
