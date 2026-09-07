"use client";

import { useEffect, useState } from "react";
import { findSimilar, matchesQuery } from "@/lib/nameMatch";
import { fetchRef } from "@/lib/refClient";
import type { RefOption } from "@/lib/refTypes";

export default function StepSelect({
  endpoint,
  onPick,
  onCustom,
  onSkip,
  skipLabel,
  addLabel = "Can't find it? Add yours",
  emptyPlaceholder,
}: {
  endpoint: string;
  onPick: (option: RefOption) => void;
  onCustom?: (name: string) => void;
  onSkip?: () => void;
  skipLabel?: string;
  addLabel?: string;
  /** When the list is empty, show a free-text input with this placeholder. */
  emptyPlaceholder?: string;
}) {
  const [options, setOptions] = useState<RefOption[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState("");
  const [suggestion, setSuggestion] = useState<RefOption | null>(null);

  useEffect(() => {
    let alive = true;
    setOptions(null);
    setFailed(false);
    setQuery("");
    setAdding(false);
    setAddValue("");
    setSuggestion(null);
    fetchRef(endpoint).then(
      (data) => alive && setOptions(data),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [endpoint]);

  const submitCustom = () => {
    const value = addValue.trim();
    if (!value || !onCustom) return;
    const match = findSimilar(value, options ?? []);
    if (match) setSuggestion(match);
    else onCustom(value);
  };

  if (failed) {
    return (
      <button
        onClick={() => {
          setFailed(false);
          fetchRef(endpoint).then(setOptions, () => setFailed(true));
        }}
        className="w-full rounded-2xl border border-mist bg-white/70 py-4 text-sm font-bold text-azure-deep"
      >
        Couldn&apos;t load — tap to retry
      </button>
    );
  }

  if (options === null) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-mist/60" />
        ))}
      </div>
    );
  }

  if (options.length === 0 && emptyPlaceholder && onCustom) {
    return (
      <div className="space-y-3">
        <input
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          placeholder={emptyPlaceholder}
          className="w-full rounded-2xl border border-mist bg-white/70 px-5 py-4 text-sm outline-none transition-colors focus:border-azure"
        />
        <button
          onClick={() => addValue.trim() && onCustom(addValue.trim())}
          className="w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-40"
          disabled={!addValue.trim()}
        >
          Continue
        </button>
        {onSkip && skipLabel && (
          <button onClick={onSkip} className="w-full py-2 text-sm font-bold text-ink-soft">
            {skipLabel}
          </button>
        )}
      </div>
    );
  }

  if (suggestion) {
    return (
      <div className="rounded-2xl border border-sky bg-mist/40 p-5">
        <p className="text-sm font-bold">
          Did you mean{" "}
          <span className="text-azure-deep">{suggestion.name}</span>
          {suggestion.ps && (
            <span dir="rtl" lang="ps" className="ms-2 font-naskh">
              {suggestion.ps}
            </span>
          )}
          ?
        </p>
        <div className="mt-4 space-y-2">
          <button
            onClick={() => onPick(suggestion)}
            className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
          >
            Yes, that&apos;s it
          </button>
          <button
            onClick={() => {
              setSuggestion(null);
              onCustom?.(addValue.trim());
            }}
            className="w-full rounded-full border border-sky py-3 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
          >
            No, add &ldquo;{addValue.trim()}&rdquo;
          </button>
        </div>
      </div>
    );
  }

  const filtered = options.filter((o) => matchesQuery(o, query));

  return (
    <div className="flex h-full flex-col gap-3">
      {options.length > 6 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-2xl border border-mist bg-white/70 px-5 py-3.5 text-sm outline-none transition-colors focus:border-azure"
        />
      )}
      <div className="max-h-[46dvh] space-y-2 overflow-y-auto pr-1">
        {filtered.map((option) => (
          <button
            key={option.id}
            onClick={() => onPick(option)}
            className="flex w-full items-baseline justify-between rounded-2xl border border-mist bg-white/70 px-5 py-3.5 text-left transition-colors hover:border-azure"
          >
            <span className="text-sm font-bold">{option.name}</span>
            {option.ps && (
              <span dir="rtl" lang="ps" className="font-naskh text-sm text-ink-soft">
                {option.ps}
              </span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">
            No matches for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
      <div className="mt-auto space-y-1 pt-2">
        {onCustom &&
          (adding ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder="Type the name"
                className="min-w-0 flex-1 rounded-2xl border border-mist bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-azure"
              />
              <button
                onClick={submitCustom}
                disabled={!addValue.trim()}
                className="rounded-full bg-azure px-5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-40"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full py-2 text-sm font-bold text-azure-deep"
            >
              {addLabel}
            </button>
          ))}
        {onSkip && skipLabel && (
          <button onClick={onSkip} className="w-full py-2 text-sm font-bold text-ink-soft">
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
