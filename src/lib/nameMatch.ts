import type { RefOption } from "@/lib/refTypes";

const CHAR_MAP: Record<string, string> = {
  "ك": "ک", // ك -> ک
  "ي": "ی", // ي -> ی
  "ى": "ی", // ى -> ی
  "ة": "ه", // ة -> ه
};

export function normalizeName(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[​-‏ـ]/g, "")
    .split("")
    .map((c) => CHAR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/[\s-]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dist = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j < cols; j++) dist[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dist[i][j] = Math.min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dist[rows - 1][cols - 1];
}

export function matchesQuery(option: RefOption, query: string): boolean {
  const q = normalizeName(query);
  if (!q) return true;
  const names = [option.name, option.ps ?? "", ...(option.aliases ?? [])];
  return names.some((n) => normalizeName(n).includes(q));
}

/** Finds an existing option the input likely duplicates (exact or near spelling). */
export function findSimilar(
  input: string,
  options: RefOption[],
): RefOption | null {
  const q = normalizeName(input);
  if (!q) return null;
  let best: { option: RefOption; distance: number } | null = null;
  for (const option of options) {
    const names = [option.name, option.ps ?? "", ...(option.aliases ?? [])];
    for (const name of names) {
      const n = normalizeName(name);
      if (!n) continue;
      if (n === q) return option;
      const distance = levenshtein(n, q);
      const limit = q.length <= 4 ? 1 : 2;
      if (distance <= limit && (!best || distance < best.distance)) {
        best = { option, distance };
      }
    }
  }
  return best?.option ?? null;
}
