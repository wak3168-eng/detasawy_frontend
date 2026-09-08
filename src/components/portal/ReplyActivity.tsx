"use client";

import { useEffect, useState } from "react";
import PashtoInput from "@/components/input/PashtoInput";
import VoiceRecorder from "@/components/input/VoiceRecorder";
import { getPrompts, submitContribution, type PromptItem } from "@/lib/api";

export default function ReplyActivity({
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
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPrompts("scene", 2).then(setPrompts, (err) =>
      setFailed(err instanceof Error ? err.message : "Couldn't load."),
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const prompt = prompts?.[index];
  const total = prompts?.length ?? 0;
  const finished = prompts !== null && index >= total;

  const next = () => {
    setIndex((i) => i + 1);
    setText("");
    setAudio(null);
    setWriting(false);
    setError(null);
  };

  const submit = async () => {
    if (!prompt || !audio) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitContribution(prompt.id, text.trim(), audio);
      onProgress(result.todayCount);
      next();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ice">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-mist text-ink-soft transition-colors hover:bg-mist"
          >
            ✕
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-azure transition-all duration-500"
              style={{ width: `${total ? (index / total) * 100 : 0}%` }}
            />
          </div>
          {total > 0 && !finished && (
            <span className="shrink-0 text-xs font-bold text-ink-soft">
              {index + 1}/{total}
            </span>
          )}
        </div>

        {failed && (
          <p className="my-auto py-16 text-center text-sm text-ink-soft">
            {failed}
          </p>
        )}
        {!failed && prompts === null && (
          <div className="mt-8 h-[36dvh] animate-pulse rounded-3xl bg-mist/60" />
        )}
        {!failed && prompts !== null && total === 0 && (
          <p className="my-auto py-16 text-center text-sm text-ink-soft">
            No scenes yet — the team is adding them.
          </p>
        )}

        {finished && total > 0 && (
          <div className="my-auto py-10 text-center">
            <p className="text-4xl">🎙</p>
            <p className="mt-3 text-xl font-extrabold">Thank you.</p>
            <p className="mt-1.5 text-sm text-ink-soft">
              Your voice is part of the record now.
            </p>
            <button
              onClick={onClose}
              className="mt-7 rounded-full bg-azure px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-azure-deep"
            >
              Done
            </button>
          </div>
        )}

        {prompt && (
          <div className="mt-4 flex flex-1 flex-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prompt.mediaUrl}
              alt={prompt.captionEn ?? "scene"}
              className="h-[30dvh] min-h-40 w-full rounded-3xl border border-mist bg-white object-contain p-2"
            />
            <div className="mt-3">
              <h1 className="text-xl font-extrabold tracking-tight">
                {prompt.captionEn ?? "What is happening here?"}
              </h1>
              <p className="mt-0.5 text-sm text-ink-soft">
                Say what you see, in your own dialect.
              </p>
            </div>

            <div className="mt-4">
              <VoiceRecorder key={prompt.id} onAudio={setAudio} />
            </div>

            <div className="mt-3">
              {writing ? (
                <PashtoInput
                  value={text}
                  onChange={setText}
                  placeholder="په پښتو ولیکئ (اختیاري)"
                />
              ) : (
                <button
                  onClick={() => setWriting(true)}
                  className="w-full py-2 text-center text-sm font-bold text-azure-deep"
                >
                  Write it down too — optional
                </button>
              )}
            </div>

            <div className="mt-auto pt-4">
              <button
                disabled={busy || !audio}
                onClick={submit}
                className="w-full rounded-full bg-azure py-3.5 text-sm font-bold text-white transition-colors hover:bg-azure-deep disabled:opacity-50"
              >
                {busy ? "Saving…" : audio ? "Submit" : "Record to continue"}
              </button>
              <button
                onClick={next}
                className="mt-2.5 w-full py-2 text-center text-sm font-semibold text-ink-soft transition-colors hover:text-azure-deep"
              >
                Skip this one
              </button>
              {error && (
                <p className="text-center text-xs font-semibold text-[#b4552d]">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
