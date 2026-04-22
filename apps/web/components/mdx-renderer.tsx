import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type MdxRendererProps = {
  source: string;
};

const components = {
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link className="font-medium text-accent underline-offset-4 hover:underline" href={props.href ?? "#"}>
      {props.children}
    </Link>
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-14 font-manrope text-3xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-10 font-manrope text-2xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => <p className="mt-5 text-lg leading-8 text-foreground/88" {...props} />,
  ul: (props: HTMLAttributes<HTMLUListElement>) => <ul className="mt-5 list-disc space-y-3 pl-6 text-lg leading-8 text-foreground/88" {...props} />,
  ol: (props: HTMLAttributes<HTMLOListElement>) => <ol className="mt-5 list-decimal space-y-3 pl-6 text-lg leading-8 text-foreground/88" {...props} />,
  blockquote: (props: HTMLAttributes<HTMLElement>) => (
    <blockquote className="mt-8 border-l-2 border-accent pl-6 font-newsreader text-2xl italic leading-9 text-foreground/85" {...props} />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-foreground/5 px-1.5 py-0.5 text-sm text-accent" {...props} />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre className="mt-6 overflow-x-auto rounded-[1.5rem] bg-foreground px-5 py-4 text-sm text-background" {...props} />
  ),
};

export function MdxRenderer({ source }: MdxRendererProps) {
  return <MDXRemote components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} source={source} />;
}
