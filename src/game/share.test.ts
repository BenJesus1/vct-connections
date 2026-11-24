import { describe, expect, it } from "vitest";
import { SITE_URL } from "../theme";
import { buildShareText } from "./share";
import type { Puzzle } from "./types";

const puzzle: Puzzle = {
  id: 12,
  date: "2026-11-20",
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

describe("buildShareText", () => {
  it("matches the COMMS share format", () => {
    const text = buildShareText(puzzle, [
      ["Ascent", "Bind", "Lotus", "Pearl"],
      ["Brimstone", "Omen", "Viper", "Astra"],
      ["Brimstone", "Viper", "Astra", "Harbor"],
      ["Acend", "LOUD", "Evil Geniuses", "EDward Gaming"],
      ["Omen", "Raze", "Sage", "Iso"],
    ]);

    expect(text).toBe(
      [
        "VCT COMMS November 20, 2026",
        "🟨🟨🟨🟨",
        "🟦🟪🟦🟦",
        "🟦🟦🟦🟦",
        "🟩🟩🟩🟩",
        "🟪🟪🟪🟪",
        "",
        SITE_URL,
      ].join("\n"),
    );
  });

  it("can pin a specific site URL in the share text", () => {
    const text = buildShareText(
      puzzle,
      [["Ascent", "Bind", "Lotus", "Pearl"]],
      { siteUrl: "https://example.com" },
    );
    expect(text.endsWith("\n\nhttps://example.com")).toBe(true);
  });
});
