"use client";

import { useState } from "react";
import {
  createUser,
  searchUsers,
  setUserRole,
  type AdminUser,
  type CreatedUser,
} from "@/lib/api";

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
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  const grantAccess = async () => {
    setInviting(true);
    setInviteError(null);
    try {
      const person = await createUser({
        name: newName.trim(),
        email: newEmail.trim(),
      });
      setCreated(person);
      setNewName("");
      setNewEmail("");
      setRows((list) => (list ? [person, ...list] : list));
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not create it.");
    } finally {
      setInviting(false);
    }
  };

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
        Give someone access, and promote contributors to the expert panel
        (reviewer) and back.
      </p>

      {created ? (
        <div className="mt-3 rounded-2xl border border-sky bg-mist/40 p-4">
          <p className="text-sm font-bold text-azure-deep">
            {created.name} can sign in now
          </p>
          <p className="mt-1 text-xs text-ink-soft">{created.email}</p>
          <p className="mt-3 text-xs font-semibold">Starting password</p>
          <p className="mt-1 select-all rounded-xl border border-mist bg-white px-3 py-2 font-mono text-sm">
            {created.startingPassword}
          </p>
          <p className="mt-2 text-[11px] text-ink-soft">
            Shown once — pass it on, and ask them to change it after their
            first login.
          </p>
          <button
            onClick={() => setCreated(null)}
            className="mt-3 text-xs font-bold text-azure-deep"
          >
            Done
          </button>
        </div>
      ) : adding ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-sky bg-mist/30 p-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Their name"
            className="w-full rounded-2xl border border-mist bg-white/80 px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && grantAccess()}
            placeholder="Their email"
            className="w-full rounded-2xl border border-mist bg-white/80 px-4 py-2.5 text-sm outline-none transition-colors focus:border-azure"
          />
          <div className="flex gap-2">
            <button
              disabled={inviting || !newName.trim() || !newEmail.trim()}
              onClick={grantAccess}
              className="flex-1 rounded-full bg-azure py-2.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
            >
              {inviting ? "Creating…" : "Create account"}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setInviteError(null);
              }}
              className="rounded-full px-4 text-sm font-bold text-ink-soft"
            >
              Cancel
            </button>
          </div>
          {inviteError && (
            <p className="text-center text-xs font-semibold text-[#b4552d]">
              {inviteError}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-sky py-2.5 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
        >
          <span className="grid size-5 place-items-center rounded-full bg-azure text-xs text-white">
            +
          </span>
          Give someone access
        </button>
      )}
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
