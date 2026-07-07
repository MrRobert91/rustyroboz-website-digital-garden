"use client";

/**
 * Shared plumbing for the hand-drawn canvas widgets: DPR-aware sizing,
 * a rAF loop that only runs while the canvas is on screen, drag-to-rotate
 * with inertia, live theme colors, and prefers-reduced-motion support
 * (reduced = a static frame that still re-renders on drag/theme change).
 */
import { useEffect, useRef } from "react";

export type SketchInk = {
  ink: string;
  accent: string;
  accentDeep: string;
  faint: string;
  muted: string;
};

export type SketchState = {
  rx: number;
  ry: number;
  /** elapsed seconds while visible */
  t: number;
  /** changes ~7x per second → deterministic "boiling line" wobble */
  wobbleSeed: number;
  dragging: boolean;
};

type Options = {
  /** idle Y-rotation speed in rad/s */
  spin?: number;
  initialRx?: number;
  initialRy?: number;
  /** clamp for vertical tilt */
  maxRx?: number;
};

function cssColor(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value ? `hsl(${value})` : "#2a241e";
}

function readInk(): SketchInk {
  return {
    ink: cssColor("--foreground"),
    accent: cssColor("--accent"),
    accentDeep: cssColor("--accent-deep"),
    faint: cssColor("--border"),
    muted: cssColor("--muted-foreground"),
  };
}

export function useSketchCanvas(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number, state: SketchState, ink: SketchInk) => void,
  { spin = 0.3, initialRx = -0.14, initialRy = 0.5, maxRx = 1.05 }: Options = {},
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas?.getContext("2d") ?? null;
    } catch {
      // jsdom throws here — treat it as "no canvas support"
    }
    if (!canvas || !ctx) {
      return;
    }
    const context = ctx;

    const reduced =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state: SketchState = { rx: initialRx, ry: initialRy, t: 0, wobbleSeed: 1, dragging: false };
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let last = 0;
    let lastWobble = 0;
    let ink = readInk();

    const clampRx = (value: number) => Math.min(maxRx, Math.max(-maxRx, value));

    function render(now: number) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      state.t += dt;
      if (now - lastWobble > 140) {
        state.wobbleSeed = ((now * 0.73) % 977) + 1;
        lastWobble = now;
      }
      if (!state.dragging) {
        state.ry += (spin + vy) * dt;
        state.rx = clampRx(state.rx + vx * dt);
        const decay = Math.pow(0.12, dt);
        vx *= decay;
        vy *= decay;
      }
      const width = canvas!.clientWidth;
      const height = canvas!.clientHeight;
      context.clearRect(0, 0, width, height);
      drawRef.current(context, width, height, state, ink);
    }

    function loop(now: number) {
      render(now);
      raf = requestAnimationFrame(loop);
    }

    const start = () => {
      if (!raf && !reduced) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const renderStatic = () => render(performance.now());

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced || !raf) {
        renderStatic();
      }
    };

    // Live theme colors — repaint when .dark toggles on <html>.
    const themeWatch = new MutationObserver(() => {
      ink = readInk();
      if (reduced || !raf) {
        renderStatic();
      }
    });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
    resize();

    // Only animate while on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        start();
      } else {
        stop();
      }
    });
    io.observe(canvas);

    // Drag to rotate (with a bit of inertia on release).
    let px = 0;
    let py = 0;
    const onDown = (event: PointerEvent) => {
      state.dragging = true;
      px = event.clientX;
      py = event.clientY;
      vx = 0;
      vy = 0;
      canvas.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!state.dragging) {
        return;
      }
      const dx = event.clientX - px;
      const dy = event.clientY - py;
      px = event.clientX;
      py = event.clientY;
      state.ry += dx * 0.008;
      state.rx = clampRx(state.rx + dy * 0.006);
      vy = dx * 0.4;
      vx = dy * 0.3;
      if (reduced) {
        renderStatic();
      }
    };
    const onUp = () => {
      state.dragging = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    if (reduced) {
      renderStatic();
    }

    return () => {
      stop();
      io.disconnect();
      resizeObserver?.disconnect();
      themeWatch.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [spin, initialRx, initialRy, maxRx]);

  return canvasRef;
}
