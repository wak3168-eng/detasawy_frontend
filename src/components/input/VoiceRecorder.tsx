"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "recording" | "recorded" | "unavailable";

export default function VoiceRecorder({
  onAudio,
}: {
  onAudio: (audio: Blob | null) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      if (url) URL.revokeObjectURL(url);
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const rec = new MediaRecorder(stream);
      recorder.current = rec;
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, {
          type: rec.mimeType || "audio/webm",
        });
        setUrl(URL.createObjectURL(blob));
        onAudio(blob);
        setPhase("recorded");
      };
      rec.start();
      setSeconds(0);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      setPhase("recording");
    } catch {
      setPhase("unavailable");
      onAudio(null);
    }
  };

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    recorder.current?.stop();
  };

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    onAudio(null);
    setPhase("idle");
  };

  if (phase === "unavailable") {
    return (
      <p className="text-center text-xs text-ink-soft">
        Mic unavailable — you can submit without voice.
      </p>
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
      className="flex w-full items-center justify-center gap-2.5 rounded-full border border-sky bg-mist/40 py-3 text-sm font-bold text-azure-deep transition-colors hover:bg-mist"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
      Say it aloud — optional
    </button>
  );
}
