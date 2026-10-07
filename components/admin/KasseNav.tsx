import Link from "next/link";
import type { Role } from "@/lib/auth";

/** Unterteilung der Kasse. Auswertung und Einstellungen nur im vollen Admin. */
export function KasseNav({ role, active, t }: { role: Role; active: "sell" | "report" | "settings"; t: { sell: string; report: string; settings: string } }) {
  if (role !== "admin") return null;
  const items = [
    { key: "sell", href: "/admin/kasse", label: t.sell },
    { key: "report", href: "/admin/kasse/auswertung", label: t.report },
    { key: "settings", href: "/admin/kasse/einstellungen", label: t.settings },
  ] as const;
  return (
    <nav className="kasse-nav" aria-label="Kasse">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={i.key === active ? "active" : ""} aria-current={i.key === active ? "page" : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
