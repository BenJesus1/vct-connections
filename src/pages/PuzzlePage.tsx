import { Link, useParams } from "react-router-dom";
import { GameView } from "../components/GameView";
import { getPuzzleById } from "../data/puzzles";
import { formatLocalDate } from "../game/daily";

export function PuzzlePage() {
  const { id } = useParams();
  const puzzleId = Number(id);
  const puzzle = Number.isFinite(puzzleId) ? getPuzzleById(puzzleId) : undefined;
  const todayKey = formatLocalDate();

  if (!puzzle) {
    return (
      <div className="mx-auto max-w-[390px] text-center">
        <h1 className="font-display text-3xl text-comms-text">Not found</h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          That puzzle does not exist.
        </p>
        <Link
          to="/archive"
          className="mt-4 inline-block font-body text-sm font-semibold text-comms-accent"
        >
          Back to archive
        </Link>
      </div>
    );
  }

  if (puzzle.date > todayKey) {
    return (
      <div className="mx-auto max-w-[390px] text-center">
        <h1 className="font-display text-3xl text-comms-text">Not live yet</h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Puzzle #{puzzle.id} unlocks on {puzzle.date}.
        </p>
        <Link
          to="/archive"
          className="mt-4 inline-block font-body text-sm font-semibold text-comms-accent"
        >
          Back to archive
        </Link>
      </div>
    );
  }

  return (
    <GameView
      key={puzzle.id}
      puzzle={puzzle}
      badge={puzzle.date === todayKey ? "Daily" : "Archive"}
    />
  );
}
