"use client";

import { useState } from "react";
import { searchUsers, setUserRole, type AdminUser } from "@/lib/api";

const ROLE_STYLES: Record<AdminUser["role"], string> = {
  superadmin: "bg-azure text-white",
  reviewer: "bg-sky text-ink",
  campaign: "bg-[#e0b53f]/30 text-ink",
  contributor: "bg-mist text-azure-deep",
};

const ROLE_ACTIONS: Array<{
  role: "reviewer" | "campaign" | "contributor";
  label: string;
}> = [
  { role: "reviewer", label: "Make reviewer" },
  { role: "campaign", label: "Make campaign manager" },
  { role: "contributor", label: "Make contributor" },
];

export default function TeamManager() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    try {
      setRows(await searchUsers(query.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    }
  };

  const changeRole = async (
    user: AdminUser,
    role: "reviewer" | "campaign" | "contributor",
  ) => {
    setBusyEmail(user.email);
    setError(null);
    try {
      const updated = await setUserRole(user.email, role);
      setRows(
        (list) =>
          list?.map((u) => (u.email === updated.email ? updated : u)) ?? null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <h2 className="font-extrabold">Team</h2>
      <p className="mt-1 text-xs text-ink-soft">
        Promote contributors to the expert panel (reviewer) and back.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search name or email…"
          className="min-w-0 flex-1 rounded-2xl border border-mist bg-ice px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
        />
        <button
          onClick={search}
          className="rounded-full bg-azure px-5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Search
        </button>
      </div>

      {rows !== null && (
        <div className="mt-4 space-y-2">
          {rows.length === 0 && (
            <p className="py-3 text-center text-sm text-ink-soft">
              No accounts found.
            </p>
          )}
          {rows.map((user) => (
            <div
              key={user.email}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-mist bg-ice px-4 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">
                  {user.name || user.email}
                </p>
                <p className="truncate text-xs text-ink-soft">{user.email}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ROLE_STYLES[user.role]}`}
              >
                {user.role}
              </span>
              {user.role !== "superadmin" &&
                ROLE_ACTIONS.filter((a) => a.role !== user.role).map((a) => (
                  <button
                    key={a.role}
                    disabled={busyEmail === user.email}
                    onClick={() => changeRole(user, a.role)}
                    className="rounded-full border border-sky px-3.5 py-1.5 text-xs font-bold text-azure-deep transition-colors hover:bg-mist disabled:opacity-50"
                  >
                    {a.label}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs font-semibold text-[#b4552d]">{error}</p>
      )}
    </div>
  );
}
