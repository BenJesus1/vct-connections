import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SignOutButton, useAuth, useSession, useUser } from "@clerk/react";
import { RequireAccount } from "../components/AccountGate";
import { canOpenEditorUi } from "../auth/editor";
import { RankLabel } from "../components/RankLabel";
import {
  claimUsername,
  displayNameFromUser,
  fetchLeaderboard,
  fetchMyDailyRanks,
  MIN_RANK_BOARD_PLAYS,
  playerStanding,
  validateUsername,
} from "../lib/leaderboard";
import { useProfileName } from "../components/UsernameGate";
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
  const [wins, setWins] = useState(0);

  const profileName = useProfileName();
  const name =
    profileName ||
    displayNameFromUser({
      fullName: user?.fullName,
      firstName: user?.firstName,
      lastName: user?.lastName,
      username: user?.username,
      email: user?.primaryEmailAddress?.emailAddress,
    });
  const isEditor = canOpenEditorUi(userId);

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
    void Promise.all([fetchLeaderboard(client), fetchMyDailyRanks(client)]).then(
      ([board, ranks]) => {
        if (!active) return;
        setStanding(playerStanding(board.rows, userId));
        setWins(ranks.rows.filter((row) => row.won).length);
        setError(board.error || ranks.error);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [client, isSignedIn, userId]);

  const played = standing.row?.dailies_played ?? 0;
  const winRate = played === 0 ? 0 : Math.round((wins / played) * 100);

  return (
    <div className="mx-auto max-w-[390px]">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl tracking-wide text-comms-text sm:text-4xl">
          Account
        </h1>
        <p className="mt-1 font-body text-sm font-semibold uppercase tracking-wide text-comms-accent">
          {name}
        </p>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Your official ranks on each VCT COMMS you have finished.
        </p>
      </header>

      {isSignedIn && userId && isSupabaseConfigured() ? (
        <UsernameEditor current={profileName ?? name} userId={userId} />
      ) : null}

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
              <div className="rounded-sm bg-comms-tile px-1 py-2">
                {standing.commsRank ? (
                  <RankLabel rank={standing.commsRank} className="text-xl" />
                ) : (
                  <p className="font-display text-xl text-comms-text">—</p>
                )}
                <p className="font-body text-[10px] uppercase tracking-wide text-comms-muted">
                  {standing.row.dailies_played >= MIN_RANK_BOARD_PLAYS
                    ? "Avg rank"
                    : `${standing.row.dailies_played}/${MIN_RANK_BOARD_PLAYS} to qualify`}
                </p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              <Stat label="Played" value={String(standing.row.dailies_played)} />
              <Stat label="Win %" value={String(winRate)} />
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

      {isEditor ? (
        <Link
          to="/desk"
          className="mt-6 block text-center font-body text-xs font-semibold uppercase tracking-wide text-comms-accent hover:underline"
        >
          Official desk
        </Link>
      ) : null}

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

function UsernameEditor({
  current,
  userId,
}: {
  current: string;
  userId: string;
}) {
  const { session } = useSession();
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(current);
  }, [current]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (next === current.trim()) {
      setError(null);
      setSaved(false);
      return;
    }
    const invalid = validateUsername(next);
    if (invalid) {
      setError(invalid);
      setSaved(false);
      return;
    }
    if (!session) {
      setError("Sign in again to change your username.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const client = createClerkSupabaseClient(() => session.getToken());
    const message = client
      ? await claimUsername(client, userId, next)
      : "Supabase is not configured.";
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="mb-8">
      <h2 className="font-display text-2xl tracking-wide text-comms-text">
        Username
      </h2>
      <p className="mb-3 font-body text-xs text-comms-muted">
        Shown on ranks. Change it only if nobody else has that name.
      </p>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label className="sr-only" htmlFor="account-username">
          Username
        </label>
        <input
          id="account-username"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
          }}
          autoComplete="username"
          maxLength={24}
          className="w-full border border-comms-text/20 bg-comms-tile px-4 py-3 font-body text-sm text-comms-text outline-none placeholder:text-comms-muted focus:border-comms-accent"
        />
        <p className="mt-2 font-body text-[11px] text-comms-muted">
          3–24 characters. Letters, numbers, and underscores.
        </p>
        {error ? (
          <p className="mt-3 font-body text-xs text-comms-accent" role="alert">
            {error}
          </p>
        ) : saved ? (
          <p className="mt-3 font-body text-xs text-comms-gold">Saved.</p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="clip-angled mt-4 w-full bg-comms-accent px-5 py-3 font-body text-sm font-semibold uppercase tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save username"}
        </button>
      </form>
    </section>
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
