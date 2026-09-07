import type { RefOption } from "@/lib/refTypes";

// The Django backend on Railway serves all reference data;
// NEXT_PUBLIC_API_BASE overrides it (e.g. a future api.detasawy.com).
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://detasawybackend-production.up.railway.app";

const cache = new Map<string, Promise<RefOption[]>>();

export function fetchRef(path: string): Promise<RefOption[]> {
  if (!cache.has(path)) {
    const promise = fetch(`${API_BASE}${path}`)
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
