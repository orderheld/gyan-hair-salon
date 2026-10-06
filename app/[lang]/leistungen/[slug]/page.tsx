import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { Markdown } from "@/components/Markdown";
import { Breadcrumbs, CtaBand, JsonLd, ServiceRows } from "@/components/site/Blocks";
import { getServiceBySlug, getServices, localize } from "@/lib/data";
import { formatChf, formatDuration } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { servicePath } from "@/lib/i18n/paths";
import { absolute, pageMetadata } from "@/lib/seo";


export function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const s = await getServiceBySlug(decodeURIComponent(slug));
  if (!s || !s.active) return {};
  const l = localize(s, locale);
  return pageMetadata({ locale, title: l.name, description: l.short, path: (x) => servicePath(x, s), image: s.image || undefined });
}

export default async function ServicePage({ params }: Props) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const d = getDict(locale);
  const s = await getServiceBySlug(decodeURIComponent(slug));
  if (!s || !s.active) notFound();
  const l = localize(s, locale);
  if (l.slug !== decodeURIComponent(slug)) permanentRedirect(servicePath(locale, s));
  const others = (await getServices()).filter((x) => x.id !== s.id).slice(0, 4).map((x) => localize(x, locale));
  const bookHref = `${href(locale, "booking")}?service=${s.id}`;

  return (
    <>
      <section className="svc-hero">
        <div className="svc-hero-media">
          <div className="parallax-img" data-parallax="0.12">
            <Image src={site.images.large[s.image] ?? (s.image || site.images.hero)} alt={`${l.name} · GYAN Hair Salon Biel`} fill priority sizes="100vw" />
          </div>
          <div className="hero-shade" />
        </div>
        <div className="container svc-hero-inner">
          <Breadcrumbs
            items={[
              { label: d.nav.home, href: href(locale, "home") },
              { label: d.nav.services, href: href(locale, "services") },
              { label: l.name, href: servicePath(locale, s) },
            ]}
          />
          <h1 className="h-display rise">{l.name}</h1>
          <p className="lead rise" style={{ animationDelay: "100ms" }}>{l.short}</p>
          <div className="chips rise" style={{ animationDelay: "180ms" }}>
            <span>{d.common.duration}: {formatDuration(s.durationMin, locale)}</span>
            <span>{d.common.price}: {s.priceFrom ? `${d.common.from} ` : ""}{formatChf(s.priceChf)}</span>
            {s.walkinPriceChf != null && <span>{d.services.walkin}: {formatChf(s.walkinPriceChf)}</span>}
            <span>{d.common.withZana}</span>
          </div>
          <div className="btn-row rise" style={{ animationDelay: "240ms" }}>
            <Link className="btn btn-dark" href={bookHref}>{d.services.detailCta}</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container article-grid">
          <Markdown text={l.long} locale={locale} className="prose prose-lg" />
          <aside className="article-aside">
            <div className="aside-card">
              <p className="eyebrow">{d.services.includes}</p>
              <p className="aside-title">{l.name}</p>
              <dl>
                <div><dt>{d.common.duration}</dt><dd>{formatDuration(s.durationMin, locale)}</dd></div>
                <div><dt>{d.services.withAppt}</dt><dd>{s.priceFrom ? `${d.common.from} ` : ""}{formatChf(s.priceChf)}</dd></div>
                {s.walkinPriceChf != null && <div><dt>{d.services.walkin}</dt><dd>{formatChf(s.walkinPriceChf)}</dd></div>}
                <div><dt>{d.booking.with}</dt><dd>{site.owner}</dd></div>
              </dl>
              <Link className="btn btn-dark btn-block" href={bookHref}>{d.common.book}</Link>
              <a className="btn btn-light btn-block" href={site.phoneHref}>{site.phone}</a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container">
          <h2 className="h2" data-reveal>{d.services.related}</h2>
          <ServiceRows services={others} locale={locale} d={d} />
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: l.name,
          description: l.short,
          serviceType: l.name,
          image: absolute(s.image || site.images.hero),
          url: absolute(servicePath(locale, s)),
          areaServed: { "@type": "City", name: "Biel/Bienne" },
          provider: { "@id": `${site.url}/#salon` },
          offers: { "@type": "Offer", price: s.priceChf, priceCurrency: "CHF", url: absolute(bookHref) },
        }}
      />
    </>
  );
}
