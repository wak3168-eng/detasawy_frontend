"use client";

import { useEffect, useState } from "react";
import { getMyStats, type MyStats } from "@/lib/api";
import { hasToken } from "@/lib/auth";

export default function StatTiles() {
  const [stats, setStats] = useState<MyStats | null>(null);

  useEffect(() => {
    if (hasToken()) getMyStats().then(setStats, () => {});
  }, []);

  const rank = (n: number | null | undefined) =>
    n === null || n === undefined ? "—" : `#${n}`;

  const tiles = [
    { value: String(stats?.streak ?? 0), label: "day streak", icon: "🔥" },
    {
      value: String(stats?.wordsAccepted ?? 0),
      label: "words added",
      icon: "✅",
    },
    { value: rank(stats?.overallRank), label: "overall rank", icon: "🌍" },
    { value: rank(stats?.districtRank), label: "district rank", icon: "🏆" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-2xl border border-mist bg-white/70 px-2 py-4 text-center"
        >
          <p className="text-xl font-extrabold text-azure-deep sm:text-2xl">
            <span className="mr-1.5">{tile.icon}</span>
            {tile.value}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-ink-soft">
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}
