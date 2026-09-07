"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OverviewStats from "@/components/admin/OverviewStats";
import ReviewQueue from "@/components/admin/ReviewQueue";
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

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Review</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Entries contributors added, waiting for a decision.
      </p>
      {role === "superadmin" && (
        <div className="mt-5">
          <OverviewStats />
        </div>
      )}
      <div className="mt-6">
        <ReviewQueue />
      </div>
    </div>
  );
}
