# Detasawy — Frontend

Public under-construction page for Detasawy. Every route serves the placeholder page in `public/index.html`, with `Cache-Control: no-store` so nothing stays cached once the real site ships.

## Conventions

Everything user-facing in Detasawy must be mobile friendly: responsive layout, no horizontal scrolling, safe-area aware, and checked at phone width (~375px) before shipping.

## Run locally

```
npm install
npm start
```

Serves on `http://localhost:3000` (or whatever `PORT` is set to). `server.js` is for local development only — Vercel doesn't use it.

## Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → import this repo.
2. Framework preset: **Other**, no build command — the defaults work. Vercel serves `public/` as the static output automatically.
3. Deploy. `vercel.json` rewrites every path to the page and disables caching.

Point the forwarding proxy at this deployment's URL.
