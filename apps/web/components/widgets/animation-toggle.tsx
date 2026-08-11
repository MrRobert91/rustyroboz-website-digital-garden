type AnimationToggleProps = {
  paused: boolean;
  pause: () => void;
  resume: () => void;
  className?: string;
};

export function AnimationToggle({ paused, pause, resume, className }: AnimationToggleProps) {
  return (
    <button
      aria-label={paused ? "Resume animation" : "Pause animation"}
      aria-pressed={paused}
      className={className}
      onClick={paused ? resume : pause}
      type="button"
    >
      {paused ? "Resume animation" : "Pause animation"}
    </button>
  );
}
