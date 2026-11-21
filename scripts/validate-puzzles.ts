import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_WORD_LENGTH = 16;

interface Group {
  category: string;
  difficulty: number;
  words: string[];
}

interface Puzzle {
  id: number;
  date: string;
  groups: Group[];
}

function fail(messages: string[]): never {
  console.error("Puzzle validation failed:\n");
  for (const message of messages) {
    console.error(`  • ${message}`);
  }
  process.exit(1);
}

function validate(puzzles: Puzzle[]): string[] {
  const errors: string[] = [];
  const seenIds = new Map<number, number>();
  const seenDates = new Map<string, number>();

  if (!Array.isArray(puzzles) || puzzles.length === 0) {
    errors.push("puzzles.json must be a non-empty array");
    return errors;
  }

  puzzles.forEach((puzzle, puzzleIndex) => {
    const label = `Puzzle index ${puzzleIndex} (id=${String(puzzle?.id)})`;

    if (typeof puzzle.id !== "number" || !Number.isInteger(puzzle.id)) {
      errors.push(`${label}: id must be an integer`);
    } else if (seenIds.has(puzzle.id)) {
      errors.push(
        `${label}: duplicate id ${puzzle.id} (also used at index ${seenIds.get(puzzle.id)})`,
      );
    } else {
      seenIds.set(puzzle.id, puzzleIndex);
    }

    if (typeof puzzle.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(puzzle.date)) {
      errors.push(`${label}: date must be YYYY-MM-DD`);
    } else if (seenDates.has(puzzle.date)) {
      errors.push(
        `${label}: duplicate date ${puzzle.date} (also used at index ${seenDates.get(puzzle.date)})`,
      );
    } else {
      seenDates.set(puzzle.date, puzzleIndex);
    }

    if (!Array.isArray(puzzle.groups) || puzzle.groups.length !== 4) {
      errors.push(`${label}: must have exactly 4 groups`);
      return;
    }

    const difficulties = puzzle.groups.map((g) => g.difficulty);
    const diffSet = new Set(difficulties);
    if (
      difficulties.length !== 4 ||
      diffSet.size !== 4 ||
      ![1, 2, 3, 4].every((d) => diffSet.has(d))
    ) {
      errors.push(`${label}: difficulties must be 1–4 used exactly once each`);
    }

    const normalizedWords: string[] = [];

    puzzle.groups.forEach((group, groupIndex) => {
      if (!Array.isArray(group.words) || group.words.length !== 4) {
        errors.push(`${label}: group ${groupIndex} must have exactly 4 words`);
        return;
      }

      for (const word of group.words) {
        if (typeof word !== "string") {
          errors.push(`${label}: group ${groupIndex} has a non-string word`);
          continue;
        }
        const trimmed = word.trim();
        if (trimmed.length === 0) {
          errors.push(`${label}: group ${groupIndex} has an empty word`);
        }
        if (trimmed.length > MAX_WORD_LENGTH) {
          errors.push(
            `${label}: "${trimmed}" is longer than ${MAX_WORD_LENGTH} characters`,
          );
        }
        normalizedWords.push(trimmed.toLowerCase());
      }
    });

    const unique = new Set(normalizedWords);
    if (unique.size !== normalizedWords.length) {
      const counts = new Map<string, number>();
      for (const w of normalizedWords) {
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
      const dupes = [...counts.entries()]
        .filter(([, n]) => n > 1)
        .map(([w]) => w);
      errors.push(`${label}: duplicate words (case-insensitive): ${dupes.join(", ")}`);
    }
  });

  return errors;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const puzzlesPath = join(here, "..", "src", "data", "puzzles.json");
  const raw = readFileSync(puzzlesPath, "utf8");
  let puzzles: Puzzle[];
  try {
    puzzles = JSON.parse(raw) as Puzzle[];
  } catch {
    fail(["puzzles.json is not valid JSON"]);
  }

  const errors = validate(puzzles);
  if (errors.length > 0) fail(errors);

  console.log(`Validated ${puzzles.length} puzzle(s) — OK`);
}

main();
