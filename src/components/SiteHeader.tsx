import { Link, NavLink } from "react-router-dom";
import { AuthControls } from "./AuthControls";
import { EditorNavLink } from "./EditorNavLink";

interface SiteHeaderProps {
  onHowToPlay: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap px-2 font-body text-xs font-semibold uppercase tracking-wide transition sm:min-h-8 sm:flex-none sm:tracking-[0.16em]",
    isActive ? "text-comms-accent" : "text-comms-muted hover:text-comms-text",
  ].join(" ");

const actionClass =
  "inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap px-2 font-body text-xs font-semibold uppercase tracking-wide text-comms-muted transition hover:text-comms-text sm:min-h-8 sm:flex-none sm:tracking-[0.16em]";

export function SiteHeader({ onHowToPlay }: SiteHeaderProps) {
  return (
    <nav className="relative z-10 mx-auto mb-4 w-full max-w-[390px] bg-comms-bg sm:mb-5 sm:max-w-none">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="whitespace-nowrap font-display text-xl tracking-wide text-comms-text sm:text-2xl"
        >
          VCT COMMS
        </Link>
        <AuthControls />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 sm:mt-3 sm:justify-center sm:gap-4">
        <NavLink to="/" end className={linkClass}>
          Today
        </NavLink>
        <button type="button" onClick={onHowToPlay} className={actionClass}>
          Help
        </button>
        <NavLink to="/ranks" className={linkClass}>
          Ranks
        </NavLink>
        <NavLink to="/archive" className={linkClass}>
          Archive
        </NavLink>
        <EditorNavLink to="/desk">Desk</EditorNavLink>
        <EditorNavLink to="/create">Create</EditorNavLink>
      </div>
    </nav>
  );
}
