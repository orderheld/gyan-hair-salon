import { ServiceIcon } from "@/components/site/ServiceIcon";
import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { CtaBand, FaqList, PageHero } from "@/components/site/Blocks";
import { getServices, localize } from "@/lib/data";
import { formatChf, formatDuration } from "@/lib/format";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.services.metaTitle, description: d.services.metaDescription, path: (l) => href(l, "services") });
}

export default async function Services({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const services = (await getServices()).map((s) => localize(s, locale));
  return (
    <>
      <PageHero
        eyebrow={d.services.eyebrow}
        title={d.services.title}
        lead={d.services.lead}
        crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.services, href: href(locale, "services") }]}
      />
      <section className="section-tight">
        <div className="container svc-grid">
          {services.map((s, i) => (
            <article key={s.id} className="svc-card" data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <Link href={href(locale, "services", s.slug)} className="svc-card-icon" tabIndex={-1} aria-hidden>
                <ServiceIcon name={s.icon} />
              </Link>
              <div className="svc-card-body">
                <h2 className="h3">
                  <Link href={href(locale, "services", s.slug)}>{s.name}</Link>
                </h2>
                <p>{s.short}</p>
                <div className="svc-card-meta">
                  <span>{formatDuration(s.durationMin, locale)}</span>
                  <strong>{s.priceFrom ? `${d.common.from} ` : ""}{formatChf(s.priceChf)}</strong>
                </div>
                <div className="svc-card-actions">
                  <Link className="btn btn-dark btn-sm" href={`${href(locale, "booking")}?service=${s.id}`}>{d.common.bookShort}</Link>
                  <Link className="arrow-link" href={href(locale, "services", s.slug)}>{d.common.more} →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section bg-cream">
        <div className="container narrow">
          <h2 className="h2" data-reveal>{d.services.faqTitle}</h2>
          <FaqList items={d.faq.items.slice(0, 4)} />
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
