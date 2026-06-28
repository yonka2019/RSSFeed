import { buildAtom } from "@/lib/feeds";
import { listPublished } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = buildAtom(listPublished());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
