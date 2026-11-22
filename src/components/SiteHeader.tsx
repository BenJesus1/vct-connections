import { Link, NavLink } from "react-router-dom";

interface SiteHeaderProps {
  onHowToPlay: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "font-body text-xs font-semibold uppercase tracking-wide transition",
    isActive ? "text-comms-accent" : "text-comms-muted hover:text-comms-text",
  ].join(" ");

export function SiteHeader({ onHowToPlay }: SiteHeaderProps) {
  return (
    <nav className="mx-auto mb-4 flex max-w-[390px] flex-wrap items-center justify-between gap-3">
      <Link
        to="/"
        className="font-display text-lg tracking-wide text-comms-text"
      >
        COMMS
      </Link>
      <div className="flex items-center gap-4">
        <NavLink to="/" end className={linkClass}>
          Today
        </NavLink>
        <NavLink to="/archive" className={linkClass}>
          Archive
        </NavLink>
        <NavLink to="/create" className={linkClass}>
          Create
        </NavLink>
        <button
          type="button"
          onClick={onHowToPlay}
          className="font-body text-xs font-semibold uppercase tracking-wide text-comms-muted hover:text-comms-text"
        >
          Help
        </button>
      </div>
    </nav>
  );
}
