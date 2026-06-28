import { buildJson } from "@/lib/feeds";
import { listPublished } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = buildJson(listPublished());
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
