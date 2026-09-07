"use client";

import { useEffect, useState } from "react";
import {
  actOnSuggestion,
  getSuggestions,
  type StaffSuggestion,
} from "@/lib/api";
import { fetchRef } from "@/lib/refClient";
import type { RefOption } from "@/lib/refTypes";

function SuggestionCard({
  suggestion,
  onDone,
}: {
  suggestion: StaffSuggestion;
  onDone: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [siblings, setSiblings] = useState<RefOption[] | null>(null);

  const act = async (
    action: "approve" | "reject" | "merge",
    mergeIntoId?: string,
  ) => {
    setBusy(true);
    setError(null);
    try {
      await actOnSuggestion(suggestion.id, action, mergeIntoId);
      onDone(suggestion.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
      setBusy(false);
    }
  };

  const openMerge = () => {
    setMerging(true);
    if (siblings === null) {
      const endpoint = suggestion.parentId
        ? `/api/ref/tribes?parent=${suggestion.parentId}`
        : "/api/ref/tribes";
      fetchRef(endpoint).then(setSiblings, () => setSiblings([]));
    }
  };

  return (
    <div className="rounded-3xl border border-mist bg-white/70 p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-lg font-extrabold">{suggestion.name}</p>
        <span className="rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-bold text-azure-deep">
          {suggestion.kind}
        </span>
        {suggestion.parentName && (
          <span className="text-xs text-ink-soft">
            under {suggestion.parentName}
          </span>
        )}
        {suggestion.timesSuggested > 1 && (
          <span className="text-xs font-bold text-azure-deep">
            ×{suggestion.timesSuggested}
          </span>
        )}
      </div>
      {suggestion.suggestedBy && (
        <p className="mt-1 text-xs text-ink-soft">by {suggestion.suggestedBy}</p>
      )}
      {suggestion.candidates.length > 0 && !merging && (
        <p className="mt-2 text-xs text-ink-soft">
          Similar existing:{" "}
          <span className="font-bold text-azure-deep">
            {suggestion.candidates.map((c) => c.name).join(", ")}
          </span>
        </p>
      )}

      {merging ? (
        <div className="mt-3">
          <p className="text-xs font-bold">Merge into:</p>
          <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto pr-1">
            {siblings === null && (
              <div className="h-9 animate-pulse rounded-xl bg-mist/60" />
            )}
            {siblings?.map((option) => (
              <button
                key={option.id}
                disabled={busy}
                onClick={() => act("merge", option.id)}
                className="block w-full rounded-xl border border-mist bg-ice px-3.5 py-2 text-left text-sm font-bold transition-colors hover:border-azure disabled:opacity-50"
              >
                {option.name}
                {option.ps && (
                  <span dir="rtl" lang="ps" className="ms-2 font-naskh text-ink-soft">
                    {option.ps}
                  </span>
                )}
              </button>
            ))}
            {siblings !== null && siblings.length === 0 && (
              <p className="text-xs text-ink-soft">No existing siblings.</p>
            )}
          </div>
          <button
            onClick={() => setMerging(false)}
            className="mt-2 text-xs font-bold text-ink-soft"
          >
            Cancel merge
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={busy}
            onClick={() => act("approve")}
            className="rounded-full bg-azure px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
          >
            Approve
          </button>
          {suggestion.kind === "tribe" && (
            <button
              disabled={busy}
              onClick={openMerge}
              className="rounded-full border border-sky px-5 py-2 text-sm font-bold text-azure-deep transition-colors hover:bg-mist disabled:opacity-50"
            >
              Merge…
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => act("reject")}
            className="rounded-full px-5 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs font-semibold text-[#b4552d]">{error}</p>
      )}
    </div>
  );
}

export default function ReviewQueue() {
  const [items, setItems] = useState<StaffSuggestion[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getSuggestions("pending").then(setItems, () => setFailed(true));
  }, []);

  if (failed) {
    return (
      <p className="rounded-3xl border border-mist bg-white/70 p-7 text-center text-sm text-ink-soft">
        Couldn&apos;t load the queue — are you logged in as a reviewer?
      </p>
    );
  }

  if (items === null) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-mist/60" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-3xl border border-mist bg-white/70 p-7 text-center text-sm text-ink-soft">
        Queue is clear — nothing waiting for review. 🎉
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {items.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onDone={(id) => setItems((list) => list?.filter((s) => s.id !== id) ?? null)}
        />
      ))}
    </div>
  );
}
