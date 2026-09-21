"use client";

import { useState } from "react";
import { actOnSuggestion, type StaffSuggestion } from "@/lib/api";
import { ErrorNotice, Loading, useAdminQuery } from "./AdminUI";
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
    action: "approve" | "keep" | "reject" | "merge",
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
      fetchRef(endpoint).then(setSiblings, () => {
        setError(
          "Could not load merge targets. Close and reopen the merge picker to retry.",
        );
        setMerging(false);
      });
    }
  };

  return (
    <div className="rounded-lg border border-mist bg-white/70 p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-lg font-extrabold">{suggestion.name}</p>
        <span className="rounded-md bg-mist px-2.5 py-0.5 text-[11px] font-bold text-azure-deep">
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
        {suggestion.live && (
          <span className="rounded-md bg-[#e6f2e6] px-2.5 py-0.5 text-[11px] font-bold text-[#3f7a3f]">
            live
          </span>
        )}
      </div>
      {suggestion.suggestedBy && (
        <p className="mt-1 text-xs text-ink-soft">
          by {suggestion.suggestedBy}
        </p>
      )}
      {suggestion.mergeIntoName && !merging && (
        <p className="mt-2 rounded-xl bg-[#f5ead8] px-3 py-2 text-xs font-semibold text-[#8a5a1f]">
          Looks like existing “{suggestion.mergeIntoName}” — merging keeps one
          spelling and remembers this one.
        </p>
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
                  <span
                    dir="rtl"
                    lang="ps"
                    className="ms-2 font-naskh text-ink-soft"
                  >
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
          {suggestion.mergeIntoId ? (
            <>
              <button
                disabled={busy}
                onClick={() => act("merge", suggestion.mergeIntoId!)}
                className="rounded-md bg-azure px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
              >
                Merge into {suggestion.mergeIntoName}
              </button>
              <button
                disabled={busy}
                onClick={() => act(suggestion.live ? "keep" : "approve")}
                className="rounded-md border border-sky px-5 py-2 text-sm font-bold text-azure-deep transition-colors hover:bg-mist disabled:opacity-50"
              >
                Keep as its own
              </button>
            </>
          ) : (
            <button
              disabled={busy}
              onClick={() => act(suggestion.live ? "keep" : "approve")}
              className="rounded-md bg-azure px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
            >
              {suggestion.live ? "Keep" : "Approve"}
            </button>
          )}
          {suggestion.kind === "tribe" && (
            <button
              disabled={busy}
              onClick={openMerge}
              className="rounded-md border border-sky px-5 py-2 text-sm font-bold text-azure-deep transition-colors hover:bg-mist disabled:opacity-50"
            >
              Merge…
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => act("reject")}
            className="rounded-md px-5 py-2 text-sm font-bold text-ink-soft transition-colors hover:bg-mist disabled:opacity-50"
          >
            {suggestion.live ? "Remove" : "Reject"}
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
  const { data, error, reload } = useAdminQuery<StaffSuggestion[]>(
    "/api/admin/suggestions?status=review",
  );
  if (error) return <ErrorNotice message={error} retry={reload} />;
  if (!data) return <Loading />;
  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-note">
          Up to 50 suggestions, most suggested first. Decisions apply to
          reference names, not dataset responses.
        </p>
        <button className="admin-button" onClick={reload}>
          Refresh queue
        </button>
      </div>
      {!data.length ? (
        <div className="admin-panel admin-empty">
          <h2 className="font-bold text-ink">
            No reference suggestions awaiting review
          </h2>
          <p>New suggestions will appear here as contributors submit them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onDone={reload}
            />
          ))}
        </div>
      )}
    </>
  );
}
