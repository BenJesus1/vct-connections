import {
  canSelectMore,
  findGroupIndex,
  isAlreadyGuessed,
  isOneAway,
  MAX_MISTAKES,
  remainingWords,
} from "./selectors";
import type { GameAction, GameState, Puzzle, PuzzleProgress } from "./types";

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

export function createInitialState(
  puzzle: Puzzle,
  options?: { board?: string[]; shuffle?: boolean },
): GameState {
  const board =
    options?.board ??
    (options?.shuffle === false
      ? remainingWords(puzzle, [])
      : shuffleInPlace(remainingWords(puzzle, [])));

  return {
    puzzle,
    board,
    selected: [],
    solved: [],
    guesses: [],
    mistakes: 0,
    status: "playing",
    feedback: null,
  };
}

export function restoreState(
  puzzle: Puzzle,
  progress: PuzzleProgress,
  board?: string[],
): GameState {
  const nextBoard =
    board ??
    shuffleInPlace(remainingWords(puzzle, progress.solved));

  return {
    puzzle,
    board: nextBoard,
    selected: [],
    solved: [...progress.solved],
    guesses: progress.guesses.map((g) => [...g]),
    mistakes: progress.mistakes,
    status: progress.status,
    feedback: null,
  };
}

function applyCorrectGuess(state: GameState, groupIndex: number): GameState {
  const solved = [...state.solved, groupIndex];
  const groupWords = new Set(state.puzzle.groups[groupIndex]!.words);
  const board = state.board.filter((word) => !groupWords.has(word));
  const status = solved.length === 4 ? "won" : "playing";

  return {
    ...state,
    board,
    selected: [],
    solved,
    status,
    feedback: "correct",
  };
}

function applyIncorrectGuess(state: GameState, oneAway: boolean): GameState {
  const mistakes = state.mistakes + 1;
  const status = mistakes >= MAX_MISTAKES ? "lost" : "playing";

  return {
    ...state,
    mistakes,
    status,
    feedback: oneAway ? "one_away" : "incorrect",
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT": {
      if (state.status !== "playing") return state;
      if (state.selected.includes(action.word)) return state;
      if (!state.board.includes(action.word)) return state;
      if (!canSelectMore(state.selected)) return state;

      return {
        ...state,
        selected: [...state.selected, action.word],
        feedback: null,
      };
    }

    case "DESELECT": {
      if (state.status !== "playing") return state;
      if (!state.selected.includes(action.word)) return state;

      return {
        ...state,
        selected: state.selected.filter((w) => w !== action.word),
        feedback: null,
      };
    }

    case "DESELECT_ALL": {
      if (state.status !== "playing") return state;
      if (state.selected.length === 0) return state;

      return {
        ...state,
        selected: [],
        feedback: null,
      };
    }

    case "SHUFFLE": {
      if (state.status !== "playing") return state;

      return {
        ...state,
        board: shuffleInPlace([...state.board]),
        feedback: null,
      };
    }

    case "SUBMIT": {
      if (state.status !== "playing") return state;
      if (state.selected.length !== 4) return state;

      const guess = [...state.selected];

      if (isAlreadyGuessed(guess, state.guesses)) {
        return {
          ...state,
          feedback: "already_guessed",
        };
      }

      const guesses = [...state.guesses, guess];
      const groupIndex = findGroupIndex(state.puzzle, guess);

      if (groupIndex !== -1) {
        return applyCorrectGuess({ ...state, guesses }, groupIndex);
      }

      const oneAway = isOneAway(guess, state.puzzle.groups);
      return applyIncorrectGuess({ ...state, guesses }, oneAway);
    }

    case "RESTORE": {
      return restoreState(state.puzzle, action.progress, action.board);
    }

    case "CLEAR_FEEDBACK": {
      if (state.feedback === null) return state;
      return { ...state, feedback: null };
    }

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
