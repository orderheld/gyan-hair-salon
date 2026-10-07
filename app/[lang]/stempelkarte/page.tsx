import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.loyalty.metaTitle, description: d.loyalty.metaDescription, path: (l) => href(l, "loyalty") });
}

/** Stempelkarte: vorerst nur «kommt bald» mit dem Versprechen (jeder 11. Haarschnitt gratis) */
export default async function LoyaltyPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const t = d.loyalty;
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.loyalty, href: href(locale, "loyalty") }]} />
      <section className="section-tight">
        <div className="container narrow">
          <div className="stamp-card" data-reveal>
            <span className="stamp-soon">{t.soon}</span>
            <ol className="stamp-grid" aria-hidden>
              {Array.from({ length: 11 }, (_, i) => (
                <li key={i} className={i === 10 ? "stamp is-free" : "stamp"}>{i === 10 ? t.free : i + 1}</li>
              ))}
            </ol>
            <h2 className="h3">{t.cardTitle}</h2>
            <p className="muted">{t.cardText}</p>
          </div>
          <div className="btn-row" data-reveal>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
            <Link className="btn btn-light" href={href(locale, "services")}>{d.common.allServices}</Link>
          </div>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
