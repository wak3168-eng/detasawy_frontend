"use client";

import { useEffect, useState } from "react";
import { getCampaigns, type CampaignItem } from "@/lib/api";

function daysLeft(endsAt: string): string {
  const days = Math.max(
    0,
    Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000),
  );
  return days <= 1 ? "ends today" : `${days} days left`;
}

export default function CampaignsCard() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);

  useEffect(() => {
    getCampaigns().then(setCampaigns, () => {});
  }, []);

  if (campaigns.length === 0) return null;

  return (
    <div className="rounded-3xl border border-sky/70 bg-mist/40 p-5">
      <h2 className="font-extrabold">Live campaigns 🏁</h2>
      <div className="mt-3 space-y-2.5">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
          >
            <p className="font-bold">{campaign.name}</p>
            {campaign.scopeName && (
              <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-bold text-azure-deep">
                {campaign.scopeName}
              </span>
            )}
            <span className="text-xs font-semibold text-ink-soft">
              {daysLeft(campaign.endsAt)}
            </span>
            {campaign.description && (
              <p className="w-full text-xs text-ink-soft">
                {campaign.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
