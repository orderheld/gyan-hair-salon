"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { L, Locale } from "@/content/types";
import { LOCALES, ROUTES, type RouteKey } from "@/lib/i18n/config";
import { Wordmark } from "../brand/Logo";

type NavItem = { href: string; label: string };
type Props = {
  locale: Locale;
  nav: NavItem[];
  bookHref: string;
  labels: { book: string; bookShort: string; menu: string; close: string; language: string };
  slugIndex: L[];
  phone: string;
  phoneHref: string;
};

/** Gleiche Seite in einer anderen Sprache: übersetzt Ordner und Slugs */
function translatePath(pathname: string, from: Locale, to: Locale, slugIndex: L[]) {
  const [, , ...parts] = pathname.split("/");
  const out = parts.map((seg, i) => {
    if (i === 0) {
      const key = (Object.keys(ROUTES) as RouteKey[]).find((k) => ROUTES[k][from] === seg);
      if (key) return ROUTES[key][to];
    }
    const hit = slugIndex.find((s) => s[from] === seg);
    return hit ? hit[to] || seg : seg;
  });
  return "/" + [to, ...out].filter(Boolean).join("/");
}

export function Header({ locale, nav, bookHref, labels, slugIndex, phone, phoneHref }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const setLang = (l: Locale) => {
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
  };
  const langLinks = LOCALES.map((l) => (
    <Link
      key={l}
      href={translatePath(pathname, locale, l, slugIndex)}
      hrefLang={l}
      lang={l}
      onClick={() => setLang(l)}
      aria-current={l === locale ? "true" : undefined}
      className={l === locale ? "active" : ""}
    >
      {l.toUpperCase()}
    </Link>
  ));
  const onBooking = pathname.startsWith(bookHref);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href={`/${locale}`} className="brand" aria-label="GYAN Hair Salon">
            <Wordmark className="brand-mark" />
          </Link>
          <nav className="nav-desktop" aria-label="Hauptnavigation">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <div className="lang" aria-label={labels.language}>{langLinks}</div>
            <Link href={bookHref} className="btn btn-dark btn-sm header-book">{labels.book}</Link>
            <button
              type="button"
              className={`burger ${open ? "is-open" : ""}`}
              aria-expanded={open}
              aria-controls="menu"
              aria-label={open ? labels.close : labels.menu}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="menu" className={`menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <nav className="menu-links">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }} tabIndex={open ? 0 : -1}>
              <span className="menu-no">{String(i + 1).padStart(2, "0")}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="menu-foot">
          <Link href={bookHref} className="btn btn-red" tabIndex={open ? 0 : -1}>{labels.book}</Link>
          <a href={phoneHref} className="menu-phone" tabIndex={open ? 0 : -1}>{phone}</a>
          <div className="lang lang-lg">{langLinks}</div>
        </div>
      </div>

      {!onBooking && (
        <Link href={bookHref} className="sticky-book">
          <span className="sticky-dot" aria-hidden />
          {labels.book}
        </Link>
      )}
    </>
  );
}
