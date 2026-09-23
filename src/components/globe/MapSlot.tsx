"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { LiveStats } from "@/lib/stats";

const GlobeSection = dynamic(() => import("./GlobeSection"), { ssr: false });

export default function MapSlot({ live }: { live: LiveStats | null }) {
  const slot = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!slot.current || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(slot.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={slot} className="min-h-[440px] sm:min-h-[520px]">
      {visible ? <GlobeSection live={live} /> : (
        <div className="min-h-[440px] rounded-[28px] border border-mist bg-[#eaf3f7] sm:min-h-[520px]" aria-hidden="true" />
      )}
    </div>
  );
}
