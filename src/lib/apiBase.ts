// The Django backend on Railway; NEXT_PUBLIC_API_BASE overrides it
// (e.g. a future api.detasawy.com).
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://detasawybackend-production.up.railway.app";
