import { isAdmin } from "@/lib/auth";
import { getSalesBetween } from "@/lib/pos";
import { salesCsv } from "@/lib/pos";
import { periodRange, rangeDates } from "@/lib/pos-period";

export const dynamic = "force-dynamic";

/** Alle Belege eines Zeitraums als CSV (Excel, Treuhand). Nur im vollen Admin. */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const range = periodRange({ von: url.searchParams.get("von") ?? undefined, bis: url.searchParams.get("bis") ?? undefined, zeit: url.searchParams.get("zeit") ?? undefined });
  const { start, end } = rangeDates(range.from, range.to);
  const fmt = new Intl.DateTimeFormat("de-CH", { timeZone: "Europe/Zurich", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const csv = salesCsv(await getSalesBetween(start, end), (d) => fmt.format(d));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gyan-kasse-${range.from}-bis-${range.to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
