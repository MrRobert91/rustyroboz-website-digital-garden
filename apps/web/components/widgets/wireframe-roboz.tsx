"use client";

/**
 * ROBOZ MK-1 — the site mascot as an interactive 3D wireframe, sketched on
 * a 2D canvas with manual projection (no three.js, ~zero bundle cost).
 * It idles with a slow spin + bob, blinks, keeps its pupils on the camera,
 * and can be dragged to spin. Strokes "boil" like a hand-drawn animation.
 */
import { useCallback } from "react";
import { Tape } from "@/components/notebook";
import { boxEdges, jitter, project, rotate, type Seg, type Vec3 } from "@/lib/wire3d";
import { useSketchCanvas, type SketchInk, type SketchState } from "./use-sketch-canvas";
import { cn } from "@/lib/utils";

// ---- Model (unit space, head centered on origin, y up) ----
const seg = (a: Vec3, b: Vec3): Seg => [a, b];

const MODEL: Seg[] = [
  // head shell
  ...boxEdges(0, 0.05, 0, 0.75, 0.62, 0.55),
  // ears / side vents
  ...boxEdges(-0.87, 0.08, 0, 0.12, 0.16, 0.2),
  ...boxEdges(0.87, 0.08, 0, 0.12, 0.16, 0.2),
  // mouth grill frame + slats (front face)
  ...boxFace(-0.42, -0.2, 0.42, -0.48, 0.551),
  seg([-0.34, -0.29, 0.551], [0.34, -0.29, 0.551]),
  seg([-0.34, -0.39, 0.551], [0.34, -0.39, 0.551]),
  // antenna mast
  seg([0, 0.67, 0], [0, 1.04, 0]),
  // neck
  seg([-0.2, -0.57, 0], [-0.24, -0.84, 0]),
  seg([0.2, -0.57, 0], [0.24, -0.84, 0]),
  seg([-0.34, -0.84, 0], [0.34, -0.84, 0]),
];

/** Rectangle outline on a z = const plane. */
function boxFace(x0: number, y0: number, x1: number, y1: number, z: number): Seg[] {
  return [
    seg([x0, y0, z], [x1, y0, z]),
    seg([x1, y0, z], [x1, y1, z]),
    seg([x1, y1, z], [x0, y1, z]),
    seg([x0, y1, z], [x0, y0, z]),
  ];
}

const EYES: { cx: number; cy: number }[] = [
  { cx: -0.32, cy: 0.22 },
  { cx: 0.32, cy: 0.22 },
];
const EYE_HALF_W = 0.15;
const EYE_HALF_H = 0.12;
const FACE_Z = 0.551;

/** 0 = eyes open, 1 = fully shut. Quick blink every ~3.6s. */
function blinkAmount(t: number): number {
  const phase = t % 3.6;
  return phase < 0.22 ? Math.sin((Math.PI * phase) / 0.22) * 0.88 : 0;
}

