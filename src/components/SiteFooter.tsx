import { useState } from "react";
import { copyShareText } from "../game/share";
import { CREATOR_DISCORD } from "../theme";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyShareText(CREATOR_DISCORD);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <footer className="mx-auto mt-12 max-w-[390px] border-t border-comms-text/10 px-1 pt-5 pb-2 text-center">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-2 font-body text-xs font-semibold uppercase tracking-wide text-comms-accent hover:underline"
      >
        <span>{copied ? "Copied Discord" : "Contact creator"}</span>
        <span className="normal-case tracking-normal text-comms-text">
          {CREATOR_DISCORD}
        </span>
      </button>
      <p className="mt-1 font-body text-[11px] leading-relaxed text-comms-muted">
        VCT COMMS is an unofficial fan project and is not endorsed by Riot Games.
        Valorant and related marks are trademarks of Riot Games, Inc. This
        project follows Riot’s fan-content guidelines and is non-commercial.
      </p>
    </footer>
  );
}
