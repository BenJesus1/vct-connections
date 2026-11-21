import type { Group, Puzzle } from "./types";

const MAX_MISTAKES = 4;
const MAX_SELECTION = 4;

export { MAX_MISTAKES, MAX_SELECTION };

/** Normalize a guess to a sorted key so order does not matter. */
export function guessKey(words: string[]): string {
  return [...words].map((w) => w.trim()).sort((a, b) => a.localeCompare(b)).join("\0");
}

export function allWords(puzzle: Puzzle): string[] {
  return puzzle.groups.flatMap((g) => g.words);
}

export function findGroupIndex(puzzle: Puzzle, words: string[]): number {
  const key = guessKey(words);
  return puzzle.groups.findIndex((group) => guessKey(group.words) === key);
}

export function isAlreadyGuessed(words: string[], guesses: string[][]): boolean {
  const key = guessKey(words);
  return guesses.some((guess) => guessKey(guess) === key);
}

/**
 * True when exactly 3 of the 4 selected tiles belong to the same group.
 * A fully correct group is not "one away".
 */
export function isOneAway(words: string[], groups: Group[]): boolean {
  if (words.length !== MAX_SELECTION) return false;

  for (const group of groups) {
    const overlap = words.filter((w) =>
      group.words.some((gw) => gw === w),
    ).length;
    if (overlap === 3) return true;
  }
  return false;
}

export function canSelectMore(selected: string[]): boolean {
  return selected.length < MAX_SELECTION;
}

export function canSubmit(selected: string[]): boolean {
  return selected.length === MAX_SELECTION;
}

export function remainingWords(puzzle: Puzzle, solvedGroupIndices: number[]): string[] {
  const solved = new Set(solvedGroupIndices);
  return puzzle.groups.flatMap((group, index) =>
    solved.has(index) ? [] : [...group.words],
  );
}
