"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadDraft, type ProfileDraft } from "@/lib/profileDraft";

const DAILY_SET = [
  { count: 10, label: "pictures to name" },
  { count: 3, label: "pictures to voice" },
  { count: 2, label: "conversations" },
];

export default function ContributeGate() {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  if (draft === null) return null;

  const complete = Boolean(draft.completedAt);

  return (
    <main className="grid min-h-dvh place-items-center bg-ice px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <Link
          href="/"
          className="mx-auto grid size-9 w-fit place-items-center rounded-lg bg-azure px-2.5 text-sm font-extrabold text-white"
        >
          D
        </Link>
        {complete ? (
          <>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
              {draft.name ? `You're all set, ${draft.name}.` : "You're all set."}
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              Your daily set opens at launch.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-2.5">
              {DAILY_SET.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-mist bg-white/70 px-2 py-4"
                >
                  <p className="text-2xl font-extrabold text-azure-deep">
                    {item.count}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/"
              className="mt-7 inline-block w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              Back home
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
              A few questions first
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
              Contributors tell us where their Pashto comes from — it&apos;s
              what makes every word count. About 30 seconds.
            </p>
            <Link
              href="/onboarding?next=/contribute"
              className="mt-7 inline-block w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              Set up my profile
            </Link>
            <Link
              href="/"
              className="mt-3 inline-block w-full py-2 text-sm font-bold text-ink-soft"
            >
              Maybe later
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
