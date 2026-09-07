"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import MapFallback from "@/components/globe/MapFallback";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => <MapFallback />,
});

function canRun3D(): boolean {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return false;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (memory !== undefined && memory <= 2) return false;
  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
  );
}

export default function GlobeSection() {
  const [mode, setMode] = useState<"pending" | "globe" | "fallback">("pending");

  useEffect(() => {
    try {
      setMode(canRun3D() ? "globe" : "fallback");
    } catch {
      setMode("fallback");
    }
  }, []);

  if (mode === "globe") return <Globe />;
  return <MapFallback />;
}
