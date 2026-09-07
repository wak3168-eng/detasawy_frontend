export type LeaderboardRow = {
  rank: number;
  name: string;
  detail?: string;
  points: number;
};

/**
 * District standings. Empty until scoring goes live — swaps to the Django
 * portal endpoint (cached leaderboard snapshots) without UI changes.
 */
export async function getDistrictLeaderboard(): Promise<LeaderboardRow[]> {
  return [];
}