export function WireframeRoboz({ className }: { className?: string }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, state: SketchState, ink: SketchInk) => {
      const scale = Math.min(width, height) * 0.34;
      const cx = width / 2;
      const cy = height / 2 - scale * 0.1;
      const bob = Math.sin(state.t * 1.1) * 0.045;
      const seed = state.wobbleSeed;
      const wobble = 0.014; // model-space stroke jitter

      const view = (p: Vec3) => {
        const r = rotate(p, state.rx, state.ry);
        return [r[0], r[1] + bob, r[2]] as const;
      };

      // ground shadow (fades as the robot bobs up)
      ctx.save();
      ctx.globalAlpha = 0.14 - bob * 0.8;
      ctx.fillStyle = ink.ink;
      ctx.beginPath();
      ctx.ellipse(cx, cy + scale * 1.18, scale * (0.62 - bob * 1.4), scale * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // wireframe shell — back edges faded for depth
      ctx.lineCap = "round";
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = ink.ink;
      MODEL.forEach(([a, b], i) => {
        const ra = view(a);
        const rb = view(b);
        ctx.globalAlpha = (ra[2] + rb[2]) / 2 < -0.18 ? 0.28 : 0.9;
        const pa = project(ra, cx, cy, scale);
        const pb = project(rb, cx, cy, scale);
        const jx = jitter(i, seed, wobble) * scale;
        const jy = jitter(i + 57, seed, wobble) * scale;
        const mx = (pa.x + pb.x) / 2 + jitter(i + 113, seed, wobble * 1.6) * scale;
        const my = (pa.y + pb.y) / 2 + jitter(i + 211, seed, wobble * 1.6) * scale;
        ctx.beginPath();
        ctx.moveTo(pa.x + jx, pa.y + jy);
        ctx.quadraticCurveTo(mx, my, pb.x - jx, pb.y - jy);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // antenna tip — glowing accent bulb that pulses softly
      const tip = project(view([0, 1.12, 0]), cx, cy, scale);
      const pulse = 1 + Math.sin(state.t * 2.4) * 0.15;
      ctx.fillStyle = ink.accent;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 0.07 * scale * tip.depth * pulse, 0, Math.PI * 2);
      ctx.fill();

      // eyes — only when the face is turned toward the camera
      const facing = Math.cos(state.ry);
      if (facing > 0.05) {
        const shut = blinkAmount(state.t);
        const halfH = EYE_HALF_H * (1 - shut);
        // pupils keep looking at the camera as the head turns
        const lookX = Math.max(-0.055, Math.min(0.055, -Math.sin(state.ry) * 0.09));
        const lookY = Math.max(-0.045, Math.min(0.045, Math.sin(state.rx) * 0.08));
        for (const eye of EYES) {
          ctx.strokeStyle = ink.ink;
          ctx.globalAlpha = 0.9 * facing;
          strokeFaceRect(ctx, view, cx, cy, scale, eye.cx, eye.cy, EYE_HALF_W, halfH);
          if (shut < 0.6) {
            const pupil = project(view([eye.cx + lookX, eye.cy + lookY, FACE_Z]), cx, cy, scale);
            ctx.fillStyle = ink.accent;
            ctx.beginPath();
            ctx.arc(pupil.x, pupil.y, 0.052 * scale * pupil.depth * (1 - shut), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }
    },
    [],
  );

  const canvasRef = useSketchCanvas(draw, { spin: 0.32, initialRx: -0.16, initialRy: 0.45 });

  return (
    <div className={cn("relative w-[300px] max-w-full", className)}>
      <Tape angle={-5} height={20} style={{ top: -10, left: 24 }} width={84} />
      <div className="border border-border bg-paper-2/70 p-3 shadow-paper">
        <canvas
          aria-label="Interactive 3D wireframe sketch of the Rusty Roboz robot mascot. Drag to spin it around."
          className="h-60 w-full cursor-grab active:cursor-grabbing"
          ref={canvasRef}
          role="img"
          style={{ touchAction: "pan-y" }}
        />
        <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-dashed border-border/70 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Fig. 00 — Roboz MK-1
          </span>
          <span className="font-hand text-base text-accent-deep">drag to spin ↻</span>
        </div>
      </div>
    </div>
  );
}

/** Stroke a wobble-free rectangle on the front face (eyes stay crisp). */
function strokeFaceRect(
  ctx: CanvasRenderingContext2D,
  view: (p: Vec3) => readonly [number, number, number],
  cx: number,
  cy: number,
  scale: number,
  ex: number,
  ey: number,
  hw: number,
  hh: number,
) {
  const corners: Vec3[] = [
    [ex - hw, ey - hh, FACE_Z],
    [ex + hw, ey - hh, FACE_Z],
    [ex + hw, ey + hh, FACE_Z],
    [ex - hw, ey + hh, FACE_Z],
  ];
  ctx.beginPath();
  corners.forEach((corner, i) => {
    const p = project(view(corner), cx, cy, scale);
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  });
  ctx.closePath();
  ctx.lineWidth = 1.4;
  ctx.stroke();
}
