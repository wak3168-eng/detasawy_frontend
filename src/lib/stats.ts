import { API_BASE } from "@/lib/apiBase";

export type LandingStat = {
  value: number;
  suffix: string;
  label: string;
};

export type TickerItem = {
  ps?: string;
  en: string;
};

export type LiveStats = {
  contributors: number;
  uniqueWords: number;
  words: number;
  voices: number;
  pictures: number;
  scenes: number;
  districts: number;
  tribes: number;
  languages: number;
  campaignsLive: number;
  topDistricts: { id: string; name: string; words: number }[];
  recent: { word: string; district?: string | null; tribe?: string | null }[];
};

/** One call behind everything the landing page shows. */
export async function getLiveStats(): Promise<LiveStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as LiveStats;
  } catch {
    return null;
  }
}

export function statsToStrip(live: LiveStats | null): LandingStat[] {
  return [
    { value: live?.uniqueWords ?? 0, suffix: "", label: "words collected" },
    { value: live?.voices ?? 0, suffix: "", label: "voices recorded" },
    { value: live?.contributors ?? 0, suffix: "", label: "contributors" },
    {
      value: (live?.pictures ?? 0) + (live?.scenes ?? 0),
      suffix: "",
      label: "pictures waiting",
    },
  ];
}

const FALLBACK_TICKER: TickerItem[] = [
  { ps: "څنګه يې؟", en: "“Singa ye?” — the question that starts it all" },
  { ps: "ښه يم", en: "“Kha yam” — Peshawar" },
  { ps: "ښه يوم", en: "“Kha yom” — Afridi, Khyber" },
  { en: "Every valley speaks its own Pashto. We are building for all of them." },
];

/** The newest words as they land, falling back to the founding lines. */
export function statsToTicker(live: LiveStats | null): TickerItem[] {
  const recent = (live?.recent ?? []).filter((r) => r.word);
  if (recent.length === 0) return FALLBACK_TICKER;
  return recent.map((r) => ({
    ps: r.word,
    en: [r.tribe, r.district].filter(Boolean).join(", ") || "just added",
  }));
}

/** Kept for callers that only want the four headline numbers. */
export async function getLandingStats(): Promise<LandingStat[]> {
  return statsToStrip(await getLiveStats());
}

export const TICKER_ITEMS = FALLBACK_TICKER;
