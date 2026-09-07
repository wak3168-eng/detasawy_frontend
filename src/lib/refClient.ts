import type { RefOption } from "@/lib/refTypes";

const cache = new Map<string, Promise<RefOption[]>>();

export function fetchRef(path: string): Promise<RefOption[]> {
  if (!cache.has(path)) {
    const promise = fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`ref fetch failed: ${res.status}`);
        return res.json() as Promise<RefOption[]>;
      })
      .catch((error) => {
        cache.delete(path);
        throw error;
      });
    cache.set(path, promise);
  }
  return cache.get(path)!;
}
