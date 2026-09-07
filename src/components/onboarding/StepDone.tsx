"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasToken } from "@/lib/auth";
import type { ProfileDraft } from "@/lib/profileDraft";

export default function StepDone({
  draft,
  nextHref = "/",
}: {
  draft: ProfileDraft;
  nextHref?: string;
}) {
  const place = [draft.tehsil?.name, draft.district?.name, draft.province?.name]
    .filter(Boolean)
    .join(", ");
  const livesIn = draft.residence
    ? [draft.city, draft.residence.name].filter(Boolean).join(", ")
    : null;
  const tribeChain = (draft.tribePath ?? []).map((t) => t.name).join(" › ");
  const added =
    (draft.tribePath ?? []).some((t) => t.pending) ||
    draft.province?.pending ||
    draft.district?.pending ||
    draft.tehsil?.pending ||
    draft.residence?.pending;
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(hasToken());
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-mist bg-white/70 p-6">
        <div className="flex items-center gap-4">
          {draft.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={draft.photo}
              alt=""
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-mist text-xl font-extrabold text-azure-deep">
              {(draft.name ?? "؟").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-lg font-extrabold">{draft.name ?? "Contributor"}</p>
            {place && <p className="text-sm text-ink-soft">{place}</p>}
            {livesIn ? (
              <p className="text-xs text-ink-soft">Lives in {livesIn}</p>
            ) : (
              draft.city && (
                <p className="text-sm text-ink-soft">{draft.city}</p>
              )
            )}
          </div>
        </div>
        {tribeChain && (
          <p className="mt-4 rounded-2xl bg-mist/50 px-4 py-3 text-sm font-bold text-azure-deep">
            {tribeChain}
          </p>
        )}
        {draft.language && (
          <p className="mt-3 text-xs font-semibold text-ink-soft">
            Your language: {draft.language}
          </p>
        )}
      </div>
      {added && (
        <p className="text-center text-xs text-ink-soft">
          What you added is live for everyone now — thank you for growing the
          list.
        </p>
      )}
      <p className="text-center text-sm text-ink-soft">
        {authed
          ? "Saved to your account."
          : "Saved on this device — sign up to keep it."}
      </p>
      <Link
        href={nextHref}
        className="block w-full rounded-full bg-azure py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-azure-deep"
      >
        Continue
      </Link>
    </div>
  );
}
