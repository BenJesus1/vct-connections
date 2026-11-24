import { DIFFICULTY, SITE_URL } from "../theme";
import { formatDisplayDate } from "./daily";
import type { Difficulty, Puzzle } from "./types";

/** Public URL to include in share text so new players can find the game. */
export function publicSiteUrl(): string {
  return SITE_URL;
}

function wordDifficulty(puzzle: Puzzle, word: string): Difficulty {
  for (const group of puzzle.groups) {
    if (group.words.includes(word)) return group.difficulty;
  }
  throw new Error(`Word not found in puzzle: ${word}`);
}

/**
 * Build the shareable emoji grid.
 * One row per guess; each tile colored by its true group difficulty.
 */
export function buildShareText(
  puzzle: Puzzle,
  guesses: string[][],
  options?: { title?: string; siteUrl?: string },
): string {
  const title = options?.title ?? `VCT COMMS ${formatDisplayDate(puzzle.date)}`;
  const siteUrl = options?.siteUrl ?? publicSiteUrl();
  const rows = guesses.map((guess) =>
    guess.map((word) => DIFFICULTY[wordDifficulty(puzzle, word)].emoji).join(""),
  );
  return [title, ...rows, "", siteUrl].join("\n");
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
