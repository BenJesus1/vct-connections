import type { Difficulty } from "./game/types";

export const COLORS = {
  bg: "#0F1923",
  tile: "#1F2731",
  text: "#ECE8E1",
  accent: "#FF4655",
  white: "#FFFFFF",
  muted: "#8B939B",
} as const;

export const DIFFICULTY: Record<
  Difficulty,
  { name: string; color: string; emoji: string }
> = {
  1: { name: "Iron", color: "#F5D76E", emoji: "🟨" },
  2: { name: "Gold", color: "#6FCF97", emoji: "🟩" },
  3: { name: "Immortal", color: "#56CCF2", emoji: "🟦" },
  4: { name: "Radiant", color: "#BB6BD9", emoji: "🟪" },
};
