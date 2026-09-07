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

## Conventions

- **Modular** — every feature is decomposed into components; no single-file pages.
- **Mobile-first** — verify at ~375px before shipping.
- **Minimalist writing** — short, plain copy everywhere.
- **Theme** — `#F7FBFC` ice · `#D6E6F2` mist · `#B9D7EA` sky · `#769FCD` azure (+ derived ink/deep shades for contrast), defined once in `globals.css` and `lib/theme.ts`.
