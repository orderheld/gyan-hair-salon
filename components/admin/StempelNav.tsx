import Link from "next/link";

/** Unterteilung der Stempelkarte im Admin (gleicher Stil wie die Kasse) */
export function StempelNav({ active, t }: { active: "scan" | "cards" | "reviews" | "settings"; t: { scan: string; cards: string; settings: string; reviews: string } }) {
  const items = [
    { key: "scan", href: "/admin/stempel", label: t.scan },
    { key: "cards", href: "/admin/stempel/kunden", label: t.cards },
    { key: "reviews", href: "/admin/stempel/bewertungen", label: t.reviews },
    { key: "settings", href: "/admin/stempel/einstellungen", label: t.settings },
  ] as const;
  return (
    <nav className="kasse-nav" aria-label="Stempelkarte">
      {items.map((i) => (
        <Link key={i.key} href={i.href} className={i.key === active ? "active" : ""} aria-current={i.key === active ? "page" : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
