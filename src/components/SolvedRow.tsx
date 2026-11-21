import { motion, useReducedMotion } from "framer-motion";
import type { Group } from "../game/types";
import { DIFFICULTY } from "../theme";

interface SolvedRowProps {
  group: Group;
}

export function SolvedRow({ group }: SolvedRowProps) {
  const tier = DIFFICULTY[group.difficulty];
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, scaleY: 0.7, y: -6 }
      }
      animate={{ opacity: 1, scaleY: 1, y: 0 }}
      transition={{
        duration: reducedMotion ? 0.2 : 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex min-h-[68px] w-full origin-top flex-col items-center justify-center rounded-sm px-3 py-2 text-center"
      style={{ backgroundColor: tier.color, color: "#0F1923" }}
      role="status"
    >
      <p className="font-display text-sm tracking-wide uppercase sm:text-base">
        {group.category}
      </p>
      <p className="mt-0.5 font-body text-[11px] font-medium uppercase tracking-wide sm:text-xs">
        {group.words.join(", ")}
      </p>
    </motion.div>
  );
}
