import { Link, NavLink } from "react-router-dom";
import { AuthControls } from "./AuthControls";

interface SiteHeaderProps {
  onHowToPlay: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap px-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] transition sm:min-h-8 sm:px-2 sm:text-xs sm:tracking-[0.16em]",
    isActive ? "text-comms-accent" : "text-comms-muted hover:text-comms-text",
  ].join(" ");

export function SiteHeader({ onHowToPlay }: SiteHeaderProps) {
  return (
    <nav className="mx-auto mb-5 w-full max-w-[390px] sm:max-w-[720px]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="font-display text-xl tracking-wide text-comms-text sm:text-2xl"
          >
            COMMS
          </Link>
          <div className="sm:hidden">
            <AuthControls />
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 border-y border-comms-text/10 py-1 sm:justify-end sm:gap-4 sm:border-0 sm:py-0">
          <NavLink to="/" end className={linkClass}>
            Today
          </NavLink>
          <NavLink to="/archive" className={linkClass}>
            Archive
          </NavLink>
          <NavLink to="/create" className={linkClass}>
            Create
          </NavLink>
          <NavLink to="/ranks" className={linkClass}>
            Ranks
          </NavLink>
          <button
            type="button"
            onClick={onHowToPlay}
            className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap px-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-comms-muted transition hover:text-comms-text sm:min-h-8 sm:px-2 sm:text-xs sm:tracking-[0.16em]"
          >
            Help
          </button>
          <div className="hidden sm:block">
            <AuthControls />
          </div>
        </div>
      </div>
    </nav>
  );
}
