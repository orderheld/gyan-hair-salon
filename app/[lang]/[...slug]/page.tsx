// Lokale SEO-Seiten (Themen wie "Coiffeur Biel" und Orte wie "Coiffeur Nidau"). Alles andere: 404.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import { site } from "@/content/site";
import type { Locale, SeoPlace, SeoTopic } from "@/content/types";
import { Markdown } from "@/components/Markdown";
import { CtaBand, FaqList, faqSchema, Hours, JsonLd, PageHero, ServiceRows } from "@/components/site/Blocks";
import { getOpeningHours, getServices, localize } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { seoPath } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string; slug: string[] }> };
type Page = { kind: "topic"; page: SeoTopic } | { kind: "place"; page: SeoPlace };

function find(locale: Locale, slug: string[]): Page | null {
  if (slug.length !== 1) return null;
  const s = decodeURIComponent(slug[0]);
  const t = topics.find((x) => x.slug[locale] === s) ?? topics.find((x) => Object.values(x.slug).includes(s));
  if (t) return { kind: "topic", page: t };
  const p = places.find((x) => x.slug[locale] === s) ?? places.find((x) => Object.values(x.slug).includes(s));
  return p ? { kind: "place", page: p } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const hit = find(locale, slug);
  if (!hit) return {};
  return pageMetadata({ locale, title: hit.page.title[locale], description: hit.page.description[locale], path: (l) => seoPath(l, hit.page) });
}

const PLACE_PREFIX: Record<Locale, string> = { de: "Coiffeur", fr: "Coiffeur", en: "Barber" };

export default async function SeoPage({ params }: Props) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const d = getDict(locale);
  const hit = find(locale, slug);
  if (!hit) notFound();
  const page = hit.page;
  if (page.slug[locale] !== decodeURIComponent(slug[0])) permanentRedirect(seoPath(locale, page));

  const [all, hours] = await Promise.all([getServices(), getOpeningHours()]);
  const keys = hit.kind === "topic" ? hit.page.services : [];
  const picked = keys.length ? keys.map((k) => all.find((s) => s.slug.de === k)).filter((s) => !!s) : all.slice(0, 4);
  const services = picked.map((s) => localize(s, locale));
  const faq = hit.kind === "topic" ? hit.page.faq[locale] : [];
  const neighbors = hit.kind === "place" ? hit.page.neighbors.map((k) => places.find((p) => p.key === k)).filter((p) => !!p) : places.slice(0, 6);
  const otherTopics = topics.filter((t) => t.key !== page.key);
  const crumbs = [
    { label: d.nav.home, href: href(locale, "home") },
    { label: hit.kind === "place" ? `${PLACE_PREFIX[locale]} ${hit.page.name[locale]}` : page.h1[locale].split(" – ")[0], href: seoPath(locale, page) },
  ];

  return (
    <>
      <PageHero
        eyebrow={hit.kind === "place" ? `${hit.page.name[locale]} · ${hit.page.km} ${d.seo.distance}` : "GYAN Hair Salon · Biel/Bienne"}
        title={page.h1[locale]}
        lead={page.intro[locale]}
        crumbs={crumbs}
      >
        <div className="btn-row">
          <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
          <a className="btn btn-light" href={site.address.mapsUrl} target="_blank" rel="noopener">{d.common.route}</a>
        </div>
      </PageHero>

      <section className="section-tight">
        <div className="container article-grid">
          <Markdown text={page.body[locale]} locale={locale} className="prose prose-lg" />
          <aside className="article-aside">
            <div className="aside-card">
              <p className="eyebrow">GYAN Hair Salon</p>
              <p className="aside-title">{site.address.street}, {site.address.city}</p>
              <Hours hours={hours} d={d} />
              <Link className="btn btn-dark btn-block" href={href(locale, "booking")}>{d.common.book}</Link>
              <a className="btn btn-light btn-block" href={site.phoneHref}>{site.phone}</a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container">
          <h2 className="h2" data-reveal>{d.seo.servicesHere}</h2>
          <ServiceRows services={services} locale={locale} d={d} />
        </div>
      </section>

      {faq.length > 0 && (
        <section className="section">
          <div className="container narrow">
            <h2 className="h2" data-reveal>{d.seo.faqTitle}</h2>
            <FaqList items={faq} />
          </div>
          <JsonLd data={faqSchema(faq)} />
        </section>
      )}

      <section className="section-tight seo-links">
        <div className="container">
          <h2 className="h3">{d.seo.nearby}</h2>
          <div className="tag-cloud">
            {neighbors.map((p) => (
              <Link key={p.key} href={seoPath(locale, p)}>{PLACE_PREFIX[locale]} {p.name[locale]}</Link>
            ))}
            {otherTopics.map((t) => (
              <Link key={t.key} href={seoPath(locale, t)}>{t.h1[locale].split(" – ")[0]}</Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
