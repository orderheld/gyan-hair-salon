"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Tab = { href: string; label: string; icon: "home" | "services" | "book" | "zana" | "contact" | "card"; exact?: boolean };

const PATHS: Record<Tab["icon"], React.ReactNode> = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  services: (
    <>
      <circle cx="7" cy="17" r="2.6" />
      <circle cx="17" cy="17" r="2.6" />
      <path d="M8.9 15.2 17 4.5M15.1 15.2 7 4.5" />
    </>
  ),
  book: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M9.5 14.5l2 2 3.5-3.5" />
    </>
  ),
  zana: (
    <>
      <path d="M12 2.8c3 0 5 2.4 5 6v2.4c0 4.3-2.3 8-5 8s-5-3.7-5-8V8.8c0-3.6 2-6 5-6z" />
      <path d="M7 9.4c2.4-.4 4.4-1.7 5.6-3.6.9 1.6 2.4 2.8 4.4 3.4" />
      <path d="M10 14.6c1.2.7 2.8.7 4 0" />
      <path d="M9.6 19.6 9.3 21.5M14.4 19.6l.3 1.9" />
    </>
  ),
  card: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <circle cx="8" cy="10.5" r="1.4" />
      <circle cx="12" cy="10.5" r="1.4" />
      <circle cx="16" cy="10.5" r="1.4" />
      <path d="M7 15h10" />
    </>
  ),
  contact: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
};

/**
 * Wenn GYAN vom Home-Bildschirm gestartet wird (Standalone-App):
 * html.app setzen, untere Tab-Leiste zeigen und eine kleine Offline-Seite bereithalten.
 */
export function AppShell({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => document.documentElement.classList.toggle("app", mq.matches || nav.standalone === true);
    sync();
    mq.addEventListener?.("change", sync);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  return (
    <nav className="app-tabs" aria-label="App" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`app-tab app-tab-${t.icon}${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="app-tab-ico" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {PATHS[t.icon]}
              </svg>
            </span>
            <span className="app-tab-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
