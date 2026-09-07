// Seeds the ref_* tables in Postgres from src/data/ref JSON.
// Run: node --env-file=.env.local scripts/seed-ref.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const geography = JSON.parse(readFileSync(join(root, "src/data/ref/geography.json"), "utf8"));
const tribes = JSON.parse(readFileSync(join(root, "src/data/ref/tribes.json"), "utf8"));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();

const DDL = `
CREATE TABLE IF NOT EXISTS ref_country (
  id text PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE IF NOT EXISTS ref_province (
  id text PRIMARY KEY,
  name text NOT NULL,
  country_id text NOT NULL REFERENCES ref_country(id)
);
CREATE TABLE IF NOT EXISTS ref_district (
  id text PRIMARY KEY,
  name text NOT NULL,
  province_id text NOT NULL REFERENCES ref_province(id),
  language text
);
CREATE TABLE IF NOT EXISTS ref_tehsil (
  id text PRIMARY KEY,
  name text NOT NULL,
  district_id text NOT NULL REFERENCES ref_district(id)
);
CREATE TABLE IF NOT EXISTS ref_tribe (
  id text PRIMARY KEY,
  name text NOT NULL,
  parent_id text REFERENCES ref_tribe(id),
  level int NOT NULL,
  level_name text NOT NULL,
  pashto text,
  country text NOT NULL
);
CREATE TABLE IF NOT EXISTS ref_tribe_alias (
  tribe_id text NOT NULL REFERENCES ref_tribe(id),
  alias text NOT NULL,
  PRIMARY KEY (tribe_id, alias)
);
CREATE TABLE IF NOT EXISTS ref_tribe_district (
  tribe_id text NOT NULL REFERENCES ref_tribe(id),
  district_id text NOT NULL REFERENCES ref_district(id),
  role text NOT NULL,
  PRIMARY KEY (tribe_id, district_id)
);
CREATE INDEX IF NOT EXISTS idx_tribe_parent ON ref_tribe(parent_id);
CREATE INDEX IF NOT EXISTS idx_tehsil_district ON ref_tehsil(district_id);
CREATE INDEX IF NOT EXISTS idx_district_province ON ref_district(province_id);
`;

try {
  await client.query("BEGIN");
  await client.query(DDL);
  await client.query(
    "TRUNCATE ref_tribe_district, ref_tribe_alias, ref_tribe, ref_tehsil, ref_district, ref_province, ref_country CASCADE",
  );

  for (const country of geography.countries) {
    await client.query("INSERT INTO ref_country (id, name) VALUES ($1, $2)", [
      country.id,
      country.name,
    ]);
    for (const province of country.provinces) {
      await client.query(
        "INSERT INTO ref_province (id, name, country_id) VALUES ($1, $2, $3)",
        [province.id, province.name, country.id],
      );
      for (const district of province.districts) {
        await client.query(
          "INSERT INTO ref_district (id, name, province_id, language) VALUES ($1, $2, $3, $4)",
          [district.id, district.name, province.id, district.language ?? null],
        );
        for (const tehsil of district.tehsils) {
          await client.query(
            "INSERT INTO ref_tehsil (id, name, district_id) VALUES ($1, $2, $3)",
            [tehsil.id, tehsil.name, district.id],
          );
        }
      }
    }
  }

  for (const node of tribes.nodes) {
    await client.query(
      "INSERT INTO ref_tribe (id, name, parent_id, level, level_name, pashto, country) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [node.id, node.name, node.parentId, node.level, node.levelName, node.pashto ?? null, node.country],
    );
    for (const alias of node.aliases ?? []) {
      await client.query(
        "INSERT INTO ref_tribe_alias (tribe_id, alias) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [node.id, alias],
      );
    }
  }

  for (const [tribeId, links] of Object.entries(tribes.tribeDistricts)) {
    for (const districtId of links.dominantIn) {
      await client.query(
        "INSERT INTO ref_tribe_district (tribe_id, district_id, role) VALUES ($1, $2, 'dominant') ON CONFLICT DO NOTHING",
        [tribeId, districtId],
      );
    }
    for (const districtId of links.presentIn) {
      await client.query(
        "INSERT INTO ref_tribe_district (tribe_id, district_id, role) VALUES ($1, $2, 'present') ON CONFLICT DO NOTHING",
        [tribeId, districtId],
      );
    }
  }

  await client.query("COMMIT");
  const counts = await client.query(
    "SELECT (SELECT count(*) FROM ref_country) countries, (SELECT count(*) FROM ref_province) provinces, (SELECT count(*) FROM ref_district) districts, (SELECT count(*) FROM ref_tehsil) tehsils, (SELECT count(*) FROM ref_tribe) tribes, (SELECT count(*) FROM ref_tribe_alias) aliases, (SELECT count(*) FROM ref_tribe_district) links",
  );
  console.log("seeded:", counts.rows[0]);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
