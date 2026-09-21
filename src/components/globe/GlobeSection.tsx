"use client";

import { useState } from "react";
import Link from "next/link";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FeatureCollection, Geometry, Position } from "geojson";
import atlas from "world-atlas/countries-110m.json";
import { HOMELAND } from "@/lib/regions";
import type { LiveStats } from "@/lib/stats";

const topology = atlas as unknown as Topology<{ countries: GeometryCollection }>;
const countries = (feature(topology, topology.objects.countries) as FeatureCollection<Geometry>).features;
const format = (n: number) => n.toLocaleString("en-US");
const key = (name: string) => name.toLowerCase().replace(/[^a-z]/g, "");
// Approximate reference points, never contributor locations.
// Charsadda: https://www.getty.edu/vow/TGNFullDisplay?subjectid=7002459&english=Y
// Bajaur: https://pdma.gov.pk/public/storage/downloads/files/mFWsNfzv6xUeXwHmFimCXSynZBUj8kgcbe1VrP2o.pdf
const mapPlaces = [
  ...HOMELAND,
  { name: "Charsadda", lat: 34.144, lon: 71.7317, ps: "", fx: 0, fy: 0 },
  { name: "Bajaur", lat: 34.8569, lon: 71.4299, ps: "", fx: 0, fy: 0 },
];

