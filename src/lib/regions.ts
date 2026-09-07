export type Region = {
  name: string;
  ps?: string;
  lat: number;
  lon: number;
  /** Percent coordinates for the 2D fallback map. */
  fx: number;
  fy: number;
  diaspora?: boolean;
};

export const REGIONS: Region[] = [
  { name: "Peshawar", ps: "پېښور", lat: 34.01, lon: 71.55, fx: 69, fy: 31 },
  { name: "Khyber", ps: "خيبر", lat: 33.9, lon: 71.1, fx: 67, fy: 32 },
  { name: "Swat", ps: "سوات", lat: 34.77, lon: 72.36, fx: 73, fy: 27 },
  { name: "Kabul", ps: "کابل", lat: 34.55, lon: 69.21, fx: 58, fy: 28 },
  { name: "Jalalabad", ps: "جلال‌اباد", lat: 34.43, lon: 70.45, fx: 64, fy: 29 },
  { name: "Kandahar", ps: "کندهار", lat: 31.62, lon: 65.72, fx: 42, fy: 44 },
  { name: "Quetta", ps: "کوټه", lat: 30.18, lon: 66.99, fx: 48, fy: 52 },
  { name: "Khost", ps: "خوست", lat: 33.34, lon: 69.92, fx: 61, fy: 35 },
  { name: "Bannu", ps: "بنو", lat: 32.99, lon: 70.6, fx: 64, fy: 37 },
  { name: "D.I. Khan", lat: 31.83, lon: 70.9, fx: 66, fy: 43 },
  { name: "Kunduz", ps: "کندز", lat: 36.73, lon: 68.87, fx: 56, fy: 16 },
  { name: "Helmand", ps: "هلمند", lat: 31.58, lon: 64.37, fx: 35, fy: 44 },
  { name: "Karachi", ps: "کراچۍ", lat: 24.86, lon: 67.01, fx: 48, fy: 80 },
  { name: "Dubai", lat: 25.2, lon: 55.27, fx: 0, fy: 0, diaspora: true },
  { name: "Jeddah", lat: 21.49, lon: 39.19, fx: 0, fy: 0, diaspora: true },
  { name: "London", lat: 51.51, lon: -0.13, fx: 0, fy: 0, diaspora: true },
  { name: "Frankfurt", lat: 50.11, lon: 8.68, fx: 0, fy: 0, diaspora: true },
  { name: "Toronto", lat: 43.65, lon: -79.38, fx: 0, fy: 0, diaspora: true },
  { name: "Sydney", lat: -33.87, lon: 151.21, fx: 0, fy: 0, diaspora: true },
];

export const HOMELAND = REGIONS.filter((r) => !r.diaspora);
export const DIASPORA = REGIONS.filter((r) => r.diaspora);

/** Arcs drawn on the globe from the homeland out to the diaspora. */
export const DIASPORA_LINKS: Array<[Region, Region]> = DIASPORA.map((d, i) => [
  i % 2 === 0 ? REGIONS[0] : REGIONS[5],
  d,
]);
