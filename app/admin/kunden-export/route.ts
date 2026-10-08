import { isAdmin } from "@/lib/auth";
import { listCustomers } from "@/lib/customers";
import { toDateKey } from "@/lib/time";

export const dynamic = "force-dynamic";

/** CSV mit allen Kunden, die Werbung erlaubt haben (nicht abgemeldet, nicht gesperrt) */
export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const rows = (await listCustomers("", { limit: null })).filter((c) => c.consent && !c.noMarketing && !c.blocked && c.email);
  // Zellen, die mit = + - @ beginnen, würde Excel als Formel ausführen: mit ' entschärfen
  const cell = (v: string | number) => `"${String(v).replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`;
  const date = (d: Date | null) => (d ? toDateKey(d) : "");
  const csv = [
    ["Name", "E-Mail", "Telefon", "Besuche", "Letzter Besuch"].map(cell).join(";"),
    ...rows.map((c) => [c.name, c.email, c.phone, c.visits, date(c.lastVisitAt)].map(cell).join(";")),
  ].join("\r\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gyan-kunden-werbung-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
