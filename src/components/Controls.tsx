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
    "clip-angled border border-comms-text/70 bg-transparent px-4 py-2.5 font-body text-sm font-semibold uppercase tracking-wide text-comms-text transition enabled:hover:bg-comms-tile disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
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
        className="clip-angled bg-comms-accent px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wide text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:bg-comms-tile disabled:text-comms-muted"
        disabled={disabled || !canSubmit}
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
}
