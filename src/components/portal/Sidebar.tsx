"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/portal/AdminSidebar";
import { logout } from "@/lib/api";
import { getUser, hasToken, type Role } from "@/lib/auth";
import {
  clearDraft,
  loadDraft,
  subscribeDraft,
  type ProfileDraft,
} from "@/lib/profileDraft";

const COLLAPSE_KEY = "detasawy:sidebar-collapsed";

const BASE_NAV = [
  {
    href: "/contribute",
    label: "Contribute",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
        <path d="M5 20v-8M12 20V5M19 20v-5" />
      </svg>
    ),
  },
];

const REVIEW_NAV = {
  href: "/admin",
  label: "Review",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 3 4 6v6c0 4.5 3.4 7.9 8 9 4.6-1.1 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 transition-transform ${open ? "" : "rotate-180"}`}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState<Role>("contributor");
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    setAuthed(hasToken());
    setRole(getUser()?.role ?? "contributor");
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored !== null) setCollapsed(stored === "1");
      else setCollapsed(window.matchMedia("(max-width: 767px)").matches);
    } catch {
      // default stays expanded
    }
    setReady(true);
    return subscribeDraft(() => {
      setDraft(loadDraft());
      setRole(getUser()?.role ?? "contributor");
    });
  }, []);

  const nav =
    role === "contributor" ? BASE_NAV : [...BASE_NAV, REVIEW_NAV];

  const toggle = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        // not persisted — still toggles
      }
      return !value;
    });
  };

  const name = draft?.name ?? "Contributor";
  const initial = (draft?.name ?? "؟").slice(0, 1).toUpperCase();
  const place = [draft?.district?.name, draft?.province?.name]
    .filter(Boolean)
    .join(", ");
  const tribeChain = (draft?.tribePath ?? []).map((t) => t.name).join(" › ");
  const complete = Boolean(draft?.completedAt);

  const avatar = draft?.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={draft.photo}
      alt=""
      className="size-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-sm font-extrabold text-azure-deep">
      {initial}
    </span>
  );

  const doLogout = async () => {
    await logout();
    clearDraft();
    router.push("/");
  };

  if (!ready) {
    return <aside className="md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0" />;
  }

  if (role === "superadmin") {
    return <AdminSidebar />;
  }

  if (collapsed) {
    return (
      <aside className="p-4 pb-0 md:sticky md:top-0 md:h-dvh md:w-20 md:shrink-0 md:p-0">
        {/* mobile: compact bar */}
        <div className="flex items-center gap-3 rounded-3xl border border-mist bg-white/70 p-3 md:hidden">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">{name}</p>
            <p className="truncate text-[11px] text-ink-soft">
              0 Kar Points
            </p>
          </div>
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-mist text-ink-soft transition-colors hover:bg-mist"
          >
            <Chevron open={false} />
          </button>
        </div>
        {/* desktop: full-height icon rail on the edge */}
        <div className="hidden h-full flex-col items-center gap-4 border-r border-mist bg-white/70 px-3 py-5 md:flex">
          <Link
            href="/"
            className="grid size-9 place-items-center rounded-lg bg-azure text-sm font-extrabold text-white"
          >
            D
          </Link>
          {avatar}
          <p className="text-sm font-extrabold text-azure-deep">0</p>
          <nav className="flex flex-col gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`grid size-10 place-items-center rounded-xl transition-colors ${
                  pathname === item.href
                    ? "bg-azure text-white"
                    : "text-ink-soft hover:bg-mist hover:text-ink"
                }`}
              >
                {item.icon}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            title="Expand"
            className="mt-auto grid size-9 place-items-center rounded-full border border-mist text-ink-soft transition-colors hover:bg-mist"
          >
            <Chevron open={false} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="p-4 pb-0 md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:p-0">
      <div className="flex flex-col rounded-3xl border border-mist bg-white/70 p-5 md:h-full md:overflow-y-auto md:rounded-none md:border-0 md:border-r">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-azure text-sm font-extrabold text-white">
              D
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">
              Detasawy
            </span>
          </Link>
          <button
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist"
          >
            <Chevron open />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3.5">
          {avatar}
          <div className="min-w-0">
            <p className="truncate font-extrabold">{name}</p>
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
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${
                pathname === item.href
                  ? "bg-azure text-white"
                  : "text-ink-soft hover:bg-mist hover:text-ink"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {authed && (
          <button
            onClick={doLogout}
            className="mt-4 w-full py-1.5 text-xs font-bold text-ink-soft transition-colors hover:text-ink md:mt-auto md:pt-5"
          >
            Log out
          </button>
        )}
      </div>
    </aside>
  );
}
