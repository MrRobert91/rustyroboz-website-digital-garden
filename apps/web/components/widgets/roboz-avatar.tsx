"use client";

/**
 * Full-body ROBOZ avatar for the personal chat — same hand-drawn 3D wireframe
 * language as the hero mascot (manual projection on a 2D canvas, no three.js).
 *
 * Moods drive a procedurally-animated pose, smoothly lerped between states:
 *  - idle:      bobs, looks around, occasionally waves — keeps itself entertained
 *  - listening: perks up, hands clasped, wide pupils, bright antenna
 *  - thinking:  hand on chin, eyes up, fast antenna blink + thought dots
 *  - talking:   gesticulates like it's explaining, head nods, mouth equalizer
 */
import { useCallback, useEffect, useRef } from "react";
import { boxEdges, jitter, project, rotate, type Seg, type Vec3 } from "@/lib/wire3d";
import { useSketchCanvas, type SketchInk, type SketchState } from "./use-sketch-canvas";
import { cn } from "@/lib/utils";

export type RobozMood = "idle" | "listening" | "thinking" | "talking";

const HEAD_CENTER: Vec3 = [0, 0.88, 0];
const FACE_Z = 0.271;

// Static skeleton (everything but head + arms), in body space.
const BODY_SEGS: Seg[] = [
  // torso + chest panel
  ...boxEdges(0, 0.12, 0, 0.42, 0.38, 0.24),
  ...rectOnZ(-0.18, 0.02, 0.18, 0.3, 0.241),
  // pelvis
  ...boxEdges(0, -0.4, 0, 0.3, 0.12, 0.2),
  // neck
  [[-0.08, 0.5, 0], [-0.08, 0.58, 0]],
  [[0.08, 0.5, 0], [0.08, 0.58, 0]],
  // legs
  [[-0.16, -0.52, 0], [-0.17, -0.9, 0]],
  [[-0.17, -0.9, 0], [-0.16, -1.24, 0]],
  [[0.16, -0.52, 0], [0.17, -0.9, 0]],
  [[0.17, -0.9, 0], [0.16, -1.24, 0]],
  // feet
  ...boxEdges(-0.16, -1.3, 0.06, 0.09, 0.05, 0.16),
  ...boxEdges(0.16, -1.3, 0.06, 0.09, 0.05, 0.16),
];

const HEAD_SEGS: Seg[] = [
  ...boxEdges(0, 0.88, 0, 0.38, 0.3, 0.27),
  // antenna mast
  [[0, 1.18, 0], [0, 1.4, 0]],
  // ear vents
  [[-0.38, 0.82, -0.08], [-0.46, 0.82, -0.08]],
  [[-0.38, 0.82, 0.08], [-0.46, 0.82, 0.08]],
  [[-0.46, 0.82, -0.08], [-0.46, 0.82, 0.08]],
  [[0.38, 0.82, -0.08], [0.46, 0.82, -0.08]],
  [[0.38, 0.82, 0.08], [0.46, 0.82, 0.08]],
  [[0.46, 0.82, -0.08], [0.46, 0.82, 0.08]],
];

function rectOnZ(x0: number, y0: number, x1: number, y1: number, z: number): Seg[] {
  return [
    [[x0, y0, z], [x1, y0, z]],
    [[x1, y0, z], [x1, y1, z]],
    [[x1, y1, z], [x0, y1, z]],
    [[x0, y1, z], [x0, y0, z]],
  ];
}

// Poses are art-directed joint positions (x, y in body space), lerped smoothly.
type Pose = {
  lElbow: [number, number];
  lHand: [number, number];
  rElbow: [number, number];
  rHand: [number, number];
  headYaw: number;
  headPitch: number;
  pupil: number; // pupil radius multiplier
  antennaHz: number; // antenna pulse speed
};

