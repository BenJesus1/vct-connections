import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatCountdown,
  msUntilNextLocalMidnight,
} from "../game/daily";
import { buildShareText, copyShareText } from "../game/share";
import type { GameState, SavedState } from "../game/types";

interface EndModalProps {
  open: boolean;
  state: GameState;
  stats: SavedState["stats"];
  shareTitle?: string;
  puzzleLink?: string;
  showCareerStats?: boolean;
  onClose: () => void;
}

export function EndModal({
  open,
  state,
  stats,
  shareTitle,
  puzzleLink,
  showCareerStats = true,
  onClose,
}: EndModalProps) {
  const reducedMotion = useReducedMotion();
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(msUntilNextLocalMidnight()),
  );
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareText = useMemo(
    () =>
      buildShareText(state.puzzle, state.guesses, {
        title: shareTitle,
      }),
    [state.puzzle, state.guesses, shareTitle],
  );

  const winRate =
    stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100);

  useEffect(() => {
    if (!open) return;
    const tick = () => setCountdown(formatCountdown(msUntilNextLocalMidnight()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setCopiedLink(false);
    }
  }, [open]);

  async function handleShare() {
    const ok = await copyShareText(shareText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  async function handleCopyLink() {
    if (!puzzleLink) return;
    const ok = await copyShareText(puzzleLink);
    if (ok) {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1600);
    }
  }

  const title = state.status === "won" ? "COMMS SECURE" : "SIGNAL LOST";
  const subtitle =
    state.status === "won"
      ? `Cleared with ${state.mistakes} mistake${state.mistakes === 1 ? "" : "s"}`
      : showCareerStats
        ? "Out of mistakes — better luck tomorrow"
        : "Out of mistakes";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-modal-title"
            className="w-full max-w-[390px] border border-comms-text/15 bg-comms-bg p-5 shadow-2xl"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
                  {shareTitle ?? `Puzzle #${state.puzzle.id}`}
                </p>
                <h2
                  id="end-modal-title"
                  className="mt-1 font-display text-3xl tracking-wide text-comms-text"
                >
                  {title}
                </h2>
                <p className="mt-1 font-body text-sm text-comms-muted">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="font-body text-sm text-comms-muted hover:text-comms-text"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            {showCareerStats ? (
              <>
                <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                  <Stat label="Played" value={String(stats.played)} />
                  <Stat label="Win %" value={String(winRate)} />
                  <Stat label="Streak" value={String(stats.currentStreak)} />
                  <Stat label="Max" value={String(stats.maxStreak)} />
                </div>

                <div className="mt-5">
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-comms-muted">
                    Mistake distribution
                  </p>
                  <MistakeBars
                    distribution={stats.mistakeDistribution}
                    highlight={
                      state.status === "won"
                        ? Math.min(3, state.mistakes)
                        : 4
                    }
                  />
                </div>
              </>
            ) : null}

            <pre className="mt-5 overflow-x-auto rounded-sm bg-comms-tile px-3 py-3 font-body text-sm leading-relaxed text-comms-text">
              {shareText}
            </pre>

            <button
              type="button"
              onClick={() => void handleShare()}
              className="clip-angled mt-4 w-full bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              {copied ? "Copied!" : "Share results"}
            </button>

            {puzzleLink ? (
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="clip-angled mt-2.5 w-full border border-comms-text/70 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-comms-text transition hover:bg-comms-tile"
              >
                {copiedLink ? "Link copied!" : "Copy puzzle link"}
              </button>
            ) : null}

            {showCareerStats ? (
              <Link
                to="/ranks"
                className="mt-2.5 block text-center font-body text-xs font-semibold uppercase tracking-wide text-comms-accent hover:underline"
              >
                View ranks
              </Link>
            ) : null}

            {showCareerStats ? (
              <div className="mt-5 border-t border-comms-text/10 pt-4 text-center">
                <p className="font-body text-xs uppercase tracking-wide text-comms-muted">
                  Next puzzle in
                </p>
                <p className="mt-1 font-display text-2xl tracking-wide text-comms-text tabular-nums">
                  {countdown}
                </p>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-comms-tile px-1 py-2">
      <p className="font-display text-xl text-comms-text">{value}</p>
      <p className="font-body text-[10px] uppercase tracking-wide text-comms-muted">
        {label}
      </p>
    </div>
  );
}

function MistakeBars({
  distribution,
  highlight,
}: {
  distribution: [number, number, number, number, number];
  highlight: number;
}) {
  const labels = ["0", "1", "2", "3", "X"];
  const max = Math.max(1, ...distribution);

  return (
    <div className="flex h-24 items-end gap-1.5">
      {distribution.map((count, i) => {
        const height = Math.max(8, Math.round((count / max) * 100));
        const active = i === highlight;
        return (
          <div key={labels[i]} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="flex w-full flex-1 items-end"
              title={`${count}`}
            >
              <div
                className={[
                  "w-full rounded-sm transition-colors",
                  active ? "bg-comms-accent" : "bg-comms-tile",
                ].join(" ")}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="font-body text-[10px] text-comms-muted">
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
