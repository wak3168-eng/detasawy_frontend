"use client";

import { useEffect, useState } from "react";
import { getOverview, type OverviewStats as Stats } from "@/lib/api";

const fmt = (n: number | undefined) =>
  n === undefined ? "…" : n.toLocaleString("en");

function Tile({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-mist bg-white/70 px-3 py-3.5">
      <p className="text-xl font-extrabold text-azure-deep">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-ink-soft/80">{sub}</p>}
    </div>
  );
}

export default function OverviewStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const s = stats ?? undefined;

  useEffect(() => {
    getOverview().then(setStats, () => {});
  }, []);

  return (
    <div className="space-y-2.5">
      <div className="rounded-3xl border border-mist bg-white/70 p-5">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-azure-deep">
              {fmt(s?.uniqueWords)}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">
              unique words
            </p>
          </div>
          <span className="text-lg text-ink-soft/50">from</span>
          <div>
            <p className="text-3xl font-extrabold tracking-tight">
              {fmt(s?.pictures)}
            </p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">pictures</p>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-soft">
          {fmt(s?.contributions)} answers · {fmt(s?.voiceNotes)} with voice ·{" "}
          {fmt(s?.picturesAnswered)} pictures answered
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile
          value={fmt(s?.users)}
          label="accounts"
          sub={`${fmt(s?.profilesCompleted)} profiles done`}
        />
        <Tile
          value={fmt(s?.contributors)}
          label="contributors"
          sub="have answered"
        />
        <Tile
          value={fmt(s?.contributionsToday)}
          label="answers today"
          sub={`${fmt(s?.contributionsWeek)} this week`}
        />
        <Tile
          value={fmt(s?.districtsCovered)}
          label="districts covered"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile
          value={fmt(s?.picturesActive)}
          label="pictures live"
        />
        <Tile
          value={fmt(s?.campaignsLive)}
          label="live campaigns"
        />
        <Tile
          value={fmt(s?.suggestionsPending)}
          label="pending review"
        />
        <Tile
          value={`${fmt(s?.tribes)} · ${fmt(s?.languages)}`}
          label="tribes · languages"
        />
      </div>
    </div>
  );
}
