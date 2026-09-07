import type { FeatureCollection, Geometry, Position } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesAtlas from "world-atlas/countries-110m.json";
import { latLonToVec3 } from "@/lib/geo";
import { MAP_COLORS } from "@/lib/theme";

type CountriesTopology = Topology<{ countries: GeometryCollection }>;

const WIDTH = 1440;
const HEIGHT = 720;

function drawRing(ctx: CanvasRenderingContext2D, ring: Position[]) {
  ring.forEach(([lon, lat], i) => {
    const x = ((lon + 180) / 360) * WIDTH;
    const y = ((90 - lat) / 180) * HEIGHT;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

/**
 * Rasterizes countries onto a canvas in cycling map colors, then samples an
 * even lat/lon grid into a colored point cloud on the sphere. Client-only.
 */
export function buildLandDots(radius: number, step = 1.3) {
  const topo = countriesAtlas as unknown as CountriesTopology;
  const collection = feature(
    topo,
    topo.objects.countries,
  ) as FeatureCollection<Geometry>;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { positions: new Float32Array(), colors: new Float32Array() };
  }

  collection.features.forEach((item, index) => {
    const geometry = item.geometry;
    ctx.fillStyle = MAP_COLORS[index % MAP_COLORS.length];
    ctx.beginPath();
    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach((ring) => drawRing(ctx, ring));
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) =>
        polygon.forEach((ring) => drawRing(ctx, ring)),
      );
    }
    ctx.fill("evenodd");
  });

  const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
  const positions: number[] = [];
  const colors: number[] = [];

  for (let lat = -58; lat <= 84; lat += step) {
    const lonStep = step / Math.max(Math.cos((lat * Math.PI) / 180), 0.25);
    for (let lon = -180; lon < 180; lon += lonStep) {
      const x = Math.floor(((lon + 180) / 360) * WIDTH);
      const y = Math.floor(((90 - lat) / 180) * HEIGHT);
      const i4 = (y * WIDTH + x) * 4;
      if (pixels[i4 + 3] === 0) continue;
      const v = latLonToVec3(lat, lon, radius);
      positions.push(v.x, v.y, v.z);
      colors.push(pixels[i4] / 255, pixels[i4 + 1] / 255, pixels[i4 + 2] / 255);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  };
}
