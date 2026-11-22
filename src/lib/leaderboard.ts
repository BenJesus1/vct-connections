import type { SupabaseClient } from "@supabase/supabase-js";
import type { Puzzle, PuzzleProgress } from "../game/types";

export const DISPLAY_NAME_MAX = 24;

export interface LeaderboardRow {
  user_id: string;
  display_name: string;
  current_streak: number;
  max_streak: number;
  daily_avg: number;
  dailies_played: number;
}

export function isOfficialDaily(puzzle: Puzzle): boolean {
  return (
    puzzle.id > 0 &&
    puzzle.date !== "1970-01-01" &&
    /^\d{4}-\d{2}-\d{2}$/.test(puzzle.date)
  );
}

export function displayNameFromUser(input: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}): string {
  const full = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  const raw = full || input.username?.trim() || "Agent";
  return raw.slice(0, DISPLAY_NAME_MAX);
}

export async function upsertProfile(
  client: SupabaseClient,
  userId: string,
  displayName: string,
): Promise<string | null> {
  const name = displayName.trim().slice(0, DISPLAY_NAME_MAX) || "Agent";
  const { error } = await client.from("profiles").upsert(
    {
      user_id: userId,
      display_name: name,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  return error?.message ?? null;
}

export async function submitDailyResult(
  client: SupabaseClient,
  puzzle: Puzzle,
  progress: Pick<PuzzleProgress, "mistakes" | "status">,
): Promise<string | null> {
  if (!isOfficialDaily(puzzle)) return null;
  if (progress.status !== "won" && progress.status !== "lost") return null;

  const { error } = await client.from("daily_results").insert({
    puzzle_id: puzzle.id,
    puzzle_date: puzzle.date,
    mistakes: Math.min(4, Math.max(0, progress.mistakes)),
    won: progress.status === "won",
  });

  if (error && error.code === "23505") return null;
  return error?.message ?? null;
}

export async function fetchLeaderboard(
  client: SupabaseClient,
): Promise<{ rows: LeaderboardRow[]; error: string | null }> {
  const { data, error } = await client.rpc("get_leaderboard");
  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as LeaderboardRow[], error: null };
}

export function rankByStreak(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort(
    (a, b) =>
      b.max_streak - a.max_streak ||
      b.current_streak - a.current_streak ||
      a.display_name.localeCompare(b.display_name),
  );
}

export function rankByAverage(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort(
    (a, b) =>
      a.daily_avg - b.daily_avg ||
      b.dailies_played - a.dailies_played ||
      a.display_name.localeCompare(b.display_name),
  );
}

export interface PlayerStanding {
  row: LeaderboardRow | null;
  streakRank: number | null;
  averageRank: number | null;
  players: number;
}

export function playerStanding(
  rows: LeaderboardRow[],
  userId: string | null | undefined,
): PlayerStanding {
  const players = rows.length;
  if (!userId) {
    return { row: null, streakRank: null, averageRank: null, players };
  }

  const streak = rankByStreak(rows);
  const average = rankByAverage(rows);
  const streakIndex = streak.findIndex((row) => row.user_id === userId);
  const averageIndex = average.findIndex((row) => row.user_id === userId);

  return {
    row: streakIndex >= 0 ? streak[streakIndex]! : null,
    streakRank: streakIndex >= 0 ? streakIndex + 1 : null,
    averageRank: averageIndex >= 0 ? averageIndex + 1 : null,
    players,
  };
}
