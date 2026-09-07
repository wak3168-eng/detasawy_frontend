"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OverviewStats from "@/components/admin/OverviewStats";
import ReviewQueue from "@/components/admin/ReviewQueue";
import TeamManager from "@/components/admin/TeamManager";
import { API_BASE } from "@/lib/apiBase";
import { getUser, type Role } from "@/lib/auth";

const QUICK_LINKS = [
  { label: "Add prompts", path: "/admin/corpus/prompt/add/" },
  { label: "New campaign", path: "/admin/portal/campaign/add/" },
  { label: "All users", path: "/admin/identity/user/" },
];

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
          Reviewers only
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          This area is for the review team.
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

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {isSuper ? "Admin" : "Review"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {isSuper
          ? "The whole portal at a glance."
          : "Entries contributors added, waiting for a decision."}
      </p>
      {isSuper && (
        <>
          <div className="mt-5">
            <OverviewStats />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={`${API_BASE}${link.path}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-sky px-4 py-2 text-xs font-bold text-azure-deep transition-colors hover:bg-mist"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </>
      )}
      <h2 className="mt-7 font-extrabold">Review queue</h2>
      <div className="mt-3">
        <ReviewQueue />
      </div>
      {isSuper && (
        <div className="mt-6">
          <TeamManager />
        </div>
      )}
    </div>
  );
}
