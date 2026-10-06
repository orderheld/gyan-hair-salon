import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { Hours } from "@/components/site/Blocks";
import { Signature } from "@/components/site/Signature";
import { site } from "@/content/site";
import { LOCALES, type Locale } from "@/content/types";
import { getOpeningHours, type OpeningDay } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { openState } from "@/lib/live";

type Props = { searchParams: Promise<{ l?: string }> };

const lang = async (searchParams: Props["searchParams"]): Promise<Locale> => {
  const l = (await searchParams).l;
  return isLocale(l) ? l : "de";
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const d = getDict(await lang(searchParams));
  return { title: d.soon.metaTitle, description: d.meta.siteDescription };
}

export default async function ComingSoon({ searchParams }: Props) {
  const locale = await lang(searchParams);
  const d = getDict(locale);
  const s = d.soon;
  let hours: OpeningDay[] = [];
  try {
    hours = await getOpeningHours();
  } catch {
    // Ohne Datenbank einfach ohne Öffnungszeiten anzeigen
  }
  const open = hours.length ? openState(hours) : { kind: "none" as const };
  const live = d.home.live;
  const status =
    open.kind === "open" ? live.open.replace("{t}", open.until)
    : open.kind === "later" ? live.later.replace("{t}", open.from)
    : open.kind === "closed" ? live.closed.replace("{d}", d.common.weekdays[open.weekday]).replace("{t}", open.from)
    : null;

  return (
    <main className="soon" lang={locale}>
      <header className="soon-top container">
        <Wordmark className="soon-logo" />
        <nav className="soon-lang" aria-label={d.common.language}>
          {LOCALES.map((l) => (
            <a key={l} href={`/${l}`} className={l === locale ? "active" : ""} hrefLang={l}>{l.toUpperCase()}</a>
          ))}
        </nav>
      </header>

      <section className="container soon-grid">
        <div className="soon-copy">
          <div className="hero-top">
            <p className="eyebrow">{s.eyebrow}</p>
            {status && (
              <span className={`live-chip${open.kind === "open" ? " is-open" : ""}`}>
                <i aria-hidden />
                {status}
              </span>
            )}
          </div>
          <h1 className="hero-title soon-title">
            <span className="line"><span className="line-in" style={{ ["--i" as string]: 1 }}>{s.title[0]}</span></span>
            <span className="line"><span className="line-in soon-em" style={{ ["--i" as string]: 2 }}>{s.title[1]}</span></span>
          </h1>
          <p className="hero-text">{s.text}</p>
          <div className="btn-row">
            <a className="btn btn-dark" href={site.phoneHref}>{s.call} · {site.phone}</a>
            <a className="btn btn-light" href={site.address.mapsUrl} target="_blank" rel="noopener">{s.route}</a>
          </div>
          <Signature className="signature soon-sig" label={d.zana.signature} />
        </div>

        <div className="soon-visual">
          <div className="hero-arch">
            <Image src={site.images.hero} alt="GYAN Hair Salon Biel/Bienne" fill priority sizes="(max-width: 900px) 90vw, 40vw" />
          </div>
        </div>
      </section>

      <section className="container soon-info">
        <div>
          <p className="eyebrow">{d.common.address}</p>
          <p>{site.address.street}<br />{site.address.zip} {site.address.city}</p>
          <p><a href={site.phoneHref}>{site.phone}</a><br /><a href={site.instagram} target="_blank" rel="noopener">{site.instagramHandle}</a></p>
        </div>
        {hours.length > 0 && (
          <div>
            <p className="eyebrow">{s.hours}</p>
            <Hours hours={hours} d={d} />
          </div>
        )}
      </section>

      <footer className="container soon-foot">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <Link href={`/admin/login?next=/${locale}`} className="soon-login" prefetch={false}>{s.login}</Link>
      </footer>
    </main>
  );
}
