import { useEffect, useState } from "react";
import type { Difficulty } from "../game/types";
import { DIFFICULTY } from "../theme";

export interface DifficultyItem {
  key: string;
  label: string;
  difficulty: Difficulty;
}

const TIERS: Difficulty[] = [1, 2, 3, 4];

export function isCompleteDifficultySet(
  values: number[],
): values is Difficulty[] {
  return values.length === 4 && TIERS.every((tier) => values.includes(tier));
}

export function GroupDifficultyEditor({
  items,
  applyLabel = "Save difficulties",
  onApply,
}: {
  items: DifficultyItem[];
  applyLabel?: string;
  onApply: (difficulties: Difficulty[]) => void;
}) {
  const savedKey = items
    .map((item) => `${item.key}:${item.difficulty}`)
    .join("|");
  const [pending, setPending] = useState<Record<string, Difficulty>>(() =>
    Object.fromEntries(items.map((item) => [item.key, item.difficulty])),
  );

  useEffect(() => {
    setPending(
      Object.fromEntries(
        savedKey.split("|").map((part) => {
          const [key, value] = part.split(":");
          return [key, Number(value) as Difficulty];
        }),
      ),
    );
  }, [savedKey]);

  const values = items.map((item) => pending[item.key] ?? item.difficulty);
  const unique = isCompleteDifficultySet(values);
  const changed = items.some(
    (item) => (pending[item.key] ?? item.difficulty) !== item.difficulty,
  );

  return (
    <div className="rounded-sm border border-comms-text/10 bg-comms-bg/50 p-3">
      <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-comms-muted">
        Set difficulties
      </p>
      <p className="mt-1 font-body text-[11px] text-comms-muted">
        Assign Iron, Gold, Immortal, and Radiant, then save. Each color can be
        used once.
      </p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {items.map((item) => {
          const difficulty = pending[item.key] ?? item.difficulty;
          return (
            <li key={item.key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: DIFFICULTY[difficulty].color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate font-body text-[11px] uppercase tracking-wide text-comms-text">
                {item.label.trim() || "Untitled"}
              </span>
              <select
                aria-label={`Difficulty for ${item.label.trim() || "untitled group"}`}
                value={difficulty}
                onChange={(event) =>
                  setPending((current) => ({
                    ...current,
                    [item.key]: Number(event.target.value) as Difficulty,
                  }))
                }
                className="min-h-9 max-w-[7.75rem] rounded-sm border border-comms-text/15 bg-comms-tile px-1.5 font-body text-[10px] font-semibold uppercase tracking-wide text-comms-text"
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {DIFFICULTY[tier].name}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>
      {!unique ? (
        <p className="mt-2 font-body text-[11px] text-comms-accent">
          Use each color once before saving.
        </p>
      ) : null}
      <button
        type="button"
        disabled={!unique || !changed}
        onClick={() => onApply(values)}
        className="clip-angled mt-3 w-full bg-comms-accent px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-comms-tile disabled:text-comms-muted"
      >
        {applyLabel}
      </button>
    </div>
  );
}
