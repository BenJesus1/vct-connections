import { describe, expect, it } from "vitest";
import type { Puzzle } from "../game/types";
import {
  emptyOfficialDraft,
  mergeOfficialPuzzles,
  nextOpenDate,
  nextPuzzleId,
  assignGroupDifficulties,
  validateOfficialDraft,
} from "./officialPuzzles";

const groups = [
  { category: "A", difficulty: 1 as const, words: ["a", "b", "c", "d"] as [string, string, string, string] },
  { category: "B", difficulty: 2 as const, words: ["e", "f", "g", "h"] as [string, string, string, string] },
  { category: "C", difficulty: 3 as const, words: ["i", "j", "k", "l"] as [string, string, string, string] },
  { category: "D", difficulty: 4 as const, words: ["m", "n", "o", "p"] as [string, string, string, string] },
] as Puzzle["groups"];

describe("official puzzle helpers", () => {
  it("merges remote dailies over bundled ids", () => {
    const bundled: Puzzle[] = [
      { id: 1, date: "2026-11-20", groups },
      { id: 2, date: "2026-11-21", groups },
    ];
    const remote: Puzzle[] = [{ id: 3, date: "2026-11-22", groups, author: "COMMS" }];
    expect(mergeOfficialPuzzles(bundled, remote).map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("picks the next unused calendar day", () => {
    expect(
      nextOpenDate(["2026-11-21", "2026-11-22"], new Date(2026, 10, 21)),
    ).toBe("2026-11-23");
  });

  it("assigns a full set of difficulties without pairwise swaps", () => {
    const assigned = assignGroupDifficulties(groups, [2, 4, 3, 1]);
    expect(assigned?.find((group) => group.category === "A")?.difficulty).toBe(2);
    expect(assigned?.find((group) => group.category === "B")?.difficulty).toBe(4);
    expect(assigned?.find((group) => group.category === "C")?.difficulty).toBe(3);
    expect(assigned?.find((group) => group.category === "D")?.difficulty).toBe(1);
    expect(assignGroupDifficulties(groups, [1, 1, 2, 3])).toBeNull();
  });

  it("increments puzzle ids and rejects taken dates", () => {
    expect(nextPuzzleId([{ id: 3 }, { id: 1 }])).toBe(4);
    const draft = emptyOfficialDraft();
    draft.date = "2026-11-22";
    expect(validateOfficialDraft(draft, ["2026-11-22"])).toContain(
      "A COMMS is already scheduled for 2026-11-22",
    );
  });
});
