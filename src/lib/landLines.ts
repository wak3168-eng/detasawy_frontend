import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import landAtlas from "world-atlas/land-110m.json";

export type Ring = Array<[number, number]>;

type LandTopology = Topology<{ land: GeometryCollection }>;

export function landRings(): Ring[] {
  const topo = landAtlas as unknown as LandTopology;
  const collection = feature(
    topo,
    topo.objects.land,
  ) as FeatureCollection<Geometry>;

  const rings: Ring[] = [];
  for (const item of collection.features) {
    const geometry = item.geometry;
    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) rings.push(ring as Ring);
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates)
        for (const ring of polygon) rings.push(ring as Ring);
    }
  }
  return rings;
}
