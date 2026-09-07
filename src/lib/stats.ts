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
 * Pre-launch these are mission numbers, not live counts. Once the Django
 * backend ships its cached public stats endpoint, this function swaps to
 * fetching it and the landing page becomes live without UI changes.
 */
export async function getLandingStats(): Promise<LandingStat[]> {
  return [
    { value: 40, suffix: "M+", label: "Pashto speakers worldwide" },
    { value: 100, suffix: "+", label: "districts & provinces to cover" },
    { value: 7, suffix: "", label: "open datasets planned" },
    { value: 11, suffix: "", label: "ways to contribute" },
  ];
}

export const TICKER_ITEMS: TickerItem[] = [
  { ps: "څنګه يې؟", en: "“Singa ye?” — the question that starts it all" },
  { ps: "ښه يم", en: "“Kha yam” — Peshawar" },
  { ps: "ښه يوم", en: "“Kha yom” — Afridi, Khyber" },
  { en: "Every valley speaks its own Pashto. We are building for all of them." },
];
