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

/**
 * Live counts from the community, with mission numbers standing in for
 * dimensions the data does not measure yet (speaker population).
 */
export async function getLandingStats(): Promise<LandingStat[]> {
  let live: {
    contributors: number;
    uniqueWords: number;
    pictures: number;
    districts: number;
  } | null = null;
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (res.ok) live = await res.json();
  } catch {
    live = null;
  }
  return [
    { value: live?.uniqueWords ?? 0, suffix: "", label: "words collected" },
    { value: live?.contributors ?? 0, suffix: "", label: "contributors" },
    { value: live?.pictures ?? 0, suffix: "", label: "pictures to name" },
    { value: 40, suffix: "M+", label: "Pashto speakers worldwide" },
  ];
}

export const TICKER_ITEMS: TickerItem[] = [
  { ps: "څنګه يې؟", en: "“Singa ye?” — the question that starts it all" },
  { ps: "ښه يم", en: "“Kha yam” — Peshawar" },
  { ps: "ښه يوم", en: "“Kha yom” — Afridi, Khyber" },
  { en: "Every valley speaks its own Pashto. We are building for all of them." },
];
