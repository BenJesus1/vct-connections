import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";

interface TileProps {
  word: string;
  selected: boolean;
  shaking?: boolean;
  disabled?: boolean;
  onToggle: (word: string) => void;
}

const MAX_FONT_PX = 16;
const MIN_FONT_PX = 9;

function fitText(el: HTMLElement) {
  const parent = el.parentElement;
  if (!parent) return;

  let size = MAX_FONT_PX;
  el.style.fontSize = `${size}px`;

  while (size > MIN_FONT_PX && el.scrollWidth > parent.clientWidth - 8) {
    size -= 0.5;
    el.style.fontSize = `${size}px`;
  }
}

export function Tile({
  word,
  selected,
  shaking = false,
  disabled = false,
  onToggle,
}: TileProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;

    fitText(el);

    const parent = el.parentElement;
    if (!parent || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => fitText(el));
    observer.observe(parent);
    return () => observer.disconnect();
  }, [word, selected]);

  useEffect(() => {
    if (!shaking) return;

    if (reducedMotion) {
      void controls.start({
        opacity: [1, 0.45, 1],
        transition: { duration: 0.3 },
      });
      return;
    }

    void controls.start({
      x: [0, -6, 6, -5, 5, -3, 3, 0],
      transition: { duration: 0.35, ease: "easeInOut" },
    });
  }, [shaking, controls, reducedMotion]);

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onToggle(word)}
      animate={controls}
      whileTap={disabled || selected ? undefined : { scale: 0.97 }}
      className={[
        "flex h-[68px] w-full items-center justify-center rounded-sm px-1.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-comms-accent",
        "disabled:cursor-default",
        selected
          ? "bg-comms-accent text-white scale-[0.97]"
          : "bg-comms-tile text-comms-text hover:brightness-110",
      ].join(" ")}
    >
      <span ref={labelRef} className="tile-label">
        {word}
      </span>
    </motion.button>
  );
}
