"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { TimelineMediaItem } from "@/lib/timeline";

const NAV_BUTTON =
  "absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-background/85 text-foreground shadow transition-colors hover:bg-background";

export function TimelineMedia({ items, title }: { items: TimelineMediaItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (!items.length) {
    return null;
  }

  const item = items[index];
  const move = (delta: number) => {
    setPlaying(false);
    setIndex((prev) => (prev + delta + items.length) % items.length);
  };

  return (
    <div className="relative mt-4 overflow-hidden rounded-sm border border-border bg-foreground/[0.04]">
      <div className="relative aspect-video w-full">
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={item.alt ?? title} className="size-full object-cover" loading="lazy" src={item.src} />
        ) : playing ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
            src={`https://www.youtube.com/embed/${item.id}?autoplay=1&rel=0`}
            title={item.title ?? title}
          />
        ) : (
          <button
            aria-label={`Play video: ${item.title ?? title}`}
            className="group/play relative block size-full"
            onClick={() => setPlaying(true)}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={item.title ?? title}
              className="size-full object-cover"
              loading="lazy"
              src={`https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`}
            />
            <span className="absolute inset-0 grid place-items-center bg-foreground/25 transition-colors group-hover/play:bg-foreground/35">
              <span className="grid size-14 place-items-center rounded-full bg-accent text-background shadow-lg transition-transform group-hover/play:scale-110">
                <Play className="size-6 translate-x-0.5 fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>

      {items.length > 1 ? (
        <>
          <button aria-label="Previous" className={`${NAV_BUTTON} left-2`} onClick={() => move(-1)} type="button">
            <ChevronLeft className="size-4" />
          </button>
          <button aria-label="Next" className={`${NAV_BUTTON} right-2`} onClick={() => move(1)} type="button">
            <ChevronRight className="size-4" />
          </button>
          <span className="absolute right-2 top-2 rounded-full bg-background/85 px-2 py-0.5 font-mono text-[10px] text-foreground/70">
            {index + 1}/{items.length}
          </span>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {items.map((media, dotIndex) => (
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${dotIndex === index ? "bg-accent" : "bg-background/70"}`}
                key={`${media.type}-${dotIndex}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
