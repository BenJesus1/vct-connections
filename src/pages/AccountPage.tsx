import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SignOutButton, useAuth, useSession, useUser } from "@clerk/react";
import { RequireAccount } from "../components/AccountGate";
import { loadSavedState } from "../game/storage";
import {
  displayNameFromUser,
  fetchLeaderboard,
  playerStanding,
} from "../lib/leaderboard";
import { createClerkSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

export function AccountPage() {
  return (
    <RequireAccount
      title="Account"
      signedOutBody="Sign in with Google to see your ranks, stats, and sign out."
    >
      <SignedInAccount />
    </RequireAccount>
  );
}

function SignedInAccount() {
  const { isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [standing, setStanding] = useState(() => playerStanding([], userId));
  const [localStats] = useState(() => loadSavedState().stats);
  const winRate =
    localStats.played === 0
      ? 0
      : Math.round((localStats.won / localStats.played) * 100);

  const name = displayNameFromUser({
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
  });

  const client = useMemo(() => {
    if (!isSupabaseConfigured() || !session) return null;
    return createClerkSupabaseClient(() => session.getToken());
  }, [session]);

  useEffect(() => {
    if (!isSignedIn || !client) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    void fetchLeaderboard(client).then((result) => {
      if (!active) return;
      setStanding(playerStanding(result.rows, userId));
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [client, isSignedIn, userId]);

  return (
    <div className="mx-auto max-w-[390px]">
      <header className="mb-6 text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
          Account
        </p>
        <h1 className="font-display text-4xl tracking-wide text-comms-text">
          {name}
        </h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Your official ranks plus career stats saved in this browser.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="font-display text-2xl tracking-wide text-comms-text">
          Your ranks
        </h2>
        <p className="mb-3 font-body text-xs text-comms-muted">
          Official dailies only
          {standing.players > 0 ? ` · ${standing.players} ranked` : ""}
        </p>
        {!isSupabaseConfigured() ? (
          <p className="rounded-sm bg-comms-tile px-4 py-3 text-center font-body text-sm text-comms-muted">
            Cloud ranks are unavailable until Supabase is configured.
          </p>
        ) : loading ? (
          <p className="text-center font-body text-sm text-comms-muted">
            Loading ranks...
          </p>
        ) : error ? (
          <p className="text-center font-body text-sm text-comms-accent" role="alert">
            {error}
          </p>
        ) : standing.row ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center">
              <Stat label="Streak rank" value={formatRank(standing.streakRank)} />
              <Stat label="Average rank" value={formatRank(standing.averageRank)} />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              <Stat label="Played" value={String(standing.row.dailies_played)} />
              <Stat label="Avg" value={standing.row.daily_avg.toFixed(2)} />
              <Stat label="Streak" value={String(standing.row.current_streak)} />
              <Stat label="Max" value={String(standing.row.max_streak)} />
            </div>
          </>
        ) : (
          <p className="rounded-sm bg-comms-tile px-4 py-3 text-center font-body text-sm text-comms-muted">
            Finish an official daily while signed in to appear on the ranks board.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-wide text-comms-text">
          This browser
        </h2>
        <p className="mb-3 font-body text-xs text-comms-muted">
          Includes puzzles played before you signed in
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="Played" value={String(localStats.played)} />
          <Stat label="Win %" value={String(winRate)} />
          <Stat label="Streak" value={String(localStats.currentStreak)} />
          <Stat label="Max" value={String(localStats.maxStreak)} />
        </div>
        <p className="mb-2 mt-5 font-body text-xs font-semibold uppercase tracking-wide text-comms-muted">
          Mistake distribution
        </p>
        <MistakeBars distribution={localStats.mistakeDistribution} />
      </section>

      <Link
        to="/ranks"
        className="mt-6 block text-center font-body text-xs font-semibold uppercase tracking-wide text-comms-accent hover:underline"
      >
        View ranks
      </Link>

      <SignOutButton redirectUrl="/">
        <button
          type="button"
          className="clip-angled mt-6 w-full border border-comms-text/70 bg-transparent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-comms-text transition hover:bg-comms-tile"
        >
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}

function formatRank(rank: number | null): string {
  if (rank == null) return "—";
  return `#${rank}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-comms-tile px-1 py-2">
      <p className="font-display text-xl text-comms-text tabular-nums">{value}</p>
      <p className="font-body text-[10px] uppercase tracking-wide text-comms-muted">
        {label}
      </p>
    </div>
  );
}

function MistakeBars({
  distribution,
}: {
  distribution: [number, number, number, number, number];
}) {
  const labels = ["0", "1", "2", "3", "X"];
  const max = Math.max(1, ...distribution);

  return (
    <div className="flex h-24 items-end gap-1.5">
      {distribution.map((count, i) => {
        const height = Math.max(8, Math.round((count / max) * 100));
        return (
          <div key={labels[i]} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end" title={`${count}`}>
              <div
                className="w-full rounded-sm bg-comms-tile"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="font-body text-[10px] text-comms-muted">
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
