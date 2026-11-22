import { useEffect, useMemo, useRef } from "react";
import { useSession, useUser } from "@clerk/react";
import { puzzles } from "../data/puzzles";
import {
  displayNameFromUser,
  isOfficialDaily,
  submitDailyResult,
  upsertProfile,
} from "../lib/leaderboard";
import { createClerkSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import { loadSavedState } from "../game/storage";
import type { GameState, Puzzle } from "../game/types";

interface DailyResultSyncProps {
  puzzle: Puzzle;
  state: GameState;
}

export function DailyResultSync({ puzzle, state }: DailyResultSyncProps) {
  const { session } = useSession();
  const { user } = useUser();
  const syncedLocal = useRef(false);

  const client = useMemo(() => {
    if (!isSupabaseConfigured() || !session) return null;
    return createClerkSupabaseClient(() => session.getToken());
  }, [session]);

  useEffect(() => {
    if (!client || !user) return;
    void upsertProfile(
      client,
      user.id,
      displayNameFromUser({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      }),
    );
  }, [client, user]);

  useEffect(() => {
    if (!client || !user || syncedLocal.current) return;
    syncedLocal.current = true;
    const saved = loadSavedState();
    void Promise.all(
      Object.entries(saved.byPuzzle).map(([id, progress]) => {
        if (progress.status !== "won" && progress.status !== "lost") return null;
        const localPuzzle = puzzles.find((item) => item.id === Number(id));
        if (!localPuzzle || !isOfficialDaily(localPuzzle)) return null;
        return submitDailyResult(client, localPuzzle, progress);
      }),
    );
  }, [client, user]);

  useEffect(() => {
    if (!client) return;
    if (state.status !== "won" && state.status !== "lost") return;
    if (!isOfficialDaily(puzzle)) return;
    void submitDailyResult(client, puzzle, state);
  }, [client, puzzle, state, state.mistakes, state.status]);

  return null;
}
