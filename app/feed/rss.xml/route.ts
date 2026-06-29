import { buildRss } from "@/lib/feeds";
import { listPublished } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = buildRss(await listPublished());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
