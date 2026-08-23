import { getSupabaseBrowserClient } from "../supabase/browser-client";

export type LeaderboardCategory = string;

export type LeaderboardRow = {
  rank: number;
  userId: string;
  alias: string;
  avatarUrl: string | null;
  score: number;
  timeUsedSeconds: number | null;
  attemptId: string;
  submittedAt: string;
  category: LeaderboardCategory;
};

type LeaderboardRpcRow = {
  rank: number;
  user_id: string;
  alias: string;
  avatar_url: string | null;
  score: number;
  time_used_seconds: number | null;
  attempt_id: string;
  submitted_at: string;
  category: LeaderboardCategory;
};

type LeaderboardClient = Pick<ReturnType<typeof getSupabaseBrowserClient>, "rpc">;

function mapLeaderboardRow(row: LeaderboardRpcRow): LeaderboardRow {
  return {
    rank: row.rank,
    userId: row.user_id,
    alias: row.alias,
    avatarUrl: row.avatar_url,
    score: row.score,
    timeUsedSeconds: row.time_used_seconds,
    attemptId: row.attempt_id,
    submittedAt: row.submitted_at,
    category: row.category,
  };
}

export async function getLeaderboard(
  {
    category,
  }: {
    category: LeaderboardCategory;
  },
  client: LeaderboardClient = getSupabaseBrowserClient(),
): Promise<LeaderboardRow[]> {
  const { data, error } = await client.rpc("get_leaderboard", {
    target_category: category,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as LeaderboardRpcRow[] | null) ?? []).map(mapLeaderboardRow);
}
