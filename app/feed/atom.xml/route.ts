import { buildAtom } from "@/lib/feeds";
import { listPublished } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = buildAtom(await listPublished(15));
  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
