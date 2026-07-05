"use client";

/**
 * Qubit on the bench — a hand-drawn Bloch sphere on canvas (same tiny
 * wireframe engine as the hero robot, no three.js). The state vector
 * animates along the real rotation arc when a gate button is pressed.
 * Convention (draw space): |0⟩ = up (+y), x̂ = right (+x), ŷ = depth (+z).
 */
import { useCallback, useRef, useState } from "react";
import { project, rotate, rotateAxis, normalize, type Vec3 } from "@/lib/wire3d";
import { useSketchCanvas, type SketchInk, type SketchState } from "./use-sketch-canvas";

const KET_0: Vec3 = [0, 1, 0];
const ORTHO = 60; // near-orthographic camera distance

type Gate = { label: string; axis: Vec3; hint: string };

const GATES: Gate[] = [
  { label: "X", axis: [1, 0, 0], hint: "bit flip" },
  { label: "Z", axis: [0, 1, 0], hint: "phase flip" },
  { label: "H", axis: normalize([1, 1, 0]), hint: "superposition" },
];

/** α|0⟩ + e^{iφ}·β|1⟩ readout from a Bloch vector. */
function amplitudes(v: Vec3): string {
  const theta = Math.acos(Math.max(-1, Math.min(1, v[1])));
  const alpha = Math.cos(theta / 2);
  const beta = Math.sin(theta / 2);
  let phi = Math.atan2(v[2], v[0]) / Math.PI;
  if (beta < 0.01) {
    return "|ψ⟩ = 1.00 |0⟩";
  }
  if (phi < 0) {
    phi += 2;
  }
  const phase = phi < 0.01 || phi > 1.99 ? "" : `e^i${phi.toFixed(2)}π `;
  if (alpha < 0.01) {
    return `|ψ⟩ = ${phase}1.00 |1⟩`;
  }
  return `|ψ⟩ = ${alpha.toFixed(2)} |0⟩ + ${phase}${beta.toFixed(2)} |1⟩`;
}

function circlePoints(kind: "equator" | "xy" | "yz", steps = 56): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push(kind === "equator" ? [c, 0, s] : kind === "xy" ? [c, s, 0] : [0, s, c]);
  }
  return pts;
}

const CIRCLES = [circlePoints("equator"), circlePoints("xy"), circlePoints("yz")];

export function BlochSphere() {
  // Live vector mutates inside the draw loop; queued gates animate as arcs.
  const vecRef = useRef<Vec3>(KET_0);
  const queueRef = useRef<{ axis: Vec3; remaining: number }[]>([]);
  const lastT = useRef(0);
  // Settled state (after all queued gates) drives the text readout.
  const finalRef = useRef<Vec3>(KET_0);
  const [readout, setReadout] = useState(() => amplitudes(KET_0));

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, state: SketchState, ink: SketchInk) => {
      const dt = Math.max(0, Math.min(state.t - lastT.current, 0.05));
      lastT.current = state.t;

      // advance the gate animation queue (π rotation per gate)
      const queue = queueRef.current;
      if (queue.length > 0) {
        const gate = queue[0];
        const step = Math.min(gate.remaining, dt * 5.2);
        vecRef.current = normalize(rotateAxis(vecRef.current, gate.axis, step));
        gate.remaining -= step;
        if (gate.remaining <= 1e-4) {
          queue.shift();
        }
      }

      const R = Math.min(width, height) * 0.36;
      const cx = width / 2;
      const cy = height / 2;
      const view = (p: Vec3) => rotate(p, state.rx, state.ry);
      const flat = (p: Vec3) => project(view(p), cx, cy, R, ORTHO);

      // silhouette
      ctx.lineCap = "round";
      ctx.strokeStyle = ink.ink;
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // wireframe great circles, back half faded
      ctx.lineWidth = 1;
      for (const circle of CIRCLES) {
        for (let i = 0; i < circle.length - 1; i++) {
          const a = view(circle[i]);
          const b = view(circle[i + 1]);
          ctx.globalAlpha = (a[2] + b[2]) / 2 < 0 ? 0.12 : 0.4;
          const pa = project(a, cx, cy, R, ORTHO);
          const pb = project(b, cx, cy, R, ORTHO);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      }

      // axes (dashed) + labels
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = ink.muted;
      ctx.setLineDash([4, 5]);
      const axes: { from: Vec3; to: Vec3; label: string; at: Vec3 }[] = [
        { from: [0, -1.18, 0], to: [0, 1.18, 0], label: "|0⟩", at: [0, 1.34, 0] },
        { from: [-1.18, 0, 0], to: [1.18, 0, 0], label: "x̂", at: [1.32, 0, 0] },
        { from: [0, 0, -1.18], to: [0, 0, 1.18], label: "ŷ", at: [0, 0, 1.34] },
      ];
      for (const axis of axes) {
        const pa = flat(axis.from);
        const pb = flat(axis.to);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.font = "600 12px ui-monospace, SFMono-Regular, monospace";
      ctx.fillStyle = ink.muted;
      ctx.globalAlpha = 0.9;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const axis of axes) {
        const p = flat(axis.at);
        ctx.fillText(axis.label, p.x, p.y);
      }
      const p1 = flat([0, -1.34, 0]);
      ctx.fillText("|1⟩", p1.x, p1.y);

      // state vector — rust-red arrow with a dashed drop line to the equator
      const v = vecRef.current;
      const tipV = view(v);
      const tip = project(tipV, cx, cy, R, ORTHO);
      const drop = flat([v[0], 0, v[2]]);
      ctx.strokeStyle = ink.accent;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(drop.x, drop.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
      // arrowhead
      const angle = Math.atan2(tip.y - cy, tip.x - cx);
      ctx.fillStyle = ink.accent;
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x - 9 * Math.cos(angle - 0.4), tip.y - 9 * Math.sin(angle - 0.4));
      ctx.lineTo(tip.x - 9 * Math.cos(angle + 0.4), tip.y - 9 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    },
    [],
  );

  const canvasRef = useSketchCanvas(draw, { spin: 0.12, initialRx: -0.32, initialRy: 0.6, maxRx: 1.25 });

  const applyGate = (gate: Gate) => {
    queueRef.current.push({ axis: gate.axis, remaining: Math.PI });
    finalRef.current = normalize(rotateAxis(finalRef.current, gate.axis, Math.PI));
    setReadout(amplitudes(finalRef.current));
  };

  const reset = () => {
    queueRef.current = [];
    vecRef.current = KET_0;
    finalRef.current = KET_0;
    setReadout(amplitudes(KET_0));
  };

  const chip =
    "border border-border bg-paper-2 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground shadow-paper transition-all duration-150 hover:border-accent/60 hover:text-accent active:translate-y-px";

  return (
    <div className="w-full">
      <canvas
        aria-label="Interactive hand-drawn Bloch sphere showing a qubit state vector. Drag to rotate the view; use the gate buttons to apply quantum gates."
        className="h-72 w-full cursor-grab active:cursor-grabbing"
        ref={canvasRef}
        role="img"
        style={{ touchAction: "pan-y" }}
      />
      <p aria-live="polite" className="mt-3 text-center font-mono text-sm text-accent-deep">
        {readout}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        {GATES.map((gate) => (
          <button className={chip} key={gate.label} onClick={() => applyGate(gate)} title={gate.hint} type="button">
            {gate.label}
          </button>
        ))}
        <button className={chip} onClick={reset} type="button">
          reset |0⟩
        </button>
        <span className="ml-1 font-hand text-lg text-muted-foreground">← poke the gates</span>
      </div>
    </div>
  );
}
