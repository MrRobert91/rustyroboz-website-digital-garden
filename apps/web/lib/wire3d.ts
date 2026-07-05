/**
 * Tiny 3D wireframe math for the hand-drawn canvas widgets (hero robot,
 * lab Bloch sphere). Zero dependencies: points get rotated, perspective
 * projected and stroked onto a 2D canvas by the widgets themselves.
 */

export type Vec3 = readonly [number, number, number];
export type Seg = readonly [Vec3, Vec3];

/** Rotate around the X axis then the Y axis (view-style tumble). */
export function rotate([x, y, z]: Vec3, rx: number, ry: number): Vec3 {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const x1 = x * cy + z * sy;
  const z1 = z * cy - x * sy;
  const y1 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return [x1, y1, z2];
}

/** Rodrigues rotation of `v` around unit axis `k` by angle `a`. */
export function rotateAxis(v: Vec3, k: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dot = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  const cross: Vec3 = [
    k[1] * v[2] - k[2] * v[1],
    k[2] * v[0] - k[0] * v[2],
    k[0] * v[1] - k[1] * v[0],
  ];
  return [
    v[0] * c + cross[0] * s + k[0] * dot * (1 - c),
    v[1] * c + cross[1] * s + k[1] * dot * (1 - c),
    v[2] * c + cross[2] * s + k[2] * dot * (1 - c),
  ];
}

export function normalize([x, y, z]: Vec3): Vec3 {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

export type Projected = { x: number; y: number; depth: number };

/**
 * Perspective projection. `depth` grows for points closer to the camera,
 * useful for scaling details and fading back edges. Pass a large `dist`
 * for a near-orthographic look (used by the Bloch sphere).
 */
export function project(
  [x, y, z]: Vec3,
  cx: number,
  cy: number,
  scale: number,
  dist = 4.2,
): Projected {
  const f = dist / (dist - z);
  return { x: cx + x * scale * f, y: cy - y * scale * f, depth: f };
}

/**
 * Deterministic pseudo-random jitter in [-amp, amp] — gives strokes the
 * "boiling line" wobble of a hand-drawn sketch without Math.random() in
 * the render loop (the seed changes a few times per second instead).
 */
export function jitter(i: number, seed: number, amp = 1): number {
  return Math.sin(i * 127.1 + seed * 311.7) * amp;
}

/** The 12 edges of an axis-aligned box centered at (cx, cy, cz). */
export function boxEdges(cx: number, cy: number, cz: number, hx: number, hy: number, hz: number): Seg[] {
  const c = (sx: number, sy: number, sz: number): Vec3 => [cx + sx * hx, cy + sy * hy, cz + sz * hz];
  return [
    // bottom ring
    [c(-1, -1, -1), c(1, -1, -1)],
    [c(1, -1, -1), c(1, -1, 1)],
    [c(1, -1, 1), c(-1, -1, 1)],
    [c(-1, -1, 1), c(-1, -1, -1)],
    // top ring
    [c(-1, 1, -1), c(1, 1, -1)],
    [c(1, 1, -1), c(1, 1, 1)],
    [c(1, 1, 1), c(-1, 1, 1)],
    [c(-1, 1, 1), c(-1, 1, -1)],
    // pillars
    [c(-1, -1, -1), c(-1, 1, -1)],
    [c(1, -1, -1), c(1, 1, -1)],
    [c(1, -1, 1), c(1, 1, 1)],
    [c(-1, -1, 1), c(-1, 1, 1)],
  ];
}
