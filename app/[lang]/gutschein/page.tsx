import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Monogram } from "@/components/brand/Logo";
import { CtaBand, faqSchema, JsonLd, PageHero, Visit } from "@/components/site/Blocks";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getSalonHours } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { posts } from "@/content/blog";
import { VoucherOrder } from "@/components/site/VoucherOrder";
import { getVoucherSettings } from "@/lib/vouchers";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.voucher.metaTitle, description: d.voucher.metaDescription, path: (l) => href(l, "voucher"), image: site.images.voucher });
}

/**
 * Gutschein: frei wählbarer Betrag. Online bestellen und beim Abholen im Salon bezahlen (im Admin abschaltbar),
 * oder direkt im Salon kaufen. Ist die Online-Bestellung aus, zeigt die Seite nur den Hinweis «nur im Salon».
 */
export default async function Voucher({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const t = d.voucher;
  const [hours, vs] = await Promise.all([getSalonHours(), getVoucherSettings()]);
  const online = vs.onlineEnabled;
  const faq = online ? t.faqOnline : t.faq;
  const address = `${site.address.street}, ${site.address.zip} ${site.address.city}`;
  const post = posts.find((p) => p.key === "gutschein-verschenken-biel");

  return (
    <>
      <PageHero
        eyebrow={t.eyebrow}
        title={t.title}
        lead={t.lead}
        crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.voucher, href: href(locale, "voucher") }]}
      />

      <section className="section-tight after-hero">
        <div className="container vc-grid">
          <div className="vc-visual" data-reveal>
            <div className="vc-photo">
              <Image src={site.images.voucher} alt={site.imageAlt[site.images.voucher][locale]} fill sizes="(max-width: 900px) 92vw, 50vw" preload />
            </div>
            {/* Beispiel-Gutschein, nachgebaut nach den Karten aus Kraftpapier mit geprägtem Monogramm */}
            <div className="vc-card" aria-label={`${t.cardLabel} ${t.cardFor} ${t.cardName}, ${t.cardAmount}`} role="img">
              <Monogram className="vc-mono" />
              <span className="vc-label">{t.cardLabel}</span>
              <span className="vc-for">{t.cardFor} <em>{t.cardName}</em></span>
              <span className="vc-amount">{t.cardAmount}</span>
              <span className="vc-note">{t.cardNote}</span>
            </div>
          </div>
          <div className="vc-info" data-reveal style={{ transitionDelay: "120ms" }}>
            <p className="vc-badge">
              {online ? (
                <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="8" width="17" height="12" rx="2" /><path d="M3.5 12h17M12 8v12M12 8c-1.5-3-5-3.5-5-1.5S10 8 12 8Zm0 0c1.5-3 5-3.5 5-1.5S14 8 12 8Z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5L5.5 4h13L20 9.5M4 9.5h16M4 9.5v10h16v-10M9.5 19.5v-5h5v5" /></svg>
              )}
              {online ? t.orderBadge : t.onlyInSalon}
            </p>
            <p className="lead">{online ? t.orderLead : t.onlyInSalonText}</p>
            <div className="vc-actions">
              {online ? (
                <a className="btn btn-dark" href="#bestellen">{t.orderTitle}</a>
              ) : (
                <a className="btn btn-dark" href={site.phoneHref}>{t.ctaCall}</a>
              )}
              <a className="btn btn-light" href={site.address.mapsUrl} target="_blank" rel="noopener">{t.ctaRoute}</a>
            </div>
            <p className="muted small">{address}</p>
          </div>
        </div>
      </section>

      {online && (
        <section className="section-tight vc-order-section" id="bestellen">
          <div className="container narrow">
            <h2 className="h2" data-reveal>{t.orderTitle}</h2>
            <p className="muted vc-order-alt">{t.orderAlt}</p>
            <VoucherOrder locale={locale} t={t.form} presets={vs.presets} min={vs.minChf} max={vs.maxChf} privacyHref={href(locale, "privacy")} address={address} />
          </div>
        </section>
      )}

      <section className="section bg-cream">
        <div className="container">
          <h2 className="h2" data-reveal>{t.stepsTitle}</h2>
          <ol className="vc-steps">
            {(online ? t.stepsOnline : t.steps).map((s, i) => (
              <li key={s.title} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="promise-no">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container vc-ideas-grid">
          <div data-reveal>
            <h2 className="h2">{t.ideasTitle}</h2>
            <ul className="vc-ideas">
              {t.ideas.map((idea) => <li key={idea}>{idea}</li>)}
            </ul>
            <div className="vc-actions">
              <Link className="btn btn-light" href={href(locale, "services")}>{t.ctaServices}</Link>
              {post && <Link className="btn btn-light" href={href(locale, "blog", post.slug[locale])}>{t.ctaRead}</Link>}
            </div>
          </div>
          <div className="vc-side" data-reveal style={{ transitionDelay: "120ms" }}>
            <Image src={site.images.bag} alt={site.imageAlt[site.images.bag][locale]} fill sizes="(max-width: 900px) 92vw, 40vw" />
          </div>
        </div>
      </section>

      <section className="section-tight bg-cream">
        <div className="container narrow">
          <h2 className="h2" data-reveal>{t.faqTitle}</h2>
          <div className="vc-faq">
            {faq.map((f) => (
              <details key={f.q} className="vc-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Visit locale={locale} d={d} hours={hours} />
      <CtaBand locale={locale} d={d} />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
