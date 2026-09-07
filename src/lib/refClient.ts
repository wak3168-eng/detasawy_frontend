import type { RefOption } from "@/lib/refTypes";

// When set (e.g. the Railway backend URL), ref requests leave Vercel entirely;
// unset, they hit the same-origin /api fallback routes.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

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
