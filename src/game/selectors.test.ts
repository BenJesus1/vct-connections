import { describe, expect, it } from "vitest";
import {
  canSubmit,
  findGroupIndex,
  guessKey,
  isAlreadyGuessed,
  isOneAway,
} from "./selectors";
import type { Group, Puzzle } from "./types";

const groups: [Group, Group, Group, Group] = [
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
];

const puzzle: Puzzle = { id: 1, date: "2026-11-20", groups };

describe("selectors", () => {
  it("builds an order-independent guess key", () => {
    expect(guessKey(["B", "A", "C", "D"])).toBe(guessKey(["D", "C", "B", "A"]));
  });

  it("finds a matching group index", () => {
    expect(findGroupIndex(puzzle, ["Pearl", "Lotus", "Bind", "Ascent"])).toBe(0);
    expect(findGroupIndex(puzzle, ["Ascent", "Bind", "Lotus", "Omen"])).toBe(-1);
  });

  it("detects already-guessed sets", () => {
    const guesses = [["Ascent", "Bind", "Lotus", "Omen"]];
    expect(isAlreadyGuessed(["Omen", "Lotus", "Bind", "Ascent"], guesses)).toBe(true);
    expect(isAlreadyGuessed(["Ascent", "Bind", "Lotus", "Pearl"], guesses)).toBe(false);
  });

  it("detects one-away guesses", () => {
    expect(isOneAway(["Ascent", "Bind", "Lotus", "Omen"], groups)).toBe(true);
    expect(isOneAway(["Ascent", "Bind", "Lotus", "Pearl"], groups)).toBe(false);
    expect(isOneAway(["Ascent", "Bind", "Omen", "Raze"], groups)).toBe(false);
  });

  it("requires exactly four selected tiles to submit", () => {
    expect(canSubmit(["A", "B", "C"])).toBe(false);
    expect(canSubmit(["A", "B", "C", "D"])).toBe(true);
  });
});
