import { describe, expect, it } from "vitest";
import {
  displayNameFromUser,
  isOfficialDaily,
  playerStanding,
  rankByAverage,
  rankByStreak,
  type LeaderboardRow,
} from "./leaderboard";
import type { Puzzle } from "../game/types";

const official: Puzzle = {
  id: 1,
  date: "2026-11-21",
  groups: [
    { category: "A", difficulty: 1, words: ["a", "b", "c", "d"] },
    { category: "B", difficulty: 2, words: ["e", "f", "g", "h"] },
    { category: "C", difficulty: 3, words: ["i", "j", "k", "l"] },
    { category: "D", difficulty: 4, words: ["m", "n", "o", "p"] },
  ],
};

describe("leaderboard helpers", () => {
  it("only treats dated official puzzles as dailies", () => {
    expect(isOfficialDaily(official)).toBe(true);
    expect(isOfficialDaily({ ...official, id: -12 })).toBe(false);
    expect(isOfficialDaily({ ...official, date: "1970-01-01" })).toBe(false);
  });

  it("ranks longest streaks then lowest averages", () => {
    const rows: LeaderboardRow[] = [
      {
        user_id: "a",
        display_name: "Alpha",
        current_streak: 2,
        max_streak: 4,
        daily_avg: 1.5,
        dailies_played: 4,
      },
      {
        user_id: "b",
        display_name: "Bravo",
        current_streak: 5,
        max_streak: 5,
        daily_avg: 0.25,
        dailies_played: 5,
      },
    ];
    expect(rankByStreak(rows)[0]?.user_id).toBe("b");
    expect(rankByAverage(rows)[0]?.user_id).toBe("b");

    const standing = playerStanding(rows, "a");
    expect(standing.streakRank).toBe(2);
    expect(standing.averageRank).toBe(2);
    expect(standing.row?.dailies_played).toBe(4);
    expect(playerStanding(rows, "missing").row).toBeNull();
  });

  it("builds a short display name", () => {
    expect(displayNameFromUser({ firstName: "Viper", lastName: "Main" })).toBe(
      "Viper Main",
    );
    expect(displayNameFromUser({ username: "omen" })).toBe("omen");
  });
});
