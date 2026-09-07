import { API_BASE } from "@/lib/apiBase";

export type LeaderboardRow = {
  rank: number;
  name: string;
  detail?: string;
  points: number;
};

/** District standings, live from the Django portal endpoint. */
export async function getDistrictLeaderboard(): Promise<LeaderboardRow[]> {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard/districts`);
    if (!res.ok) return [];
    return (await res.json()) as LeaderboardRow[];
  } catch {
    return [];
  }
}
