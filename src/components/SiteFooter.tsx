import { CREATOR_X_HANDLE, CREATOR_X_URL } from "../theme";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 max-w-[390px] border-t border-comms-text/10 px-1 pt-5 pb-2 text-center">
      <a
        href={CREATOR_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-2 font-body text-xs font-semibold uppercase tracking-wide text-comms-accent hover:underline"
      >
        <span>Contact creator</span>
        <span className="normal-case tracking-normal text-comms-text">
          @{CREATOR_X_HANDLE}
        </span>
      </a>
      <p className="mt-3">
        <a
          href="/privacy"
          className="font-body text-[11px] font-semibold uppercase tracking-wide text-comms-muted hover:text-comms-text hover:underline"
        >
          Privacy
        </a>
      </p>
      <p className="mt-1 font-body text-[11px] leading-relaxed text-comms-muted">
        VCT COMMS is an unofficial fan project and is not endorsed by Riot Games.
        Valorant and related marks are trademarks of Riot Games, Inc. This
        project follows Riot’s fan-content guidelines and is non-commercial.
      </p>
    </footer>
  );
}
