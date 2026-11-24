import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth, useSession } from "@clerk/react";
import { AccountGate, RequireEditor } from "../components/AccountGate";
import { GameView } from "../components/GameView";
import { usePuzzleCatalog } from "../components/PuzzleCatalog";
import { isClerkConfigured } from "../auth/clerk";
import { canOpenEditorUi } from "../auth/editor";
import { formatDisplayDate, formatLocalDate, isYesterday } from "../game/daily";
import { hasFinishedPuzzle } from "../game/storage";
import { fetchMyDailyRanks } from "../lib/leaderboard";
import { createClerkSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import type { Puzzle } from "../game/types";

const ARCHIVE_LOCK =
  "Past VCT COMMS close after the day ends. Today's puzzle stays on the home tab.";

const YESTERDAY_DONE =
  "You already finished yesterday's VCT COMMS. Today's puzzle is on the home tab.";

export function PuzzlePage() {
  const { id } = useParams();
  const puzzleId = Number(id);
  const { puzzles, loading } = usePuzzleCatalog();
  const puzzle = Number.isFinite(puzzleId)
    ? puzzles.find((item) => item.id === puzzleId)
    : undefined;
  const todayKey = formatLocalDate();

  if (loading && !puzzle) {
    return (
      <p className="mx-auto max-w-[390px] text-center font-body text-sm text-comms-muted">
        Loading VCT COMMS…
      </p>
    );
  }

  if (!puzzle) {
    return (
      <div className="mx-auto max-w-[390px] text-center">
        <h1 className="font-display text-3xl text-comms-text">Not found</h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          That puzzle does not exist.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block font-body text-sm font-semibold text-comms-accent"
        >
          Back to today
        </Link>
      </div>
    );
  }

  if (puzzle.date > todayKey) {
    return (
      <div className="mx-auto max-w-[390px] text-center">
        <h1 className="font-display text-3xl text-comms-text">Not live yet</h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          This puzzle unlocks on {formatDisplayDate(puzzle.date)}.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block font-body text-sm font-semibold text-comms-accent"
        >
          Back to today
        </Link>
      </div>
    );
  }

  const game = (
    <GameView
      key={puzzle.id}
      puzzle={puzzle}
      badge={puzzle.date === todayKey ? "Daily" : "Archive"}
    />
  );

  if (puzzle.date === todayKey) return game;
  if (isYesterday(puzzle.date)) {
    if (!isClerkConfigured()) return game;
    return <YesterdayPuzzle puzzle={puzzle}>{game}</YesterdayPuzzle>;
  }

  return (
    <RequireEditor
      title="Archive"
      body={ARCHIVE_LOCK}
      action={
        <Link
          to="/"
          className="clip-angled mt-6 inline-block bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white"
        >
          Play today
        </Link>
      }
    >
      {game}
    </RequireEditor>
  );
}

function YesterdayPuzzle({
  puzzle,
  children,
}: {
  puzzle: Puzzle;
  children: ReactNode;
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const isEditor = canOpenEditorUi(userId);
  const localDone = hasFinishedPuzzle(puzzle.id);
  const [cloudDone, setCloudDone] = useState(false);
  const [checking, setChecking] = useState(true);

  const client = useMemo(() => {
    if (!isSupabaseConfigured() || !session) return null;
    return createClerkSupabaseClient(() => session.getToken());
  }, [session]);

  useEffect(() => {
    if (isEditor || localDone || !isSignedIn || !client) {
      setChecking(false);
      return;
    }

    let active = true;
    setChecking(true);
    void fetchMyDailyRanks(client).then((result) => {
      if (!active) return;
      setCloudDone(result.rows.some((row) => row.puzzle_id === puzzle.id));
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [client, isEditor, isSignedIn, localDone, puzzle.id]);

  if (!isLoaded || checking) {
    return (
      <p className="mx-auto max-w-[390px] text-center font-body text-sm text-comms-muted">
        Loading VCT COMMS…
      </p>
    );
  }

  if (!isEditor && !localDone && cloudDone) {
    return (
      <AccountGate
        title="Already played"
        body={YESTERDAY_DONE}
        action={
          <Link
            to="/"
            className="clip-angled mt-6 inline-block bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white"
          >
            Play today
          </Link>
        }
      />
    );
  }

  return children;
}
