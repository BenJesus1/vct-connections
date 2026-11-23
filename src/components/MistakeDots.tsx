import { MAX_MISTAKES } from "../game/selectors";

interface MistakeDotsProps {
  mistakes: number;
}

export function MistakeDots({ mistakes }: MistakeDotsProps) {
  const remaining = Math.max(0, MAX_MISTAKES - mistakes);

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
      aria-label={`${remaining} mistake${remaining === 1 ? "" : "s"} remaining`}
    >
      <span className="font-body text-sm text-comms-muted">Mistakes remaining:</span>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: MAX_MISTAKES }, (_, i) => {
          const filled = i < remaining;
          return (
            <span
              key={i}
              className={[
                "inline-block h-3 w-3 rounded-full",
                filled ? "bg-comms-accent" : "bg-comms-tile ring-1 ring-comms-muted/40",
              ].join(" ")}
            />
          );
        })}
      </div>
    </div>
  );
}
