import { NextResponse, type NextRequest } from "next/server";
import { citations, lighthouse, seoScore } from "@/content/insights";
import { keywords, rankingChecks } from "@/content/rankings";
import { isAdmin } from "@/lib/auth";
import { getSearchConsole } from "@/lib/search-console";
import { getTechStats, getVisitStats } from "@/lib/visits";

export const dynamic = "force-dynamic";

/**
 * Alle Zahlen von «Für Ferhat» als JSON, für die tägliche Auswertung (SEO-Routine).
 * Nur für eingeloggte Admins; alternativ mit ?key=CRON_SECRET (für automatische Abrufe).
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const byKey = !!process.env.CRON_SECRET && key === process.env.CRON_SECRET;
  if (!byKey && !(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tage = Number(request.nextUrl.searchParams.get("tage"));
  const days = [7, 30, 90, 365].includes(tage) ? tage : 30;
  const [visits, tech, searchConsole] = await Promise.all([getVisitStats(days), getTechStats(days), getSearchConsole().catch((e) => ({ state: "error", error: String(e) }))]);
  return NextResponse.json(
    { generatedAt: new Date().toISOString(), days, visits, tech, searchConsole, rankings: { keywords, checks: rankingChecks.slice(0, 10) }, seoScore, citations, lighthouse },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
