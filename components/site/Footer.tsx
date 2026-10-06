import Link from "next/link";
import { posts } from "@/content/blog";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import type { LocalService, OpeningDay } from "@/lib/data";
import { groupHours } from "@/lib/hours";
import type { Dict } from "@/lib/i18n";
import { href, LOCALE_NAMES, LOCALES } from "@/lib/i18n/config";
import { postPath, seoPath } from "@/lib/i18n/paths";
import { Wordmark } from "../brand/Logo";

const PLACE_PREFIX: Record<Locale, string> = { de: "Coiffeur", fr: "Coiffeur", en: "Barber" };

export function Footer({ locale, d, services, hours }: { locale: Locale; d: Dict; services: LocalService[]; hours: OpeningDay[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Wordmark className="footer-mark" />
            <p>{d.footer.tagline}</p>
            <address>
              {site.address.street}
              <br />
              {site.address.zip} {site.address.city}
              <br />
              <a href={site.phoneHref}>{site.phone}</a>
              <br />
              <a href={site.instagram} target="_blank" rel="noopener">{site.instagramHandle}</a>
            </address>
            <dl className="footer-hours">
              {groupHours(hours, d.common.weekdaysShort).map((r) => (
                <div key={r.days}>
                  <dt>{r.days}</dt>
                  <dd>{r.time ?? d.common.closed}</dd>
                </div>
              ))}
            </dl>
          </div>

          <nav className="footer-col" aria-label={d.footer.salon}>
            <h2>{d.footer.salon}</h2>
            <Link href={href(locale, "zana")}>{d.nav.zana}</Link>
            <Link href={href(locale, "salon")}>{d.nav.salon}</Link>
            <Link href={href(locale, "services")}>{d.nav.services}</Link>
            <Link href={href(locale, "booking")}>{d.common.book}</Link>
            <Link href={href(locale, "faq")}>{d.nav.faq}</Link>
            <Link href={href(locale, "contact")}>{d.nav.contact}</Link>
          </nav>

          <nav className="footer-col" aria-label={d.footer.services}>
            <h2>{d.footer.services}</h2>
            {services.map((s) => (
              <Link key={s.id} href={href(locale, "services", s.slug)}>{s.name}</Link>
            ))}
          </nav>

          <nav className="footer-col" aria-label={d.footer.local}>
            <h2>{d.footer.local}</h2>
            {topics.map((t) => (
              <Link key={t.key} href={seoPath(locale, t)}>{t.h1[locale].split(" – ")[0]}</Link>
            ))}
            {places.map((p) => (
              <Link key={p.key} href={seoPath(locale, p)}>{PLACE_PREFIX[locale]} {p.name[locale]}</Link>
            ))}
          </nav>

          <nav className="footer-col" aria-label={d.footer.journal}>
            <h2>{d.footer.journal}</h2>
            {posts.slice(0, 5).map((p) => (
              <Link key={p.key} href={postPath(locale, p)}>{p.title[locale]}</Link>
            ))}
            <Link href={href(locale, "blog")} className="footer-more">{d.common.readMore} →</Link>
          </nav>
        </div>

        <p className="footer-note">{d.footer.walkInNote}</p>

        <div className="footer-bottom">
          <span>© {year} {site.name} · Biel/Bienne</span>
          <span className="footer-legal">
            <Link href={href(locale, "imprint")}>{d.footer.imprint}</Link>
            <Link href={href(locale, "privacy")}>{d.footer.privacy}</Link>
            {LOCALES.filter((l) => l !== locale).map((l) => (
              <Link key={l} href={`/${l}`} hrefLang={l} lang={l}>{LOCALE_NAMES[l]}</Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
