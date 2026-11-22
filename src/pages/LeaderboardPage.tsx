import { useEffect, useMemo, useState } from "react";
import { useAuth, useSession } from "@clerk/react";
import { AccountGate, RequireAccount } from "../components/AccountGate";
import {
  fetchLeaderboard,
  rankByAverage,
  rankByStreak,
  type LeaderboardRow,
} from "../lib/leaderboard";
import { createClerkSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

const TOP_N = 25;

export function LeaderboardPage() {
  return (
    <RequireAccount
      title="Ranks"
      signedOutBody="Sign in with Google to see who has the longest streaks and lowest daily averages."
      unconfiguredBody="Turn on Clerk sign-in to open the account leaderboard."
    >
      <SignedInLeaderboard />
    </RequireAccount>
  );
}

function SignedInLeaderboard() {
  const { isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setRows(result.rows);
      setError(result.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [client, isSignedIn]);

  if (!isSupabaseConfigured()) {
    return (
      <AccountGate
        title="Ranks"
        body="Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then run the leaderboard migration."
      />
    );
  }

  const streakRows = rankByStreak(rows).slice(0, TOP_N);
  const averageRows = rankByAverage(rows).slice(0, TOP_N);

  return (
    <div className="mx-auto max-w-[390px]">
      <header className="mb-6 text-center">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-comms-accent">
          Account
        </p>
        <h1 className="font-display text-4xl tracking-wide text-comms-text">
          Ranks
        </h1>
        <p className="mt-2 font-body text-sm text-comms-muted">
          Official dailies only. Streaks and averages are stored in Supabase for signed-in players.
        </p>
      </header>

      {loading ? (
        <p className="text-center font-body text-sm text-comms-muted">
          Loading ranks...
        </p>
      ) : error ? (
        <p className="text-center font-body text-sm text-comms-accent" role="alert">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-center font-body text-sm text-comms-muted">
          No ranked dailies yet. Finish today&apos;s puzzle while signed in to appear here.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <Board
            title="Longest streaks"
            hint="Best win streak, then current streak"
            rows={streakRows}
            userId={userId}
            value={(row) => String(row.max_streak)}
            sub={(row) => "now " + row.current_streak}
          />
          <Board
            title="Lowest averages"
            hint="Average mistakes per official daily"
            rows={averageRows}
            userId={userId}
            value={(row) => row.daily_avg.toFixed(2)}
            sub={(row) => row.dailies_played + " played"}
          />
        </div>
      )}
    </div>
  );
}

function Board({
  title,
  hint,
  rows,
  userId,
  value,
  sub,
}: {
  title: string;
  hint: string;
  rows: LeaderboardRow[];
  userId: string | null | undefined;
  value: (row: LeaderboardRow) => string;
  sub: (row: LeaderboardRow) => string;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl tracking-wide text-comms-text">
        {title}
      </h2>
      <p className="mb-3 font-body text-xs text-comms-muted">{hint}</p>
      <ol className="flex flex-col gap-2">
        {rows.map((row, index) => {
          const mine = row.user_id === userId;
          return (
            <li
              key={row.user_id}
              className={[
                "flex items-center justify-between gap-3 rounded-sm px-4 py-3",
                mine ? "bg-comms-accent/20" : "bg-comms-tile",
              ].join(" ")}
            >
              <div className="min-w-0">
                <p className="truncate font-body text-sm font-semibold text-comms-text">
                  <span className="mr-2 text-comms-muted">{index + 1}</span>
                  {row.display_name}
                  {mine ? (
                    <span className="ml-2 font-body text-[10px] uppercase tracking-wide text-comms-accent">
                      You
                    </span>
                  ) : null}
                </p>
                <p className="font-body text-[11px] text-comms-muted">{sub(row)}</p>
              </div>
              <p className="font-display text-2xl tracking-wide text-comms-text tabular-nums">
                {value(row)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

