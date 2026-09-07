"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { clearDraft } from "@/lib/profileDraft";

const COLLAPSE_KEY = "detasawy:sidebar-collapsed";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/contribute",
    label: "View as contributor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
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

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(getUser()?.email ?? "");
    try {
      const stored = localStorage.getItem(COLLAPSE_KEY);
      if (stored !== null) setCollapsed(stored === "1");
      else setCollapsed(window.matchMedia("(max-width: 767px)").matches);
    } catch {
      // default stays expanded
    }
  }, []);

  const toggle = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        // still toggles
      }
      return !value;
    });
  };

  const doLogout = async () => {
    await logout();
    clearDraft();
    router.push("/");
  };

  const linkStyle = (href: string) =>
    `${
      pathname === href
        ? "bg-azure text-white"
        : "text-sky hover:bg-white/10 hover:text-white"
    }`;

  if (collapsed) {
    return (
      <aside className="p-4 pb-0 md:sticky md:top-0 md:h-dvh md:w-20 md:shrink-0 md:p-0">
        {/* mobile: compact dark bar */}
        <div className="flex items-center gap-3 rounded-3xl bg-ink p-3 text-white md:hidden">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-azure text-sm font-extrabold">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">Superadmin</p>
            <p className="truncate text-[11px] text-sky">{email}</p>
          </div>
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/20 text-sky transition-colors hover:bg-white/10"
          >
            <Chevron open={false} />
          </button>
        </div>
        {/* desktop: dark rail */}
        <div className="hidden h-full flex-col items-center gap-4 bg-ink px-3 py-5 text-white md:flex">
          <Link
            href="/admin"
            className="grid size-9 place-items-center rounded-lg bg-azure text-sm font-extrabold"
          >
            D
          </Link>
          <span className="rounded-full bg-azure/30 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-sky">
            ADMIN
          </span>
          <nav className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`grid size-10 place-items-center rounded-xl transition-colors ${linkStyle(item.href)}`}
              >
                {item.icon}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            title="Expand"
            className="mt-auto grid size-9 place-items-center rounded-full border border-white/20 text-sky transition-colors hover:bg-white/10"
          >
            <Chevron open={false} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="p-4 pb-0 md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:p-0">
      <div className="flex flex-col rounded-3xl bg-ink p-5 text-white md:h-full md:overflow-y-auto md:rounded-none">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-azure text-sm font-extrabold">
              D
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">
              Detasawy
            </span>
          </Link>
          <button
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="grid size-8 place-items-center rounded-full text-sky transition-colors hover:bg-white/10"
          >
            <Chevron open />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-azure text-base font-extrabold">
            A
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-extrabold">
              Superadmin
              <span className="rounded-full bg-azure/30 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-sky">
                FULL ACCESS
              </span>
            </p>
            <p className="truncate text-xs text-sky">{email}</p>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors ${linkStyle(item.href)}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={doLogout}
          className="mt-4 w-full py-1.5 text-xs font-bold text-sky transition-colors hover:text-white md:mt-auto md:pt-5"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