export default function GlobeSection({ live }: { live: LiveStats | null }) {
  const [world, setWorld] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nearbyNames, setNearbyNames] = useState<string[]>([]);
  const districts = live?.topDistricts ?? [];
  const selected = selectedName ?? districts[0]?.name ?? "Peshawar";
  const selectedData = districts.find((d) => key(d.name) === key(selected));
  const selectedRegion = mapPlaces.find((r) => key(r.name) === key(selected));
  const words = (live?.recent ?? []).filter((w) => w.district && key(w.district) === key(selected));
  const center = zoom > 1 && selectedRegion ? selectedRegion : { lon: 68.5, lat: 32.5 };
  const project = ([lon, lat]: Position) => world
    ? [(lon + 180) / 360 * 600, (85 - lat) / 170 * 360]
    : [300 + (lon - center.lon) * 25 * zoom, 180 - (lat - center.lat) * 25 * zoom];
  const ring = (points: Position[]) => points.map((p, i) => {
    const [x, y] = project(p);
    return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + "Z";
  const path = (geometry: Geometry) => geometry.type === "Polygon"
    ? geometry.coordinates.map(ring).join(" ")
    : geometry.type === "MultiPolygon" ? geometry.coordinates.flatMap((p) => p.map(ring)).join(" ") : "";
  const locations = mapPlaces.map((region) => ({
    ...region,
    data: districts.find((d) => key(d.name) === key(region.name)),
    point: project([region.lon, region.lat]),
  })).filter(({ point: [x, y] }) => x > 15 && x < 585 && y > 15 && y < 345);
  const clusters: { x: number; y: number; places: typeof locations }[] = [];
  for (const location of locations) {
    const [x, y] = location.point;
    const nearby = clusters.find((c) => Math.hypot(c.x - x, c.y - y) < 30);
    if (nearby) nearby.places.push(location);
    else clusters.push({ x, y, places: [location] });
  }
  const chooseCluster = (places: typeof locations) => {
    setSelectedName((places.find((p) => p.data) ?? places[0]).name);
    setNearbyNames(places.length > 1 ? places.map((p) => p.name) : []);
    if (places.length > 1) { setWorld(false); setZoom((z) => Math.min(z + .75, 3)); }
  };
  const listed = districts.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section aria-label="Explore contribution origins" className="overflow-hidden rounded-[28px] border border-mist bg-white shadow-[0_16px_60px_-30px_#4a79ac66]">
      <div className="px-5 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-azure-deep">The language, on the map</p>
          <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-ink-soft"><span className={`size-1.5 rounded-full ${live ? "bg-emerald-600" : "bg-slate-400"}`} />{live ? "Latest counts" : "Data unavailable"}</span>
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Every place has a voice.</h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">Explore contributions by speakers’ reported origin.</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-full bg-ice p-1 ring-1 ring-mist" aria-label="Map view">
            {[false, true].map((isWorld) => <button key={String(isWorld)} aria-pressed={world === isWorld} onClick={() => { setWorld(isWorld); setZoom(1); }} className={`min-h-9 rounded-full px-3.5 text-xs font-bold transition-colors ${world === isWorld ? "bg-ink text-white shadow-sm" : "text-ink-soft hover:bg-mist"}`}>{isWorld ? "World" : "Afghanistan & Pakistan"}</button>)}
          </div>
          <span className="text-[11px] font-bold text-ink-soft">Contributions</span>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden border-y border-mist bg-[#eaf3f7]">
        <svg viewBox="0 0 600 360" className="block w-full" aria-label={world ? "World map of available origin locations" : "Regional map of Afghanistan and Pakistan"}>
          <defs><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#d9e7ee" strokeWidth="0.7" /></pattern></defs>
          <rect width="600" height="360" fill="url(#map-grid)" />
          {countries.map((country, index) => <path key={country.id ?? index} d={path(country.geometry)} fill={["004", "586"].includes(String(country.id).padStart(3, "0")) ? "#d1e3e5" : "#f6f8f5"} stroke="#afc6cd" strokeWidth="1" fillRule="evenodd" />)}
          {!world && <g fill="#627f87" className="text-[15px] sm:text-[11px]" fontWeight="700" letterSpacing="2" aria-hidden="true">
            <text x={project([64.3, 35.7])[0]} y={project([64.3, 35.7])[1]} textAnchor="middle">AFGHANISTAN</text>
            <text x={project([70.4, 28.4])[0]} y={project([70.4, 28.4])[1]} textAnchor="middle">PAKISTAN</text>
            <text x={project([59.4, 29.8])[0]} y={project([59.4, 29.8])[1]} textAnchor="middle">IRAN</text>
            <text x={project([77, 29])[0]} y={project([77, 29])[1]} textAnchor="middle">INDIA</text>
          </g>}
          {clusters.map((cluster, index) => {
            const count = cluster.places.reduce((sum, p) => sum + (p.data?.words ?? 0), 0);
            const active = cluster.places.some((p) => key(p.name) === key(selected));
            const grouped = cluster.places.length > 1;
            const label = grouped ? `${cluster.places.length} locations` : cluster.places[0].name;
            return <g key={cluster.places[0].name} transform={`translate(${cluster.x},${cluster.y})`}>
              {active && <circle r="20" fill="#2873a4" opacity=".15" />}
              <circle r={grouped ? 13 : 7} fill={count > 0 ? "#22638e" : "#fff"} stroke={active ? "#133d60" : "#4d829c"} strokeWidth={active ? "3" : "2"} />
              {grouped && <text textAnchor="middle" y="4" fontSize="11" fill={count > 0 ? "white" : "#22638e"} fontWeight="800">{cluster.places.length}</text>}
              {!grouped && <text textAnchor="middle" y={index % 2 ? -14 : 22} fill="#21475d" className="text-[16px] sm:text-[12px]" fontWeight="700" paintOrder="stroke" stroke="#f7fbfc" strokeWidth="3" strokeLinejoin="round">{label}</text>}
              <circle r="22" fill="transparent" role="button" tabIndex={0} aria-label={`${label}${count ? `, ${format(count)} contributions` : ", reference location"}`} className="cursor-pointer focus:outline-2 focus:outline-azure-deep" onClick={() => chooseCluster(cluster.places)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chooseCluster(cluster.places); } }}><title>{cluster.places.map((p) => p.name).join(", ")}</title></circle>
            </g>;
          })}
        </svg>
        <div className="absolute bottom-3 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-ink-soft shadow-sm">{world ? "Origin coverage" : "Tap a place to explore"}</div>
        {!world && <div className="absolute bottom-3 right-3 flex overflow-hidden rounded-xl border border-mist bg-white shadow-sm">
          <button aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom((z) => Math.max(1, z - .75))} className="size-10 text-lg font-bold disabled:opacity-30">−</button>
          <button aria-label="Reset map" onClick={() => setZoom(1)} className="px-2 text-[10px] font-bold">{zoom === 1 ? "Reset" : `${zoom}×`}</button>
          <button aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, z + .75))} className="size-10 text-lg font-bold disabled:opacity-30">+</button>
        </div>}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-3 text-[10px] font-semibold text-ink-soft">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#22638e]" />Reported contributions</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-[#4d829c]" />Reference location</span>
        <span>Numbered markers group nearby places</span>
      </div>

      {nearbyNames.length > 1 && <div className="mx-4 mb-3 flex flex-wrap items-center gap-1.5" aria-label="Nearby places">
        <span className="mr-1 text-xs text-ink-soft">Nearby:</span>
        {nearbyNames.map((name) => <button key={name} onClick={() => setSelectedName(name)} aria-pressed={selected === name} className={`min-h-10 rounded-full border border-mist px-3 text-xs font-bold ${selected === name ? "bg-ink text-white" : "bg-ice text-ink"}`}>{name}</button>)}
      </div>}

      <div className="mx-4 rounded-2xl border border-mist bg-ice p-4" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-ink-soft">Selected origin</p><h3 className="mt-1 text-lg font-extrabold">{selected} {selectedRegion?.ps && <span lang="ps" dir="rtl" className="ml-2 font-naskh font-normal text-ink-soft">{selectedRegion.ps}</span>}</h3></div>
          <div className="text-right"><p className="text-2xl font-extrabold text-azure-deep">{selectedData ? format(selectedData.words) : "—"}</p><p className="text-[10px] text-ink-soft">contributions</p></div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">{!live ? "Counts could not be loaded. You can still explore the map." : !selectedData ? "Not listed in the current top-district summary. This does not mean zero contributions." : !selectedRegion ? "Included in the district totals. A map position is not available yet." : "Every answer helps document how Pashto is spoken here."}</p>
        {words.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{words.slice(0, 3).map((w, i) => <span key={i} dir="rtl" lang="ps" className="rounded-lg border border-mist bg-white px-3 py-1 font-naskh text-lg">{w.word}</span>)}</div>}
        <Link href="/contribute" className="mt-3 inline-flex min-h-10 items-center text-xs font-extrabold text-azure-deep">Add your voice <span aria-hidden="true" className="ml-2">↗</span></Link>
      </div>

      <details className="group px-5 pb-5 pt-4">
        <summary className="cursor-pointer text-xs font-extrabold text-ink">Browse reported districts <span className="ml-1 font-normal text-ink-soft">({districts.length})</span></summary>
        <label className="mt-3 block"><span className="sr-only">Search reported districts</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find a district…" className="w-full rounded-xl border border-mist bg-ice px-3 py-2.5 text-sm" /></label>
        <div className="mt-2 max-h-48 overflow-y-auto">
          {listed.map((d) => <button key={d.id ?? d.name} onClick={() => setSelectedName(d.name)} aria-pressed={selected === d.name} className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-sm ${selected === d.name ? "bg-mist/60 font-bold" : "hover:bg-ice"}`}><span>{d.name}</span><span className="font-bold text-azure-deep">{format(d.words)}</span></button>)}
          {listed.length === 0 && <p className="py-3 text-xs text-ink-soft">{search ? "No matching district in this summary." : "No district counts available yet."}</p>}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">Top districts only. Markers show approximate reference locations, not people’s exact locations. Recording and contributor totals by district are not available yet.</p>
      </details>
    </section>
  );
}
