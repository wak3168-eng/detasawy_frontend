"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CampaignManager from "@/components/admin/CampaignManager";
import OverviewStats from "@/components/admin/OverviewStats";
import PromptManager from "@/components/admin/PromptManager";
import ReviewQueue from "@/components/admin/ReviewQueue";
import TeamManager from "@/components/admin/TeamManager";
import { getUser, type Role } from "@/lib/auth";

export default function AdminPanel() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    setRole(getUser()?.role ?? "contributor");
  }, []);

  if (role === null) return null;

  if (role === "contributor") {
    return (
      <div className="rounded-3xl border border-mist bg-white/70 p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Team members only
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          This area is for the Detasawy team.
        </p>
        <Link
          href="/contribute"
          className="mt-6 inline-block rounded-full bg-azure px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Back to contributing
        </Link>
      </div>
    );
  }

  const isSuper = role === "superadmin";
  const isCampaign = role === "campaign";
  const isReviewer = role === "reviewer";

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {isSuper ? "Admin" : isCampaign ? "Campaigns & content" : "Review"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {isSuper
          ? "The whole portal at a glance."
          : isCampaign
            ? "Stock the pictures and voice notes, run the drives."
            : "Entries contributors added, waiting for a decision."}
      </p>

      {(isSuper || isCampaign) && (
        <div className="mt-5">
          <OverviewStats />
        </div>
      )}

      {(isSuper || isCampaign) && (
        <>
          <h2 className="mt-7 font-extrabold">Prompts</h2>
          <div className="mt-3">
            <PromptManager />
          </div>
          <h2 className="mt-7 font-extrabold">Campaigns</h2>
          <div className="mt-3">
            <CampaignManager />
          </div>
        </>
      )}

      {(isSuper || isReviewer) && (
        <>
          <h2 className="mt-7 font-extrabold">Review queue</h2>
          <div className="mt-3">
            <ReviewQueue />
          </div>
        </>
      )}

      {isSuper && (
        <div className="mt-7">
          <TeamManager />
        </div>
      )}
    </div>
  );
}
