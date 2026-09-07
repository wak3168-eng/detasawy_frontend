"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Speaker button that reads the question aloud in Pashto. Renders only when
 * the audio file actually exists, so steps work fine before clips are uploaded.
 */
export default function PlayQuestion({ src }: { src: string }) {
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    setAvailable(false);
    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (alive && res.ok) setAvailable(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src]);

  if (!available) return null;

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      void audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Play question in Pashto"
      className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors ${
        playing
          ? "border-azure bg-azure text-white"
          : "border-sky bg-mist/60 text-azure-deep hover:bg-mist"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
