import { Pool, type QueryResultRow } from "pg";
import type { RefOption } from "@/lib/refTypes";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export function isConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

async function rows<T extends QueryResultRow>(
  sql: string,
  params: unknown[],
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

type TribeRow = {
  id: string;
  name: string;
  pashto: string | null;
  has_children: boolean;
  aliases: string[];
};

function toTribeOption(row: TribeRow): RefOption {
  return {
    id: row.id,
    name: row.name,
    ps: row.pashto ?? undefined,
    aliases: row.aliases.length ? row.aliases : undefined,
    hasChildren: row.has_children,
  };
}

export async function provinces(countryId: string): Promise<RefOption[]> {
  return rows<{ id: string; name: string }>(
    `SELECT id, name FROM ref_province WHERE country_id = $1
     ORDER BY CASE WHEN id = 'pk-kp' THEN 0 ELSE 1 END, name`,
    [countryId],
  );
}

export async function districts(provinceId: string): Promise<RefOption[]> {
  const result = await rows<{
    id: string;
    name: string;
    language: string | null;
    has_tehsils: boolean;
  }>(
    `SELECT d.id, d.name, d.language,
       EXISTS(SELECT 1 FROM ref_tehsil t WHERE t.district_id = d.id) AS has_tehsils
     FROM ref_district d WHERE d.province_id = $1 ORDER BY d.name`,
    [provinceId],
  );
  return result.map((r) => ({
    id: r.id,
    name: r.name,
    language: r.language ?? undefined,
    hasTehsils: r.has_tehsils,
  }));
}

export async function tehsils(districtId: string): Promise<RefOption[]> {
  return rows<{ id: string; name: string }>(
    "SELECT id, name FROM ref_tehsil WHERE district_id = $1 ORDER BY name",
    [districtId],
  );
}

export async function rootTribes(districtId?: string): Promise<RefOption[]> {
  const result = await rows<TribeRow>(
    `SELECT t.id, t.name, t.pashto,
       EXISTS(SELECT 1 FROM ref_tribe c WHERE c.parent_id = t.id) AS has_children,
       COALESCE((SELECT array_agg(alias) FROM ref_tribe_alias a WHERE a.tribe_id = t.id), '{}') AS aliases,
       CASE WHEN rtd.role = 'dominant' THEN 0 WHEN rtd.role = 'present' THEN 1 ELSE 2 END AS rank
     FROM ref_tribe t
     LEFT JOIN ref_tribe_district rtd ON rtd.tribe_id = t.id AND rtd.district_id = $1
     WHERE t.level = 1
     ORDER BY rank, t.name`,
    [districtId ?? null],
  );
  return result.map(toTribeOption);
}

export async function tribeChildren(parentId: string): Promise<RefOption[]> {
  const result = await rows<TribeRow>(
    `SELECT t.id, t.name, t.pashto,
       EXISTS(SELECT 1 FROM ref_tribe c WHERE c.parent_id = t.id) AS has_children,
       COALESCE((SELECT array_agg(alias) FROM ref_tribe_alias a WHERE a.tribe_id = t.id), '{}') AS aliases
     FROM ref_tribe t WHERE t.parent_id = $1 ORDER BY t.name`,
    [parentId],
  );
  return result.map(toTribeOption);
}
