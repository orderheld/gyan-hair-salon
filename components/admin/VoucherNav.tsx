import Link from "next/link";

/** Unterteilung der Gutscheine im Admin (gleicher Stil wie Kasse und Stempelkarte) */
export function VoucherNav({ active, t }: { active: "list" | "sell" | "settings" | null; t: { list: string; sell: string; settings: string } }) {
  const items = [
    { key: "list", href: "/admin/gutscheine", label: t.list },
    { key: "sell", href: "/admin/gutscheine/verkaufen", label: t.sell }, // führt in die Kasse
    { key: "settings", href: "/admin/gutscheine/einstellungen", label: t.settings },
  ] as const;
  return (
    <nav className="kasse-nav" aria-label="Gutscheine">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={i.key === active ? "active" : ""} aria-current={i.key === active ? "page" : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
