import { NextResponse } from "next/server";

import { feedVersion } from "@/lib/repository";

// Always hit the database — this endpoint exists precisely to detect changes.
export const dynamic = "force-dynamic";

export async function GET() {
  const version = await feedVersion();
  return NextResponse.json(
    { version },
    { headers: { "Cache-Control": "no-store" } },
  );
}
