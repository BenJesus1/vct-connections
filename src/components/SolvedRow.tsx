import type { Group } from "../game/types";
import { DIFFICULTY } from "../theme";

interface SolvedRowProps {
  group: Group;
}

export function SolvedRow({ group }: SolvedRowProps) {
  const tier = DIFFICULTY[group.difficulty];

  return (
    <div
      className="tile-solved flex min-h-[72px] w-full flex-col items-center justify-center rounded-sm px-2 py-2 text-center sm:min-h-[68px] sm:px-3"
      style={{ backgroundColor: tier.color, color: "#0F1923" }}
      role="status"
    >
      <p className="max-w-full break-words font-display text-sm tracking-wide uppercase sm:text-base">
        {group.category}
      </p>
      <p className="mt-0.5 max-w-full break-words font-body text-[11px] font-medium uppercase tracking-wide sm:text-xs">
        {group.words.join(", ")}
      </p>
    </div>
  );
}
