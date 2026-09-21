// Browser requests use the same-origin proxy, including localhost previews.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  (typeof window === "undefined"
    ? (process.env.BACKEND_URL ??
      "https://detasawybackend-production.up.railway.app")
    : "");
