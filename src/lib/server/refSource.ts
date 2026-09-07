import * as dbSource from "@/lib/server/refDb";
import * as jsonSource from "@/lib/server/refData";
import type { RefOption } from "@/lib/refTypes";

export type RefResult = { data: RefOption[]; source: "db" | "json" };

async function withFallback(
  fromDb: () => Promise<RefOption[]>,
  fromJson: () => RefOption[],
): Promise<RefResult> {
  if (dbSource.isConfigured()) {
    try {
      return { data: await fromDb(), source: "db" };
    } catch (error) {
      console.error("ref db query failed, serving bundled fallback", error);
    }
  }
  return { data: fromJson(), source: "json" };
}

export const provinces = (countryId: string) =>
  withFallback(
    () => dbSource.provinces(countryId),
    () => jsonSource.provinces(countryId),
  );

export const districts = (provinceId: string) =>
  withFallback(
    () => dbSource.districts(provinceId),
    () => jsonSource.districts(provinceId),
  );

export const tehsils = (districtId: string) =>
  withFallback(
    () => dbSource.tehsils(districtId),
    () => jsonSource.tehsils(districtId),
  );

export const rootTribes = (districtId?: string) =>
  withFallback(
    () => dbSource.rootTribes(districtId),
    () => jsonSource.rootTribes(districtId),
  );

export const tribeChildren = (parentId: string) =>
  withFallback(
    () => dbSource.tribeChildren(parentId),
    () => jsonSource.tribeChildren(parentId),
  );
