import { siteLocked } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAvailabilityFor } from "@/lib/availability";
import { getService } from "@/lib/data";

export const dynamic = "force-dynamic";

const fresh = { headers: { "Cache-Control": "no-store" } };

/**
 * Ohne ?service: freie Zeiten für alle Dauern der aktiven Leistungen auf einmal ({ byDuration }),
 * damit die Buchung beim Wechsel der Leistung nichts mehr nachladen muss.
 * Mit ?service=ID: nur diese Leistung ({ days }), wie bisher.
 */
export async function GET(request: Request) {
  if (await siteLocked()) return NextResponse.json({ error: "Coming soon" }, { status: 403 });
  const param = new URL(request.url).searchParams.get("service");
  if (!param) {
    const byDuration = await getAvailabilityFor();
    return NextResponse.json({ byDuration }, fresh);
  }
  const id = Number(param);
  const service = Number.isInteger(id) ? await getService(id) : null;
  if (!service || !service.active) {
    return NextResponse.json({ error: "Leistung nicht gefunden." }, { status: 404 });
  }
  const days = (await getAvailabilityFor([service.durationMin]))[service.durationMin];
  return NextResponse.json({ days }, fresh);
}
