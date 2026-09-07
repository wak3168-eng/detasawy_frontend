import type { RefOption } from "@/lib/refTypes";

const CHAR_MAP: Record<string, string> = {
  "ك": "ک", // Arabic kaf
  "گ": "ګ", // Persian gaf -> Pashto gaf
  "ي": "ی", // Arabic ya
  "ى": "ی", // alef maksura
  "ة": "ه", // ta marbuta
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

// Transliteration families of the generic lineage suffixes. Spellings within
// a family are the same word; Khel and Zai are NOT interchangeable.
const SUFFIX_FAMILIES: Record<string, string> = {
  khel: "khel", khail: "khel", kheil: "khel", khell: "khel",
  zai: "zai", zay: "zai", zi: "zai", zey: "zai",
};

function splitSuffix(normalized: string): { head: string; family: string } {
  const parts = normalized.split(" ");
  const family = parts.length > 1 ? SUFFIX_FAMILIES[parts[parts.length - 1]] : undefined;
  if (family) {
    return { head: parts.slice(0, -1).join(" "), family };
  }
  return { head: normalized, family: "" };
}

function compatible(a: { family: string }, b: { family: string }): boolean {
  return a.family === b.family || !a.family || !b.family;
}

export function matchesQuery(option: RefOption, query: string): boolean {
  const q = normalizeName(query);
  if (!q) return true;
  const qs = splitSuffix(q);
  const names = [option.name, option.ps ?? "", ...(option.aliases ?? [])];
  return names.some((name) => {
    const n = normalizeName(name);
    if (n.includes(q)) return true;
    const ns = splitSuffix(n);
    return compatible(ns, qs) && ns.head.includes(qs.head);
  });
}

/** Finds an existing option the input likely duplicates (exact or near spelling). */
export function findSimilar(
  input: string,
  options: RefOption[],
): RefOption | null {
  const q = normalizeName(input);
  if (!q) return null;
  const qs = splitSuffix(q);
  const best: { current: { option: RefOption; distance: number } | null } = {
    current: null,
  };
  const consider = (option: RefOption, a: string, b: string): boolean => {
    if (a === b) return true;
    const distance = levenshtein(a, b);
    const limit = b.length <= 4 ? 1 : 2;
    if (distance <= limit && (!best.current || distance < best.current.distance)) {
      best.current = { option, distance };
    }
    return false;
  };
  for (const option of options) {
    const names = [option.name, option.ps ?? "", ...(option.aliases ?? [])];
    for (const name of names) {
      const n = normalizeName(name);
      if (!n) continue;
      if (consider(option, n, q)) return option;
      const ns = splitSuffix(n);
      if (compatible(ns, qs) && (ns.family || qs.family)) {
        if (consider(option, ns.head, qs.head)) return option;
      }
    }
  }
  return best.current?.option ?? null;
}
