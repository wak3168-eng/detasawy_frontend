"use client";

import { useEffect, useRef, useState } from "react";
import type { LandingStat, TickerItem } from "@/lib/stats";

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();
        if (reduced) {
          setDisplay(value);
          return;
        }
        const startAt = performance.now();
        const duration = 1300;
        const tick = (now: number) => {
          const p = Math.min((now - startAt) / duration, 1);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function Ticker({ items }: { items: TickerItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, 350);
    }, 3400);
    return () => clearInterval(cycle);
  }, [items.length]);

  const item = items[index];

  return (
    <p
      className={`text-center text-sm text-ink-soft transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {item.ps && (
        <>
          <span
            dir="rtl"
            lang="ps"
            className="font-naskh text-base font-bold text-azure-deep"
          >
            {item.ps}
          </span>
          <span className="mx-2 text-sky">·</span>
        </>
      )}
      <span>{item.en}</span>
    </p>
  );
}

export default function StatsStrip({
  stats,
  ticker,
}: {
  stats: LandingStat[];
  ticker: TickerItem[];
}) {
  return (
    <section className="border-y border-mist bg-white/40">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-3xl font-extrabold text-azure-deep sm:text-4xl">
                <StatValue value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="mt-1.5 text-xs font-semibold text-ink-soft">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
        <div className="mt-8 border-t border-mist pt-6">
          <Ticker items={ticker} />
        </div>
      </div>
    </section>
  );
}
