"use client";

import { useEffect, useState } from "react";
import { getPrompts, type PromptItem } from "@/lib/api";

export default function PromptPreview({
  title,
  kind,
  onClose,
}: {
  title: string;
  kind: "picture" | "voice";
  onClose: () => void;
}) {
  const [items, setItems] = useState<PromptItem[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getPrompts(kind, 5).then(setItems, (error) =>
      setFailed(error instanceof Error ? error.message : "Couldn't load."),
    );
  }, [kind]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const item = items?.[index % Math.max(items.length, 1)];

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-mist bg-ice p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          {failed && (
            <p className="py-10 text-center text-sm text-ink-soft">{failed}</p>
          )}
          {!failed && items === null && (
            <div className="aspect-square animate-pulse rounded-2xl bg-mist/60" />
          )}
          {!failed && items !== null && items.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-soft">
              No prompts yet — the team is stocking up.
            </p>
          )}
          {item && item.kind === "picture" && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.mediaUrl}
                alt={item.captionEn ?? "prompt"}
                className="aspect-square w-full rounded-2xl border border-mist object-cover"
              />
              {item.captionEn && (
                <p className="mt-3 text-center text-sm font-bold text-azure-deep">
                  {item.captionEn}
                </p>
              )}
            </>
          )}
          {item && item.kind === "voice" && (
            <div className="rounded-2xl border border-mist bg-white/70 p-4">
              <audio controls src={item.mediaUrl} className="w-full" />
              {item.captionPs && (
                <p
                  dir="rtl"
                  lang="ps"
                  className="mt-3 text-center font-naskh text-lg font-bold"
                >
                  {item.captionPs}
                </p>
              )}
            </div>
          )}
        </div>

        {items !== null && items.length > 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="mt-4 w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
          >
            Next
          </button>
        )}
        <p className="mt-3 text-center text-xs text-ink-soft">
          A taste of what&apos;s coming in this activity.
        </p>
      </div>
    </div>
  );
}
