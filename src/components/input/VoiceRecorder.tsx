"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "requesting" | "recording" | "recorded" | "unavailable";

export default function VoiceRecorder({
  onAudio,
  required = false,
}: {
  onAudio: (audio: Blob | null) => void;
  required?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrl = useRef<string | null>(null);
  const mounted = useRef(false);
  const starting = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearInterval(timer.current);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const rec = recorder.current;
      if (rec) {
        rec.onstop = null;
        rec.ondataavailable = null;
        if (rec.state !== "inactive") rec.stop();
        rec.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const start = async () => {
    if (starting.current) return;
    starting.current = true;
    setPhase("requesting");
    let stream: MediaStream | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      chunks.current = [];
      const rec = new MediaRecorder(stream);
      recorder.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        rec.stream.getTracks().forEach((t) => t.stop());
        if (timer.current) clearInterval(timer.current);
        const blob = new Blob(chunks.current, {
          type: rec.mimeType || "audio/webm",
        });
        if (!blob.size) {
          onAudio(null);
          setPhase("unavailable");
          return;
        }
        objectUrl.current = URL.createObjectURL(blob);
        setUrl(objectUrl.current);
        onAudio(blob);
        setPhase("recorded");
      };
      rec.start();
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setPhase("recording");
    } catch {
      stream?.getTracks().forEach((t) => t.stop());
      if (mounted.current) {
        setPhase("unavailable");
        onAudio(null);
      }
    } finally {
      starting.current = false;
    }
  };

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
  };

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    objectUrl.current = null;
    setUrl(null);
    onAudio(null);
    setPhase("idle");
  };

  if (phase === "unavailable") {
    return (
      <div className="space-y-2 text-center text-xs text-ink-soft" role="status">
        <p>
          {required
            ? "Recording unavailable. Allow microphone access and retry, or skip this scene."
            : "Recording unavailable. Retry, or submit your text without voice."}
        </p>
        <button type="button" onClick={start} className="rounded-full border border-sky px-4 py-2 font-bold text-azure-deep">
          Retry microphone
        </button>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <button
        type="button"
        onClick={stop}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#c0563a] bg-[#c0563a]/10 py-3 text-sm font-bold text-[#c0563a]"
      >
        <span className="dot-pulse size-2.5 rounded-full bg-[#c0563a]" />
        Recording {seconds}s — tap to stop
      </button>
    );
  }

  if (phase === "recorded" && url) {
    return (
      <div className="flex items-center gap-2">
        <audio controls src={url} className="h-10 min-w-0 flex-1" />
        <button
          type="button"
          onClick={reset}
          className="shrink-0 rounded-full border border-sky px-4 py-2 text-xs font-bold text-azure-deep transition-colors hover:bg-mist"
        >
          Re-record
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={phase === "requesting"}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-sky bg-mist/40 py-3 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
      {phase === "requesting"
        ? "Waiting for microphone…"
        : required ? "Record your answer — required" : "Say it aloud — optional"}
    </button>
  );
}
