import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  /** Auto-dismiss after ms. Pass null to keep until cleared. */
  durationMs?: number | null;
  onClear: () => void;
}

export function Toast({ message, durationMs = 1600, onClear }: ToastProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!message || durationMs === null) return;
    const id = window.setTimeout(onClear, durationMs);
    return () => window.clearTimeout(id);
  }, [message, durationMs, onClear]);

  return (
    <div className="relative flex min-h-8 items-center justify-center px-1" aria-live="polite">
      <AnimatePresence mode="wait">
        {message ? (
          <motion.p
            key={message}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.2 }}
            className="text-center font-body text-sm font-semibold leading-snug text-comms-text"
            role="status"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
