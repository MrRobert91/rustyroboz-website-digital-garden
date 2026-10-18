"use client";

import { useTranslation } from "@/components/language-provider";

type AnimationToggleProps = {
  paused: boolean;
  pause: () => void;
  resume: () => void;
  className?: string;
};

export function AnimationToggle({ paused, pause, resume, className }: AnimationToggleProps) {
  const { t } = useTranslation();
  return (
    <button
      aria-label={t(paused ? "Resume animation" : "Pause animation")}
      aria-pressed={paused}
      className={className}
      onClick={paused ? resume : pause}
      type="button"
    >
      {t(paused ? "Resume animation" : "Pause animation")}
    </button>
  );
}
