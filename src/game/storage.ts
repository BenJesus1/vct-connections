import type { GameState, PuzzleProgress, SavedState } from "./types";

export const STORAGE_KEY = "comms:v1";

export function emptySavedState(): SavedState {
  return {
    byPuzzle: {},
    stats: {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      mistakeDistribution: [0, 0, 0, 0, 0],
    },
  };
}

function isPuzzleProgress(value: unknown): value is PuzzleProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as PuzzleProgress;
  return (
    Array.isArray(v.guesses) &&
    Array.isArray(v.solved) &&
    typeof v.mistakes === "number" &&
    (v.status === "playing" || v.status === "won" || v.status === "lost")
  );
}

function isSavedState(value: unknown): value is SavedState {
  if (!value || typeof value !== "object") return false;
  const v = value as SavedState;
  return Boolean(v.byPuzzle) && Boolean(v.stats) && Array.isArray(v.stats.mistakeDistribution);
}

export function loadSavedState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySavedState();
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedState(parsed)) return emptySavedState();
    return parsed;
  } catch {
    return emptySavedState();
  }
}

export function writeSavedState(state: SavedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — keep the in-memory result without crashing.
  }
}

export function progressFromGame(state: GameState): PuzzleProgress {
  return {
    guesses: state.guesses.map((g) => [...g]),
    solved: [...state.solved],
    mistakes: state.mistakes,
    status: state.status,
    board: [...state.board],
  };
}

/**
 * Persist mid-game / end-game progress. Updates lifetime stats the first time
 * a puzzle finishes (won or lost), unless `updateStats` is false (custom games).
 */
export function saveGameProgress(
  state: GameState,
  options?: { updateStats?: boolean },
): SavedState {
  const updateStats = options?.updateStats ?? true;
  const saved = loadSavedState();
  const prev = saved.byPuzzle[state.puzzle.id];
  const progress = progressFromGame(state);

  const finishing =
    updateStats &&
    (state.status === "won" || state.status === "lost") &&
    (!prev || prev.status === "playing");

  const next: SavedState = {
    ...saved,
    byPuzzle: {
      ...saved.byPuzzle,
      [state.puzzle.id]: progress,
    },
    stats: finishing ? applyFinishStats(saved.stats, state) : saved.stats,
  };

  writeSavedState(next);
  return next;
}

function applyFinishStats(
  stats: SavedState["stats"],
  state: GameState,
): SavedState["stats"] {
  const played = stats.played + 1;
  const won = state.status === "won" ? stats.won + 1 : stats.won;
  const currentStreak =
    state.status === "won" ? stats.currentStreak + 1 : 0;
  const maxStreak = Math.max(stats.maxStreak, currentStreak);

  const mistakeDistribution = [...stats.mistakeDistribution] as SavedState["stats"]["mistakeDistribution"];
  if (state.status === "won") {
    const bucket = Math.min(3, Math.max(0, state.mistakes));
    mistakeDistribution[bucket] = (mistakeDistribution[bucket] ?? 0) + 1;
  } else {
    mistakeDistribution[4] = (mistakeDistribution[4] ?? 0) + 1;
  }

  return { played, won, currentStreak, maxStreak, mistakeDistribution };
}

export function getPuzzleProgress(
  saved: SavedState,
  puzzleId: number,
): PuzzleProgress | undefined {
  const progress = saved.byPuzzle[puzzleId];
  return isPuzzleProgress(progress) ? progress : undefined;
}