function targetPose(mood: RobozMood, t: number): Pose {
  switch (mood) {
    case "listening":
      return {
        lElbow: [-0.5, 0.02],
        lHand: [-0.08, -0.14],
        rElbow: [0.5, 0.02],
        rHand: [0.08, -0.14],
        headYaw: 0,
        headPitch: 0.05,
        pupil: 1.35,
        antennaHz: 2.6,
      };
    case "thinking":
      return {
        lElbow: [-0.48, -0.02],
        lHand: [-0.1, -0.06],
        rElbow: [0.56, 0.14],
        rHand: [0.17, 0.56],
        headYaw: 0.3 + Math.sin(t * 0.9) * 0.06,
        headPitch: 0.12,
        pupil: 0.85,
        antennaHz: 5.2,
      };
    case "talking":
      return {
        lElbow: [-0.53, 0.06],
        lHand: [-0.56, 0.22 + Math.sin(t * 2.3) * 0.14],
        rElbow: [0.53, 0.08],
        rHand: [0.56, 0.26 + Math.sin(t * 2.3 + 2.1) * 0.14],
        headYaw: Math.sin(t * 0.7) * 0.08,
        headPitch: -0.03 + Math.sin(t * 2.3) * 0.035,
        pupil: 1,
        antennaHz: 1.8,
      };
    default: {
      // idle — hang loose, look around, wave every ~9s
      const wavePhase = t % 9;
      const waving = wavePhase > 7 && wavePhase < 8.4;
      const wave = waving ? Math.sin((wavePhase - 7) * Math.PI * 4) : 0;
      return {
        lElbow: [-0.48, 0.02],
        lHand: [-0.5 - Math.sin(t * 1.1) * 0.02, -0.32],
        rElbow: waving ? [0.56, 0.3] : [0.48, 0.02],
        rHand: waving ? [0.62 + wave * 0.07, 0.72] : [0.5 + Math.sin(t * 1.1 + 1) * 0.02, -0.32],
        headYaw: Math.sin(t * 0.33) * 0.34 + Math.sin(t * 0.11) * 0.12,
        headPitch: Math.sin(t * 0.5) * 0.03,
        pupil: 1,
        antennaHz: 1.1,
      };
    }
  }
}

/** 0 = open, ~1 = shut. Blink every ~3.4s. */
function blinkAmount(t: number): number {
  const phase = t % 3.4;
  return phase < 0.2 ? Math.sin((Math.PI * phase) / 0.2) * 0.9 : 0;
}

