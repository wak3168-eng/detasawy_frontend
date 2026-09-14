"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DatasetPanel from "@/components/admin/DatasetPanel";
import { getUser, type Role } from "@/lib/auth";

export default function DatasetPage() {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    setRole(getUser()?.role ?? "contributor");
  }, []);

  if (role === null) return null;

  if (role !== "superadmin") {
    return (
      <div className="rounded-3xl border border-mist bg-white/70 p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Superadmin only
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          The collected dataset is kept to the people who own it.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-full bg-azure px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Back to admin
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Dataset</h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Every picture beside the words people gave it, and who said them.
      </p>
      <div className="mt-5">
        <DatasetPanel />
      </div>
    </div>
  );
}
