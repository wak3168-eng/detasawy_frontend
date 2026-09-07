"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api";
import { hasToken } from "@/lib/auth";
import {
  clearDraft,
  loadDraft,
  subscribeDraft,
  type ProfileDraft,
} from "@/lib/profileDraft";

const NAV = [
  { href: "/contribute", label: "Contribute" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setAuthed(hasToken());
    return subscribeDraft(() => setDraft(loadDraft()));
  }, []);

  const complete = Boolean(draft?.completedAt);
  const place = [draft?.district?.name, draft?.province?.name]
    .filter(Boolean)
    .join(", ");
  const tribeChain = (draft?.tribePath ?? []).map((t) => t.name).join(" › ");

  return (
    <aside className="md:w-72 md:shrink-0">
      <div className="rounded-3xl border border-mist bg-white/70 p-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-azure text-sm font-extrabold text-white">
            D
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">
            Detasawy
          </span>
        </Link>

        <div className="mt-5 flex items-center gap-3.5">
          {draft?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.photo}
              alt=""
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-mist text-lg font-extrabold text-azure-deep">
              {(draft?.name ?? "؟").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-extrabold">
              {draft?.name ?? "Contributor"}
            </p>
            {place ? (
              <p className="truncate text-xs text-ink-soft">{place}</p>
            ) : (
              <p className="text-xs text-ink-soft">No profile yet</p>
            )}
          </div>
        </div>
        {tribeChain && (
          <p className="mt-3 truncate rounded-xl bg-mist/50 px-3 py-2 text-xs font-bold text-azure-deep">
            {tribeChain}
          </p>
        )}
        {complete ? (
          <Link
            href="/onboarding?next=/contribute"
            className="mt-3 inline-block text-xs font-bold text-ink-soft transition-colors hover:text-ink"
          >
            Edit profile
          </Link>
        ) : (
          <Link
            href="/onboarding?next=/contribute"
            className="mt-4 block rounded-full bg-azure py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-azure-deep"
          >
            Set up profile
          </Link>
        )}

        <div className="mt-5 rounded-2xl border border-sky/60 bg-mist/40 p-4 text-center">
          <p className="text-3xl font-extrabold text-azure-deep">0</p>
          <p className="text-xs font-bold">Kar Points</p>
          <p className="mt-1 text-[11px] text-ink-soft">
            Counting starts at launch
          </p>
        </div>

        <nav className="mt-5 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                pathname === item.href
                  ? "bg-azure text-white"
                  : "text-ink-soft hover:bg-mist hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {authed && (
          <button
            onClick={async () => {
              await logout();
              clearDraft();
              router.push("/");
            }}
            className="mt-4 w-full py-1.5 text-xs font-bold text-ink-soft transition-colors hover:text-ink"
          >
            Log out
          </button>
        )}
      </div>
    </aside>
  );
}
