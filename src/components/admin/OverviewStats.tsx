"use client";

import { useEffect, useState } from "react";
import { getOverview, type OverviewStats as Stats } from "@/lib/api";

const LABELS: Array<{ key: keyof Stats; label: string }> = [
  { key: "users", label: "accounts" },
  { key: "profilesCompleted", label: "profiles done" },
  { key: "tribes", label: "tribes" },
  { key: "languages", label: "languages" },
  { key: "suggestionsPending", label: "pending review" },
  { key: "prompts", label: "active prompts" },
];

export default function OverviewStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getOverview().then(setStats, () => {});
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
      {LABELS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-mist bg-white/70 px-2 py-3.5 text-center"
        >
          <p className="text-xl font-extrabold text-azure-deep">
            {stats ? stats[key] : "…"}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
