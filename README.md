# Detasawy — Frontend

Next.js frontend for Detasawy, the community-built data portal for the Pashto language. Currently the pre-launch landing page: a 3D globe of the Pashtun belt (with a lightweight 2D fallback for low-end devices), mission stats, and a rotating dialect ticker.

## Stack

Next.js (App Router, TypeScript, Tailwind v4), react-three-fiber for the globe, Nunito Sans + Noto Naskh Arabic via `next/font`. Deployed on Vercel.

## Structure

```
src/
  app/            layout, page, global theme tokens
  components/
    layout/       Header, Footer
    hero/         Hero
    globe/        GlobeSection (capability gate) → Globe (3D) | MapFallback (2D)
    stats/        StatsStrip (counters + ticker)
    sections/     HowItWorks, Mission
  lib/            theme palette, region coordinates, stats provider
```

`lib/stats.ts` serves mission numbers today; it swaps to the Django backend's cached stats endpoint when the backend ships, making the landing page live without UI changes.

## Run locally

```
npm install
npm run dev
```

For the local backend, set `BACKEND_URL=http://127.0.0.1:8000` before starting Next.js and run Django with `DEBUG=true`.

## Authentication deployment

Browser API and private-media requests use the same-origin `/api/*` rewrite. Set server-side `BACKEND_URL` to the matching backend; `NEXT_PUBLIC_API_BASE` is no longer used. Authentication uses expiring HttpOnly cookies and CSRF headers, with no bearer tokens in localStorage. Stored user metadata is only a display hint; the backend authorizes requests.

Deploy this session migration together with the matching backend and its `identity.0004_ratelimitbucket` migration. Users must log in again. Before rollout, complete the backend `SECURITY.md` configuration, storage and proxy checks, then verify login, authenticated media and logout through the production frontend domain. Never cache authenticated API or private-media responses.

## Conventions

- **Modular** — every feature is decomposed into components; no single-file pages.
- **Mobile-first** — verify at ~375px before shipping.
- **Minimalist writing** — short, plain copy everywhere.
- **Theme** — `#F7FBFC` ice · `#D6E6F2` mist · `#B9D7EA` sky · `#769FCD` azure (+ derived ink/deep shades for contrast), defined once in `globals.css` and `lib/theme.ts`.
## Dataset explorer
The admin dataset explorer groups collected responses by geography and self-reported community. Open a group to see answered pictures, the most common name, and every submitted alternative. The complete collection also includes pictures awaiting responses.
