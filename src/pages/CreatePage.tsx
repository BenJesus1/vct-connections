import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { copyShareText } from "../game/share";
import {
  decodeCustomPuzzle,
  emptyCustomDraft,
  encodeCustomPuzzle,
  draftToPuzzle,
  MAX_AUTHOR_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_WORD_LENGTH,
  puzzleToDraft,
  validateCustomDraft,
  type CustomPuzzleDraft,
} from "../game/customPuzzle";
import { DIFFICULTY } from "../theme";

function draftFromSearch(encoded: string | null): CustomPuzzleDraft {
  if (!encoded) return emptyCustomDraft();
  const puzzle = decodeCustomPuzzle(encoded);
  return puzzle ? puzzleToDraft(puzzle) : emptyCustomDraft();
}

export function CreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [draft, setDraft] = useState<CustomPuzzleDraft>(() =>
    draftFromSearch(params.get("p")),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const encoded = useMemo(() => {
    if (validateCustomDraft(draft).length > 0) return null;
    return encodeCustomPuzzle(draftToPuzzle(draft));
  }, [draft]);

  function updateAuthor(author: string) {
    setDraft((prev) => ({ ...prev, author }));
    setErrors([]);
  }

  function updateCategory(groupIndex: number, category: string) {
    setDraft((prev) => {
      const groups = prev.groups.map((group, i) =>
        i === groupIndex ? { ...group, category } : group,
      ) as CustomPuzzleDraft["groups"];
      return { ...prev, groups };
    });
    setErrors([]);
  }

  function updateWord(groupIndex: number, wordIndex: number, word: string) {
    setDraft((prev) => {
      const groups = prev.groups.map((group, i) => {
        if (i !== groupIndex) return group;
        const words = [...group.words] as CustomPuzzleDraft["groups"][number]["words"];
        words[wordIndex] = word;
        return { ...group, words };
      }) as CustomPuzzleDraft["groups"];
      return { ...prev, groups };
    });
    setErrors([]);
  }

  function playableCode(): string | null {
    const nextErrors = validateCustomDraft(draft);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return null;
    }
    return encodeCustomPuzzle(draftToPuzzle(draft));
  }

  function handlePlay() {
    const code = playableCode();
    if (!code) return;
    navigate(`/play?p=${encodeURIComponent(code)}`);
  }

  async function handleCopy() {
    const code = playableCode();
    if (!code) return;
    const url = `${window.location.origin}/play?p=${encodeURIComponent(code)}`;
    const ok = await copyShareText(url);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="mx-auto max-w-[390px]">
      <header className="mb-6 text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
          Create
        </p>
        <h1 className="font-display text-4xl tracking-wide text-comms-text">
          Make a COMMS
        </h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Fill four groups, then play it or send a link. The puzzle lives in
          the URL — nothing is saved on a server.
        </p>
      </header>

      <label className="mb-5 block">
        <span className="mb-1.5 block font-body text-[11px] font-semibold uppercase tracking-wide text-comms-muted">
          Author (optional)
        </span>
        <input
          value={draft.author}
          maxLength={MAX_AUTHOR_LENGTH}
          onChange={(e) => updateAuthor(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-sm border border-comms-text/15 bg-comms-tile px-3 py-2 font-body text-sm text-comms-text outline-none placeholder:text-comms-muted/60 focus:border-comms-accent"
        />
      </label>

      <div className="flex flex-col gap-4">
        {draft.groups.map((group, groupIndex) => {
          const tier = DIFFICULTY[(groupIndex + 1) as 1 | 2 | 3 | 4];
          return (
            <section
              key={tier.name}
              className="rounded-sm bg-comms-tile p-3"
              style={{ boxShadow: `inset 4px 0 0 ${tier.color}` }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-comms-muted">
                  {tier.name}
                </p>
                <span
                  className="h-2 w-8 rounded-sm"
                  style={{ backgroundColor: tier.color }}
                  aria-hidden="true"
                />
              </div>
              <input
                value={group.category}
                maxLength={MAX_CATEGORY_LENGTH}
                onChange={(e) => updateCategory(groupIndex, e.target.value)}
                placeholder="Category"
                className="mb-2 w-full rounded-sm border border-comms-text/10 bg-comms-bg px-3 py-2 font-display text-sm uppercase tracking-wide text-comms-text outline-none placeholder:text-comms-muted/50 focus:border-comms-accent"
              />
              <div className="grid grid-cols-2 gap-2">
                {group.words.map((word, wordIndex) => (
                  <input
                    key={wordIndex}
                    value={word}
                    maxLength={MAX_WORD_LENGTH}
                    onChange={(e) =>
                      updateWord(groupIndex, wordIndex, e.target.value)
                    }
                    placeholder={`Word ${wordIndex + 1}`}
                    className="rounded-sm border border-comms-text/10 bg-comms-bg px-2 py-2 text-center font-body text-xs font-semibold uppercase tracking-wide text-comms-text outline-none placeholder:text-comms-muted/50 focus:border-comms-accent"
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {errors.length > 0 ? (
        <ul className="mt-4 space-y-1 rounded-sm bg-comms-accent/15 px-3 py-3 font-body text-xs text-comms-text">
          {errors.map((error) => (
            <li key={error}>• {error}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handlePlay}
          className="clip-angled bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110"
        >
          Play puzzle
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="clip-angled border border-comms-text/70 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-comms-text transition hover:bg-comms-tile"
        >
          {copied ? "Link copied!" : "Copy share link"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyCustomDraft());
            setErrors([]);
          }}
          className="font-body text-xs font-semibold uppercase tracking-wide text-comms-muted hover:text-comms-text"
        >
          Clear form
        </button>
      </div>

      {encoded ? (
        <p className="mt-4 text-center font-body text-[11px] text-comms-muted">
          Ready to share.{" "}
          <Link
            to={`/play?p=${encodeURIComponent(encoded)}`}
            className="font-semibold text-comms-accent"
          >
            Open play page
          </Link>
        </p>
      ) : null}
    </div>
  );
}
