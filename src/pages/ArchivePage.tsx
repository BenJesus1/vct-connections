import { Link } from "react-router-dom";
import { getPlayableArchive } from "../data/puzzles";
import { formatLocalDate } from "../game/daily";
import { loadSavedState } from "../game/storage";

export function ArchivePage() {
  const archive = getPlayableArchive();
  const todayKey = formatLocalDate();
  const saved = loadSavedState();

  return (
    <div className="mx-auto max-w-[390px]">
      <header className="mb-6 text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
          Archive
        </p>
        <h1 className="font-display text-4xl tracking-wide text-comms-text">
          Past COMMS
        </h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Replay any puzzle that has already gone live.
        </p>
      </header>

      {archive.length === 0 ? (
        <p className="text-center font-body text-sm text-comms-muted">
          No puzzles available yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {archive.map((puzzle) => {
            const progress = saved.byPuzzle[puzzle.id];
            const status = progress?.status;
            const isToday = puzzle.date === todayKey;
            const statusLabel =
              status === "won"
                ? "Won"
                : status === "lost"
                  ? "Lost"
                  : status === "playing" && (progress?.guesses.length ?? 0) > 0
                    ? "In progress"
                    : "Not started";

            return (
              <li key={puzzle.id}>
                <Link
                  to={`/puzzle/${puzzle.id}`}
                  className="flex items-center justify-between gap-3 rounded-sm bg-comms-tile px-4 py-3 transition hover:brightness-110"
                >
                  <div>
                    <p className="font-display text-lg tracking-wide text-comms-text">
                      #{puzzle.id}
                      {isToday ? (
                        <span className="ml-2 font-body text-xs font-semibold uppercase tracking-wide text-comms-accent">
                          Today
                        </span>
                      ) : null}
                    </p>
                    <p className="font-body text-xs text-comms-muted">
                      {puzzle.date}
                    </p>
                  </div>
                  <span className="font-body text-xs font-semibold uppercase tracking-wide text-comms-muted">
                    {statusLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
