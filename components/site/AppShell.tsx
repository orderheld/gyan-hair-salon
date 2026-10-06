"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Tab = { href: string; label: string; icon: "home" | "services" | "book" | "zana" | "contact"; exact?: boolean };

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
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
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
    <nav className="app-tabs" aria-label="App">
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
