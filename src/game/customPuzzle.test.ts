import { describe, expect, it } from "vitest";
import {
  decodeCustomPuzzle,
  encodeCustomPuzzle,
  puzzleToDraft,
  validateCustomDraft,
} from "./customPuzzle";
import type { Puzzle } from "./types";

const puzzle: Puzzle = {
  id: 99,
  date: "2026-11-20",
  author: "Omen main",
  groups: [
    {
      category: "MAPS",
      difficulty: 1,
      words: ["Ascent", "Bind", "Lotus", "Pearl"],
    },
    {
      category: "CHAMPIONS",
      difficulty: 2,
      words: ["Acend", "LOUD", "Evil Geniuses", "EDward Gaming"],
    },
    {
      category: "CONTROLLERS",
      difficulty: 3,
      words: ["Brimstone", "Viper", "Astra", "Harbor"],
    },
    {
      category: "WORDPLAY",
      difficulty: 4,
      words: ["Omen", "Raze", "Sage", "Iso"],
    },
  ],
};

describe("custom puzzles", () => {
  it("round-trips encode/decode", () => {
    const encoded = encodeCustomPuzzle(puzzle);
    const decoded = decodeCustomPuzzle(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.author).toBe("Omen main");
    expect(decoded?.groups.map((g) => g.category)).toEqual([
      "MAPS",
      "CHAMPIONS",
      "CONTROLLERS",
      "WORDPLAY",
    ]);
    expect(decoded?.groups[0]?.words).toEqual(["Ascent", "Bind", "Lotus", "Pearl"]);
  });

  it("rejects duplicate words", () => {
    const draft = puzzleToDraft(puzzle);
    draft.groups[1].words[0] = "Ascent";
    expect(validateCustomDraft(draft).some((e) => e.includes("Duplicate"))).toBe(
      true,
    );
  });

  it("rejects invalid encodings", () => {
    expect(decodeCustomPuzzle("not-valid")).toBeNull();
    expect(decodeCustomPuzzle("")).toBeNull();
  });
});
