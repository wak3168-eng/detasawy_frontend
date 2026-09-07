"use client";

import { useEffect, useState } from "react";
import PashtoInput from "@/components/input/PashtoInput";
import VoiceRecorder from "@/components/input/VoiceRecorder";
import WordTable from "@/components/portal/WordTable";
import { getPrompts, submitContribution, type PromptItem } from "@/lib/api";

export default function NameItActivity({
  onClose,
  onProgress,
}: {
  onClose: () => void;
  onProgress: (todayCount: number) => void;
}) {
  const [prompts, setPrompts] = useState<PromptItem[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"answer" | "words">("answer");

  useEffect(() => {
    getPrompts("picture", 10).then(setPrompts, (err) =>
      setFailed(err instanceof Error ? err.message : "Couldn't load."),
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prompt = prompts?.[index];
  const finished = prompts !== null && index >= prompts.length;

  const submit = async () => {
    if (!prompt || !text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitContribution(prompt.id, text.trim(), audio);
      onProgress(result.todayCount);
      setPhase("words");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setText("");
    setAudio(null);
    setError(null);
    setPhase("answer");
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-3xl border border-mist bg-ice p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">Name it</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-ink-soft transition-colors hover:bg-mist"
          >
            ✕
          </button>
        </div>

        {failed && (
          <p className="py-10 text-center text-sm text-ink-soft">{failed}</p>
        )}
        {!failed && prompts === null && (
          <div className="mt-4 aspect-square animate-pulse rounded-2xl bg-mist/60" />
        )}
        {!failed && prompts !== null && prompts.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-soft">
            No pictures yet — the team is stocking up.
          </p>
        )}
        {finished && prompts.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-3xl">🙌</p>
            <p className="mt-2 font-extrabold">That&apos;s all for now.</p>
            <p className="mt-1 text-sm text-ink-soft">
              More pictures land soon.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-azure px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              Done
            </button>
          </div>
        )}

        {prompt && phase === "answer" && (
          <div className="mt-4 space-y-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prompt.mediaUrl}
              alt={prompt.captionEn ?? "prompt"}
              className="aspect-square w-full rounded-2xl border border-mist object-cover"
            />
            {prompt.captionEn && (
              <p className="text-center text-sm font-bold text-azure-deep">
                {prompt.captionEn}
              </p>
            )}
            <p className="text-center text-sm text-ink-soft">
              What do you call this?
            </p>
            <PashtoInput
              value={text}
              onChange={setText}
              placeholder="په پښتو ولیکئ"
            />
            <VoiceRecorder key={prompt.id} onAudio={setAudio} />
            <button
              disabled={busy || !text.trim()}
              onClick={submit}
              className="w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
            >
              {busy ? "Saving…" : "Submit"}
            </button>
            {error && (
              <p className="text-center text-xs font-semibold text-[#b4552d]">
                {error}
              </p>
            )}
          </div>
        )}

        {prompt && phase === "words" && (
          <div className="mt-4">
            <p className="text-center text-sm font-bold text-azure-deep">
              Saved ✓ — how Pashtunkhwa names it:
            </p>
            <div className="mt-4">
              <WordTable promptId={prompt.id} />
            </div>
            <button
              onClick={next}
              className="mt-5 w-full rounded-full bg-azure py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              {index + 1 < (prompts?.length ?? 0)
                ? "Next picture"
                : "Finish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
