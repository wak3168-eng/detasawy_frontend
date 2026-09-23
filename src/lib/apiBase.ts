// Browser requests stay same-origin for HttpOnly session cookies and media.
// BACKEND_URL is server-only; direct cross-origin browser auth is unsupported.
export const API_BASE = typeof window === "undefined"
  ? (process.env.BACKEND_URL ?? "https://detasawybackend-production.up.railway.app")
  : "";
