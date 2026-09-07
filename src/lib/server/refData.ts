import geographyData from "@/data/ref/geography.json";
import tribesData from "@/data/ref/tribes.json";
import type { RefOption } from "@/lib/refTypes";

type Tehsil = { id: string; name: string };
type District = { id: string; name: string; language?: string; tehsils: Tehsil[] };
type Province = { id: string; name: string; districts: District[] };
type Country = { id: string; name: string; provinces: Province[] };
type TribeNode = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  levelName: string;
  pashto?: string;
  aliases: string[];
  country: string;
};
type TribeLinks = Record<string, { dominantIn: string[]; presentIn: string[] }>;

const countries = (geographyData as unknown as { countries: Country[] }).countries;
const tribes = tribesData as unknown as {
  levelNames: string[];
  nodes: TribeNode[];
  tribeDistricts: TribeLinks;
};

const parentIds = new Set(
  tribes.nodes.map((n) => n.parentId).filter((p): p is string => p !== null),
);

function toTribeOption(n: TribeNode): RefOption {
  return {
    id: n.id,
    name: n.name,
    ps: n.pashto,
    aliases: n.aliases.length ? n.aliases : undefined,
    hasChildren: parentIds.has(n.id),
  };
}

export function provinces(countryId: string): RefOption[] {
  const country = countries.find((c) => c.id === countryId);
  return (country?.provinces ?? []).map((p) => ({ id: p.id, name: p.name }));
}

function findProvince(provinceId: string): Province | undefined {
  for (const c of countries) {
    const p = c.provinces.find((p) => p.id === provinceId);
    if (p) return p;
  }
  return undefined;
}

export function districts(provinceId: string): RefOption[] {
  return (findProvince(provinceId)?.districts ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    language: d.language,
    hasTehsils: d.tehsils.length > 0,
  }));
}

export function tehsils(districtId: string): RefOption[] {
  for (const c of countries) {
    for (const p of c.provinces) {
      const d = p.districts.find((d) => d.id === districtId);
      if (d) return d.tehsils.map((t) => ({ id: t.id, name: t.name }));
    }
  }
  return [];
}

export function rootTribes(districtId?: string): RefOption[] {
  const roots = tribes.nodes.filter((n) => n.level === 1);
  const rank = (n: TribeNode): number => {
    if (!districtId) return 2;
    const links = tribes.tribeDistricts[n.id];
    if (links?.dominantIn.includes(districtId)) return 0;
    if (links?.presentIn.includes(districtId)) return 1;
    return 2;
  };
  return roots
    .slice()
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    .map(toTribeOption);
}

export function tribeChildren(parentId: string): RefOption[] {
  return tribes.nodes
    .filter((n) => n.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toTribeOption);
}
