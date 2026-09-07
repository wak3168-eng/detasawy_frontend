import Link from "next/link";
import LeaderboardBoard from "@/components/leaderboard/LeaderboardBoard";
import { getDistrictLeaderboard } from "@/lib/leaderboard";

export default async function LeaderboardSection() {
  const rows = await getDistrictLeaderboard();

  return (
    <section id="leaderboard" className="border-t border-mist">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          The district race
        </h2>
        <p className="mt-3 text-center text-sm text-ink-soft">
          Which district builds the most Pashto?
        </p>
        <div className="mt-10">
          <LeaderboardBoard rows={rows.slice(0, 3)} showCta={false} />
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/leaderboard"
            className="text-sm font-bold text-azure-deep transition-colors hover:text-ink"
          >
            See the full board &rarr;
          </Link>
        </p>
      </div>
    </section>
  );
}
