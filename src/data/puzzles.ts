import puzzlesData from "./puzzles.json";
import { formatLocalDate } from "../game/daily";
import type { Puzzle } from "../game/types";

export const puzzles = puzzlesData as Puzzle[];

export function getPuzzleById(id: number): Puzzle | undefined {
  return puzzles.find((p) => p.id === id);
}

/** Past + today's puzzles, newest first. Future dailies stay locked. */
export function getPlayableArchive(today: Date = new Date()): Puzzle[] {
  const todayKey = formatLocalDate(today);
  return puzzles
    .filter((p) => p.date <= todayKey)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}