export function RobozAvatar({ mood = "idle", className }: { mood?: RobozMood; className?: string }) {
  const moodRef = useRef<RobozMood>(mood);
  const poseRef = useRef<Pose>(targetPose("idle", 0));
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, state: SketchState, ink: SketchInk) => {
      const t = state.t;
      const currentMood = moodRef.current;
      const scale = height / 3.25;
      const cx = width / 2;
      const cy = height * 0.47;
      const bob = Math.sin(t * 1.15) * 0.022;
      const seed = state.wobbleSeed;

      // ease the pose toward the current mood target
      const target = targetPose(currentMood, t);
      const pose = poseRef.current;
      const k = 0.09; // per-frame lerp (~smooth 0.3s transition at 60fps)
      const mix = (a: number, b: number) => a + (b - a) * k;
      pose.lElbow = [mix(pose.lElbow[0], target.lElbow[0]), mix(pose.lElbow[1], target.lElbow[1])];
      pose.lHand = [mix(pose.lHand[0], target.lHand[0]), mix(pose.lHand[1], target.lHand[1])];
      pose.rElbow = [mix(pose.rElbow[0], target.rElbow[0]), mix(pose.rElbow[1], target.rElbow[1])];
      pose.rHand = [mix(pose.rHand[0], target.rHand[0]), mix(pose.rHand[1], target.rHand[1])];
      pose.headYaw = mix(pose.headYaw, target.headYaw);
      pose.headPitch = mix(pose.headPitch, target.headPitch);
      pose.pupil = mix(pose.pupil, target.pupil);
      pose.antennaHz = mix(pose.antennaHz, target.antennaHz);

      const view = (p: Vec3) => {
        const r = rotate(p, state.rx, state.ry);
        return [r[0], r[1] + bob, r[2]] as const;
      };
      // head vertices get their own yaw/pitch around the head center first
      const viewHead = (p: Vec3) => {
        const local: Vec3 = [p[0] - HEAD_CENTER[0], p[1] - HEAD_CENTER[1], p[2] - HEAD_CENTER[2]];
        const turned = rotate(local, pose.headPitch, pose.headYaw);
        return view([turned[0] + HEAD_CENTER[0], turned[1] + HEAD_CENTER[1], turned[2] + HEAD_CENTER[2]]);
      };

      const drawSeg = (a: Vec3, b: Vec3, i: number, transform: (p: Vec3) => readonly [number, number, number]) => {
        const ra = transform(a);
        const rb = transform(b);
        ctx.globalAlpha = (ra[2] + rb[2]) / 2 < -0.16 ? 0.26 : 0.9;
        const pa = project(ra, cx, cy, scale);
        const pb = project(rb, cx, cy, scale);
        const wobble = 0.012 * scale;
        const jx = jitter(i, seed, wobble);
        const jy = jitter(i + 57, seed, wobble);
        const mx = (pa.x + pb.x) / 2 + jitter(i + 113, seed, wobble * 1.6);
        const my = (pa.y + pb.y) / 2 + jitter(i + 211, seed, wobble * 1.6);
        ctx.beginPath();
        ctx.moveTo(pa.x + jx, pa.y + jy);
        ctx.quadraticCurveTo(mx, my, pb.x - jx, pb.y - jy);
        ctx.stroke();
      };

      // ground shadow
      ctx.save();
      ctx.globalAlpha = 0.13 - bob * 1.2;
      ctx.fillStyle = ink.ink;
      ctx.beginPath();
      ctx.ellipse(cx, cy + scale * 1.42, scale * (0.58 - bob * 2), scale * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.lineCap = "round";
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = ink.ink;

      BODY_SEGS.forEach(([a, b], i) => drawSeg(a, b, i, view));
      HEAD_SEGS.forEach(([a, b], i) => drawSeg(a, b, i + 200, viewHead));

      // arms — shoulders fixed on the torso, joints from the eased pose
      const arms: Seg[] = [
        [[-0.42, 0.38, 0], [pose.lElbow[0], pose.lElbow[1], 0.02]],
        [[pose.lElbow[0], pose.lElbow[1], 0.02], [pose.lHand[0], pose.lHand[1], 0.06]],
        [[0.42, 0.38, 0], [pose.rElbow[0], pose.rElbow[1], 0.02]],
        [[pose.rElbow[0], pose.rElbow[1], 0.02], [pose.rHand[0], pose.rHand[1], 0.06]],
      ];
      arms.forEach(([a, b], i) => drawSeg(a, b, i + 300, view));
      // hands
      for (const [hx, hy] of [pose.lHand, pose.rHand]) {
        const p = project(view([hx, hy, 0.06]), cx, cy, scale);
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.055 * scale * p.depth, 0, Math.PI * 2);
        ctx.stroke();
      }

      // antenna tip — mood-speed pulse
      const tip = project(viewHead([0, 1.47, 0]), cx, cy, scale);
      const pulse = 1 + Math.sin(t * pose.antennaHz * 2) * 0.25;
      ctx.globalAlpha = 1;
      ctx.fillStyle = ink.accent;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 0.05 * scale * tip.depth * pulse, 0, Math.PI * 2);
      ctx.fill();

      // face — eyes track the viewer, mouth talks
      const facing = Math.cos(state.ry + pose.headYaw);
      if (facing > 0.05) {
        const shut = blinkAmount(t);
        const eyeHalfH = 0.07 * (1 - shut);
        const lookX = Math.max(-0.04, Math.min(0.04, -Math.sin(state.ry + pose.headYaw) * 0.07));
        const lookY =
          currentMood === "thinking" ? 0.035 : Math.max(-0.03, Math.min(0.03, Math.sin(state.rx + pose.headPitch) * 0.06));
        for (const ex of [-0.16, 0.16]) {
          // eye outline
          ctx.strokeStyle = ink.ink;
          ctx.globalAlpha = 0.88 * facing;
          ctx.beginPath();
          const corners: Vec3[] = [
            [ex - 0.08, 0.93 - eyeHalfH, FACE_Z],
            [ex + 0.08, 0.93 - eyeHalfH, FACE_Z],
            [ex + 0.08, 0.93 + eyeHalfH, FACE_Z],
            [ex - 0.08, 0.93 + eyeHalfH, FACE_Z],
          ];
          corners.forEach((corner, index) => {
            const p = project(viewHead(corner), cx, cy, scale);
            if (index === 0) {
              ctx.moveTo(p.x, p.y);
            } else {
              ctx.lineTo(p.x, p.y);
            }
          });
          ctx.closePath();
          ctx.stroke();
          if (shut < 0.6) {
            const pupil = project(viewHead([ex + lookX, 0.93 + lookY, FACE_Z]), cx, cy, scale);
            ctx.fillStyle = ink.accent;
            ctx.beginPath();
            ctx.arc(pupil.x, pupil.y, 0.032 * scale * pupil.depth * pose.pupil * (1 - shut), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // mouth
        if (currentMood === "talking") {
          ctx.strokeStyle = ink.accent;
          ctx.lineWidth = 2;
          [-0.07, 0, 0.07].forEach((mx, i) => {
            const level = 0.02 + Math.abs(Math.sin(t * 9 + i * 1.4)) * 0.045;
            const top = project(viewHead([mx, 0.72 + level, FACE_Z]), cx, cy, scale);
            const bottom = project(viewHead([mx, 0.72 - level, FACE_Z]), cx, cy, scale);
            ctx.globalAlpha = 0.9 * facing;
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(bottom.x, bottom.y);
            ctx.stroke();
          });
          ctx.lineWidth = 1.4;
        } else {
          const smile = currentMood === "listening" ? 0.018 : 0.008;
          const left = project(viewHead([-0.1, 0.72, FACE_Z]), cx, cy, scale);
          const mid = project(viewHead([0, 0.72 - smile, FACE_Z]), cx, cy, scale);
          const right = project(viewHead([0.1, 0.72, FACE_Z]), cx, cy, scale);
          ctx.strokeStyle = ink.ink;
          ctx.globalAlpha = 0.85 * facing;
          ctx.beginPath();
          ctx.moveTo(left.x, left.y);
          ctx.quadraticCurveTo(mid.x, mid.y, right.x, right.y);
          ctx.stroke();
        }
      }

      // chest light — accent dot, brighter while thinking/talking
      const chest = project(view([0, -0.08, 0.241]), cx, cy, scale);
      ctx.globalAlpha = currentMood === "idle" ? 0.5 : 0.9;
      ctx.fillStyle = ink.accent;
      ctx.beginPath();
      ctx.arc(chest.x, chest.y, 0.028 * scale * chest.depth, 0, Math.PI * 2);
      ctx.fill();

      // thought dots while thinking
      if (currentMood === "thinking") {
        [
          [0.5, 1.32, 2.2],
          [0.66, 1.5, 3],
          [0.84, 1.7, 3.8],
        ].forEach(([dx, dy, r], i) => {
          const p = project(view([dx, dy, 0]), cx, cy, scale);
          ctx.globalAlpha = 0.35 + Math.abs(Math.sin(t * 2.4 - i * 0.7)) * 0.55;
          ctx.fillStyle = ink.accentDeep;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * (scale / 80), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.globalAlpha = 1;
    },
    [],
  );

  const canvasRef = useSketchCanvas(draw, { spin: 0, initialRx: -0.06, initialRy: 0.16, maxRx: 0.5 });

  return (
    <canvas
      aria-label="ROBOZ, the hand-drawn robot assistant. It idles, listens, thinks and talks along with the conversation. Drag to spin."
      className={cn("h-64 w-full cursor-grab active:cursor-grabbing", className)}
      ref={canvasRef}
      role="img"
      style={{ touchAction: "pan-y" }}
    />
  );
}
