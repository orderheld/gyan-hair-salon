import { NextResponse } from "next/server";
import { newFormToken } from "@/lib/spam";

export const dynamic = "force-dynamic";

/** Formular-Token für den Spamschutz: holt der Browser beim Öffnen eines Formulars */
export function GET() {
  return NextResponse.json({ t: newFormToken() }, { headers: { "Cache-Control": "no-store" } });
}
