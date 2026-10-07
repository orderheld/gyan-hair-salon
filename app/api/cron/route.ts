import { NextResponse, type NextRequest } from "next/server";
import { runEmailJobs } from "@/lib/jobs";

export const dynamic = "force-dynamic";

// Aufruf alle 10–15 Minuten über cron-job.org:
//   https://www.gyanhairsalon.ch/api/cron?key=CRON_SECRET
// oder mit Header "Authorization: Bearer CRON_SECRET".
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = request.nextUrl.searchParams.get("key") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || given !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const result = await runEmailJobs();
  return NextResponse.json({ ok: true, ...result });
}
