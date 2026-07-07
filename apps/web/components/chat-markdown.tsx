"use client";

/**
 * Markdown renderer for ROBOZ answers, styled to the notebook aesthetic:
 * serif body, rust accents, paper-toned code blocks. Safe by default —
 * react-markdown does not render raw HTML.
 */
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-3 whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-foreground last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }: { children?: ReactNode }) => <em className="font-serif italic">{children}</em>,
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a className="text-accent-deep underline decoration-accent/50 underline-offset-2 transition-colors hover:text-accent" href={href} rel="noreferrer" target={href?.startsWith("/") ? undefined : "_blank"}>
      {children}
    </a>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-3 ml-1 list-none space-y-1.5 font-serif text-[15px] leading-relaxed text-foreground last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1.5 font-serif text-[15px] leading-relaxed text-foreground marker:font-mono marker:text-xs marker:text-accent last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="relative pl-5 [ol_&]:pl-1 [ul_&]:before:absolute [ul_&]:before:left-0 [ul_&]:before:text-accent [ul_&]:before:content-['→']">
      {children}
    </li>
  ),
  code: ({ children, className }: { children?: ReactNode; className?: string }) =>
    className ? (
      <code className="font-mono text-[13px] leading-relaxed">{children}</code>
    ) : (
      <code className="border border-border/70 bg-paper-2 px-1.5 py-0.5 font-mono text-[13px] text-accent-deep">{children}</code>
    ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mb-3 overflow-x-auto border border-border bg-paper-2/80 p-3 shadow-paper last:mb-0">{children}</pre>
  ),
  h1: ({ children }: { children?: ReactNode }) => (
    <p className="mb-2 mt-4 font-display text-lg font-bold tracking-tight text-foreground first:mt-0">{children}</p>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <p className="mb-2 mt-4 font-display text-base font-bold tracking-tight text-foreground first:mt-0">{children}</p>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <p className="mb-1.5 mt-3 font-display text-[15px] font-bold text-foreground first:mt-0">{children}</p>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mb-3 border-l-2 border-accent/60 pl-3 font-serif italic text-foreground/80 last:mb-0">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-dashed border-border" />,
  table: ({ children }: { children?: ReactNode }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse font-serif text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border border-border bg-paper-2 px-2.5 py-1.5 text-left font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => <td className="border border-border/70 px-2.5 py-1.5">{children}</td>,
};

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
