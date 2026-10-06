import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/availability";
import { getService } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("service"));
  const service = Number.isInteger(id) ? await getService(id) : null;
  if (!service || !service.active) {
    return NextResponse.json({ error: "Leistung nicht gefunden." }, { status: 404 });
  }
  const days = await getAvailability(service.durationMin);
  return NextResponse.json({ days }, { headers: { "Cache-Control": "no-store" } });
}
