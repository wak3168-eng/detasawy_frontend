"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadDraft, type ProfileDraft } from "@/lib/profileDraft";

const ACTIVITIES = [
  {
    count: 10,
    title: "Name it",
    body: "See a picture, give its Pashto name.",
  },
  {
    count: 3,
    title: "Say it",
    body: "See a picture, record the word aloud.",
  },
  {
    count: 2,
    title: "Reply",
    body: "Answer in your own dialect.",
  },
];

export default function DailySetPanel() {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  useEffect(() => {
    setDraft(loadDraft());
  }, []);

  if (draft === null) return null;

  if (!draft.completedAt) {
    return (
      <div className="rounded-3xl border border-mist bg-white/70 p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          A few questions first
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
          Contributors tell us where their Pashto comes from &mdash; it&apos;s
          what makes every word count. About 30 seconds.
        </p>
        <Link
          href="/onboarding?next=/contribute"
          className="mt-6 inline-block rounded-full bg-azure px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
        >
          Set up my profile
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        {draft.name ? `Salaam, ${draft.name} 👋` : "Salaam 👋"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Your daily set &mdash; 15 quick contributions.
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-mist">
        <div className="h-full w-0 rounded-full bg-azure" />
      </div>
      <p className="mt-1.5 text-xs font-bold text-ink-soft">0 / 15 today</p>

      <div className="mt-6 space-y-3.5">
        {ACTIVITIES.map((activity) => (
          <div
            key={activity.title}
            className="flex items-center gap-4 rounded-3xl border border-mist bg-white/70 p-5"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mist text-lg font-extrabold text-azure-deep">
              {activity.count}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">{activity.title}</h2>
              <p className="text-xs text-ink-soft">{activity.body}</p>
            </div>
            <span className="shrink-0 rounded-full bg-mist px-3.5 py-1.5 text-[11px] font-bold text-azure-deep">
              At launch
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-ink-soft">
        Contributions open at launch &mdash; your profile is ready.
      </p>
    </div>
  );
}
