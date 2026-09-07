import Link from "next/link";
import type { LeaderboardRow } from "@/lib/leaderboard";

const MEDAL_STYLES = [
  "bg-azure text-white",
  "bg-sky text-ink",
  "bg-mist text-azure-deep",
];

export default function LeaderboardBoard({
  rows,
  showCta = true,
}: {
  rows: LeaderboardRow[];
  showCta?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-mist bg-white/60 px-3 py-6 text-center"
            >
              <span
                className={`mx-auto grid size-9 place-items-center rounded-full text-sm font-extrabold ${MEDAL_STYLES[i]}`}
              >
                {i + 1}
              </span>
              <p className="mt-3 text-lg font-extrabold text-sky">—</p>
              <p className="text-xs font-semibold text-ink-soft">0 points</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          No scores yet — be the first. Every word you add scores for your
          district.
        </p>
        {showCta && (
          <div className="mt-5 text-center">
            <Link
              href="/contribute"
              className="inline-block rounded-full bg-azure px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              Claim your spot
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {rows.map((row) => (
        <li
          key={row.rank}
          className="flex items-center gap-4 rounded-2xl border border-mist bg-white/60 px-5 py-3.5"
        >
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
              MEDAL_STYLES[row.rank - 1] ?? "bg-ice text-ink-soft"
            }`}
          >
            {row.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{row.name}</p>
            {row.detail && (
              <p className="truncate text-xs text-ink-soft">{row.detail}</p>
            )}
          </div>
          <span className="text-sm font-extrabold text-azure-deep">
            {row.points.toLocaleString()} pts
          </span>
        </li>
      ))}
    </ol>
  );
}
