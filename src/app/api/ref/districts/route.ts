import { REF_CACHE_HEADERS } from "@/lib/server/refHeaders";
import { districts } from "@/lib/server/refSource";

export async function GET(request: Request) {
  const province = new URL(request.url).searchParams.get("province");
  if (!province) {
    return Response.json({ error: "province is required" }, { status: 400 });
  }
  const { data, source } = await districts(province);
  return Response.json(data, {
    headers: { ...REF_CACHE_HEADERS, "x-ref-source": source },
  });
}
