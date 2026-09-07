import { REF_CACHE_HEADERS } from "@/lib/server/refHeaders";
import { rootTribes, tribeChildren } from "@/lib/server/refSource";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parent = params.get("parent");
  const district = params.get("district");
  const { data, source } = parent
    ? await tribeChildren(parent)
    : await rootTribes(district ?? undefined);
  return Response.json(data, {
    headers: { ...REF_CACHE_HEADERS, "x-ref-source": source },
  });
}
