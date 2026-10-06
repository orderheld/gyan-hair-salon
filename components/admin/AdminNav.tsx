"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  "/admin": <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  "/admin/kunden": <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" /><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.6c1.6.6 2.7 2.1 3 4.4" /></>,
  "/admin/leistungen": <><circle cx="6.5" cy="7" r="2.6" /><circle cx="6.5" cy="17" r="2.6" /><path d="M8.6 8.6 20 17.5M8.6 15.4 20 6.5" /></>,
  "/admin/zeiten": <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  "/admin/regeln": <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  "/admin/emails": <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
};

/** Oben als Tabs (Desktop), auf dem Handy als feste Leiste unten wie in einer App. */
export function AdminNav({ links }: { links: { href: string; label: string; short: string }[] }) {
  const path = usePathname();
  return (
    <nav className="admin-tabs" aria-label="Admin">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={(l.href === "/admin" ? path === l.href : path.startsWith(l.href)) ? "active" : ""}>
          <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            {ICONS[l.href]}
          </svg>
          <span className="tab-long">{l.label}</span>
          <span className="tab-short">{l.short}</span>
        </Link>
      ))}
    </nav>
  );
}
