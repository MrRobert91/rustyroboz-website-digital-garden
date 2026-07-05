"use client";

/**
 * Hand-drawn analog clock showing live Madrid time in the footer.
 * Ticks only while visible (IntersectionObserver gates the interval);
 * hands render only after mount so SSR markup never mismatches.
 */
import { useEffect, useRef, useState } from "react";
import { jitter } from "@/lib/wire3d";

type Time = { h: number; m: number; s: number };

function madridTime(): Time {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { h: get("hour"), m: get("minute"), s: get("second") };
}

// Wobbly ink circle path — deterministic, so it can render on the server.
function wobblyCircle(cx: number, cy: number, r: number, seed: number): string {
  const steps = 40;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + jitter(i, seed, 0.9);
    pts.push(`${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `${pts.join(" ")} Z`;
}

const SIZE = 88;
const C = SIZE / 2;

export function WorkshopClock() {
  const [time, setTime] = useState<Time | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) {
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (!interval) {
        setTime(madridTime());
        interval = setInterval(() => setTime(madridTime()), 1000);
      }
    };
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
    io.observe(node);
    return () => {
      stop();
      io.disconnect();
    };
  }, []);

  const open = time ? time.h >= 9 && time.h < 20 : false;
  const hourAngle = time ? ((time.h % 12) + time.m / 60) * 30 : 0;
  const minAngle = time ? (time.m + time.s / 60) * 6 : 0;
  const secAngle = time ? time.s * 6 : 0;

  return (
    <div className="flex items-center gap-4" ref={wrapRef}>
      <svg aria-label={time ? `Madrid time ${String(time.h).padStart(2, "0")}:${String(time.m).padStart(2, "0")}` : "Madrid clock"} height={SIZE} role="img" style={{ overflow: "visible" }} width={SIZE}>
        <path d={wobblyCircle(C, C, C - 4, 7)} fill="hsl(var(--paper-2))" stroke="hsl(var(--foreground))" strokeWidth="1.6" />
        {/* tick marks — coords rounded so server/client float math can't
            drift in the last digit and trip hydration */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r0 = i % 3 === 0 ? C - 12 : C - 9;
          const round = (value: number) => Number(value.toFixed(2));
          return (
            <line
              key={i}
              stroke="hsl(var(--muted-foreground))"
              strokeLinecap="round"
              strokeWidth={i % 3 === 0 ? 1.8 : 1.1}
              x1={round(C + Math.cos(a) * r0)}
              x2={round(C + Math.cos(a) * (C - 6))}
              y1={round(C + Math.sin(a) * r0)}
              y2={round(C + Math.sin(a) * (C - 6))}
            />
          );
        })}
        {time ? (
          <g>
            <line stroke="hsl(var(--foreground))" strokeLinecap="round" strokeWidth="2.6" transform={`rotate(${hourAngle} ${C} ${C})`} x1={C} x2={C} y1={C + 3} y2={C - 18} />
            <line stroke="hsl(var(--foreground))" strokeLinecap="round" strokeWidth="1.8" transform={`rotate(${minAngle} ${C} ${C})`} x1={C} x2={C} y1={C + 4} y2={C - 27} />
            <line stroke="hsl(var(--accent))" strokeLinecap="round" strokeWidth="1.2" transform={`rotate(${secAngle} ${C} ${C})`} x1={C} x2={C} y1={C + 7} y2={C - 30} />
            <circle cx={C} cy={C} fill="hsl(var(--accent))" r="2.6" />
          </g>
        ) : (
          <circle cx={C} cy={C} fill="hsl(var(--muted-foreground))" r="2.6" />
        )}
      </svg>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Madrid bench</p>
        <p className="mt-1 flex items-center gap-2 font-hand text-xl text-foreground">
          <span
            aria-hidden
            className={open ? "inline-block size-2 rounded-full bg-accent" : "inline-block size-2 rounded-full border border-muted-foreground"}
          />
          {time ? (open ? "workshop open" : "lights off") : "winding up…"}
        </p>
      </div>
    </div>
  );
}
