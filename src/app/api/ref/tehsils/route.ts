import { REF_CACHE_HEADERS } from "@/lib/server/refHeaders";
import { tehsils } from "@/lib/server/refSource";

export async function GET(request: Request) {
  const district = new URL(request.url).searchParams.get("district");
  if (!district) {
    return Response.json({ error: "district is required" }, { status: 400 });
  }
  const { data, source } = await tehsils(district);
  return Response.json(data, {
    headers: { ...REF_CACHE_HEADERS, "x-ref-source": source },
  });
}
