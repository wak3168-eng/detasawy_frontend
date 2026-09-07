import { REF_CACHE_HEADERS } from "@/lib/server/refHeaders";
import { provinces } from "@/lib/server/refSource";

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country");
  if (!country) {
    return Response.json({ error: "country is required" }, { status: 400 });
  }
  const { data, source } = await provinces(country);
  return Response.json(data, {
    headers: { ...REF_CACHE_HEADERS, "x-ref-source": source },
  });
}
