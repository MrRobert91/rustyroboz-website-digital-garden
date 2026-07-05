"use client";

/**
 * Thin rust "pencil line" under the sticky header that tracks reading
 * progress. Uses motion's scroll value (rAF-driven, transform-only).
 */
import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
