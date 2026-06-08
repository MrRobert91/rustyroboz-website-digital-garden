/**
 * Hand-made / notebook visual primitives.
 * Wobbly ink lines, taped photos, sticky notes, rubber stamps, doodles.
 * All server-safe (no hooks, no shared SVG ids) and theme-token driven so
 * they recolor with the rust/paper palette automatically.
 */
import type { CSSProperties, ReactNode } from "react";

type Common = { className?: string; style?: CSSProperties };

const ACCENT = "hsl(var(--accent))";
const ACCENT_DEEP = "hsl(var(--accent-deep))";

// ---- Wobbly hand-drawn underline ----
export function Squiggle({
  width = 200,
  height = 12,
  color = ACCENT,
  strokeWidth = 2,
  seed = 1,
  className,
  style,
}: Common & { width?: number; height?: number; color?: string; strokeWidth?: number; seed?: number }) {
  const steps = 24;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const wobble = Math.sin(i * 0.7 + seed) * 1.6 + Math.sin(i * 1.7 + seed * 2) * 1;
    const y = height / 2 + wobble;
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg aria-hidden className={className} height={height} style={{ display: "block", overflow: "visible", ...style }} width={width}>
      <path d={points.join(" ")} fill="none" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
    </svg>
  );
}

// ---- Hand-drawn arrow ----
export function HandArrow({
  width = 80,
  height = 40,
  color = ACCENT,
  direction = "right",
  seed = 1,
  className,
}: Common & { width?: number; height?: number; color?: string; direction?: "right" | "left" | "down" | "curve"; seed?: number }) {
  const flip = direction === "left";
  const path =
    direction === "down"
      ? `M${width * 0.2},5 Q${width * 0.6},${height * 0.3} ${width * 0.5},${height * 0.85}`
      : direction === "curve"
        ? `M5,${height * 0.5} Q${width * 0.4},${height * 0.1} ${width - 10},${height * 0.6}`
        : `M5,${height * 0.5} Q${width * 0.4},${height * 0.4 + Math.sin(seed) * 4} ${width - 10},${height * 0.5}`;
  const headX = direction === "down" ? width * 0.5 : width - 10;
  const headY = direction === "down" ? height * 0.85 : height * 0.5;
  return (
    <svg
      aria-hidden
      className={className}
      height={height}
      style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}
      width={width}
    >
      <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeWidth="2" />
      <path
        d={`M${headX - 8},${headY - 6} L${headX},${headY} L${headX - 8},${headY + 6}`}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

// ---- Ink circle (for circling/numbering) ----
export function InkCircle({
  size = 40,
  color = ACCENT,
  seed = 1,
  strokeWidth = 2,
  children,
  className,
  style,
}: Common & { size?: number; color?: string; seed?: number; strokeWidth?: number; children?: ReactNode }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const steps = 36;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wob = Math.sin(a * 3 + seed) * 0.8 + Math.cos(a * 5 + seed * 1.7) * 0.6;
    const rr = r + wob;
    points.push(`${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-grid", placeItems: "center", width: size, height: size, ...style }}
    >
      <svg aria-hidden height={size} style={{ position: "absolute", inset: 0 }} width={size}>
        <path d={`${points.join(" ")} Z`} fill="none" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth} />
      </svg>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
}

// ---- Masking-tape strip ----
export function Tape({
  width = 70,
  height = 20,
  color = "rgba(214,196,142,0.7)",
  angle = -3,
  className,
  style,
}: Common & { width?: number; height?: number; color?: string; angle?: number }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        width,
        height,
        background: color,
        backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0 2px, transparent 2px 6px)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.2)",
        transform: `rotate(${angle}deg)`,
        position: "absolute",
        ...style,
      }}
    />
  );
}

// ---- Sticky note ----
export function Sticky({
  children,
  color = "#fde58a",
  angle = -2,
  className,
  style,
}: Common & { children?: ReactNode; color?: string; angle?: number }) {
  return (
    <div
      className={className}
      style={{
        background: color,
        padding: "14px 16px",
        color: "#3a2a1a",
        transform: `rotate(${angle}deg)`,
        boxShadow: "0 6px 14px -8px rgba(60,40,20,0.4), 0 1px 0 rgba(0,0,0,0.05)",
        position: "relative",
        lineHeight: 1.3,
        ...style,
      }}
    >
      <span className="font-hand text-lg">{children}</span>
    </div>
  );
}

// ---- Rubber stamp ----
export function InkStamp({
  label = "APPROVED",
  angle = -8,
  className,
  style,
}: Common & { label?: string; angle?: number }) {
  return (
    <span
      className={`font-mono ${className ?? ""}`}
      style={{
        border: "2px solid hsl(var(--accent))",
        color: "hsl(var(--accent))",
        padding: "6px 12px",
        fontSize: 11,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        fontWeight: 600,
        transform: `rotate(${angle}deg)`,
        display: "inline-block",
        opacity: 0.82,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 2px)",
        backgroundSize: "3px 3px",
        ...style,
      }}
    >
      ✱ {label}
    </span>
  );
}

// ---- Polaroid placeholder ----
export function Polaroid({
  label = "PHOTO",
  angle = -3,
  width = 200,
  height = 220,
  className,
  style,
}: Common & { label?: string; angle?: number; width?: number; height?: number }) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: "hsl(var(--paper-2))",
        padding: 10,
        paddingBottom: 38,
        boxShadow: "0 12px 24px -16px rgba(40,20,10,0.35), 0 1px 0 rgba(0,0,0,0.04)",
        transform: `rotate(${angle}deg)`,
        position: "relative",
        border: "1px solid hsl(var(--border))",
        ...style,
      }}
    >
      <Tape angle={-12} height={18} style={{ top: -8, left: width / 2 - 32 }} width={64} />
      <div
        style={{
          width: "100%",
          height: height - 60,
          background: "repeating-linear-gradient(135deg, #d8cdb8 0 8px, #c8bca6 8px 16px)",
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            color: "rgba(50,30,15,0.55)",
            textTransform: "uppercase",
            background: "rgba(251,247,238,0.85)",
            padding: "4px 8px",
          }}
        >
          {label}
        </span>
      </div>
      <span className="font-hand" style={{ position: "absolute", bottom: 8, left: 14, fontSize: 16, color: "#5a4426" }}>
        {label.toLowerCase()}
      </span>
    </div>
  );
}

// ---- Coffee ring stain (CSS gradient, no svg ids) ----
export function CoffeeRing({ size = 80, className, style }: Common & { size?: number }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, transparent 58%, rgba(140,90,40,0.16) 74%, rgba(140,90,40,0.30) 90%, transparent 96%)",
        boxShadow: "inset 0 0 0 1px rgba(140,90,40,0.12)",
        ...style,
      }}
    />
  );
}

// ---- Hand-drawn checkbox ----
export function HandCheck({ checked = true, color = ACCENT, size = 16 }: { checked?: boolean; color?: string; size?: number }) {
  return (
    <svg aria-hidden height={size} style={{ display: "inline-block", verticalAlign: "middle", overflow: "visible" }} width={size}>
      <path
        d={`M2,2 L${size - 2},2 L${size - 2},${size - 2} L2,${size - 2} Z`}
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      {checked ? (
        <path
          d={`M3,${size * 0.5} L${size * 0.45},${size - 3} L${size + 3},-2`}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2.2"
        />
      ) : null}
    </svg>
  );
}

// ---- Small ink doodles ----
const DOODLES = {
  spark: (c: string) => (
    <path d="M15,2 L15,28 M2,15 L28,15 M5,5 L25,25 M25,5 L5,25" stroke={c} strokeLinecap="round" strokeWidth="1.5" />
  ),
  star: (c: string) => (
    <path
      d="M15,3 L18,12 L27,12 L20,18 L23,27 L15,22 L7,27 L10,18 L3,12 L12,12 Z"
      fill="none"
      stroke={c}
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  ),
  bolt: (c: string) => (
    <path
      d="M14,3 L7,16 L13,16 L10,27 L20,12 L14,12 L17,3 Z"
      fill="none"
      stroke={c}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  ),
  gear: (c: string) => (
    <g>
      <circle cx="15" cy="15" fill="none" r="6" stroke={c} strokeWidth="1.5" />
      <circle cx="15" cy="15" fill="none" r="2" stroke={c} strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            stroke={c}
            strokeLinecap="round"
            strokeWidth="1.5"
            x1={15 + Math.cos(rad) * 6}
            x2={15 + Math.cos(rad) * 11}
            y1={15 + Math.sin(rad) * 6}
            y2={15 + Math.sin(rad) * 11}
          />
        );
      })}
    </g>
  ),
} as const;

export function Doodle({
  kind = "spark",
  color = ACCENT,
  size = 30,
  className,
  style,
}: Common & { kind?: keyof typeof DOODLES; color?: string; size?: number }) {
  return (
    <svg aria-hidden className={className} height={size} style={{ display: "inline-block", ...style }} viewBox="0 0 30 30" width={size}>
      {DOODLES[kind](color)}
    </svg>
  );
}

export { ACCENT as accentColor, ACCENT_DEEP as accentDeepColor };
