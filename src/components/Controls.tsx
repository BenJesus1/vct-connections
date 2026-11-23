interface ControlsProps {
  canSubmit: boolean;
  canDeselect: boolean;
  disabled?: boolean;
  onShuffle: () => void;
  onDeselectAll: () => void;
  onSubmit: () => void;
}

export function Controls({
  canSubmit,
  canDeselect,
  disabled = false,
  onShuffle,
  onDeselectAll,
  onSubmit,
}: ControlsProps) {
  const secondary =
    "clip-angled min-h-11 border border-comms-text/70 bg-transparent px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-comms-text transition enabled:hover:bg-comms-tile disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-4 sm:text-sm";

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5">
      <button
        type="button"
        className={secondary}
        disabled={disabled}
        onClick={onShuffle}
      >
        Shuffle
      </button>
      <button
        type="button"
        className={secondary}
        disabled={disabled || !canDeselect}
        onClick={onDeselectAll}
      >
        Deselect All
      </button>
      <button
        type="button"
        className="clip-angled col-span-2 min-h-11 bg-comms-accent px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wide text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-comms-tile disabled:text-comms-muted sm:col-span-1 sm:min-h-0"
        disabled={disabled || !canSubmit}
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
}
