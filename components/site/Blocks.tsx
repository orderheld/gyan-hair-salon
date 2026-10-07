import { ServiceIcon } from "./ServiceIcon";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import type { Faq, Locale } from "@/content/types";
import type { LocalService, OpeningDay } from "@/lib/data";
import { formatChf, formatDuration } from "@/lib/format";
import { groupHours } from "@/lib/hours";
import type { Dict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { absolute, jsonLd } from "@/lib/seo";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />;
}

/** Text Wort für Wort, für den Scroll-Effekt [data-words] */
export function Words({ text, className, as: Tag = "p" }: { text: string; className?: string; as?: "p" | "h2" }) {
  return (
    <Tag className={className} data-words>
      {text.split(" ").map((w, i) => (
        <span key={i} className="w">{w} </span>
      ))}
    </Tag>
  );
}

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        {items.map((c, i) =>
          i < items.length - 1 ? (
            <span key={c.href}>
              <Link href={c.href}>{c.label}</Link>
              <span aria-hidden> / </span>
            </span>
          ) : (
            <span key={c.href} aria-current="page">{c.label}</span>
          ),
        )}
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absolute(c.href) })),
        }}
      />
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = "",
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  imageAlt?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className={`page-hero ${image ? "has-image" : ""}`}>
      {image && (
        <div className="page-hero-media">
          <div className="parallax-img" data-parallax="0.12">
            <Image src={image} alt={imageAlt} fill preload sizes="100vw" />
          </div>
        </div>
      )}
      <div className="container page-hero-inner">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {eyebrow && <p className="eyebrow rise">{eyebrow}</p>}
        <h1 className="h-display rise" style={{ animationDelay: "80ms" }}>{title}</h1>
        {lead && <p className="lead rise" style={{ animationDelay: "160ms" }}>{lead}</p>}
        {children && <div className="rise" style={{ animationDelay: "240ms" }}>{children}</div>}
      </div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, text, center }: { eyebrow?: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={`section-head ${center ? "center" : ""}`} data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h2">{title}</h2>
      {text && <p className="lead">{text}</p>}
    </div>
  );
}

export function ServiceRows({ services, locale, d, feature = false }: { services: LocalService[]; locale: Locale; d: Dict; feature?: boolean }) {
  return (
    <ul className="svc-tiles">
      {services.map((s, i) => (
        <li key={s.id} className={`svc-tile${feature && i === 0 ? " wide" : ""}`} data-reveal style={{ transitionDelay: `${(i % 4) * 70}ms` }}>
          <Link href={href(locale, "services", s.slug)}>
            <span className="svc-tile-top">
              <span className="svc-tile-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="svc-tile-price">
                {s.priceFrom ? `${d.common.from} ` : ""}
                {formatChf(s.priceChf)}
              </span>
            </span>
            <ServiceIcon name={s.icon} />
            <span className="svc-tile-text">
              <span className="svc-tile-name">{s.name}</span>
              <span className="svc-tile-short">{s.short}</span>
            </span>
            <span className="svc-tile-foot">
              <span className="svc-tile-meta">{formatDuration(s.durationMin, locale)}</span>
              <i aria-hidden>→</i>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="faq-list">
      {items.map((f, i) => (
        <details key={i} className="faq-item" data-reveal>
          <summary>
            <span>{f.q}</span>
            <span className="faq-icon" aria-hidden />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export const faqSchema = (items: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export function Hours({ hours, d }: { hours: OpeningDay[]; d: Dict }) {
  const today = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Zurich", weekday: "short" }).format(new Date());
  const todayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(today);
  return (
    <dl className="hours">
      {groupHours(hours, d.common.weekdays).map((r) => (
        <div key={r.days} className={r.weekdays.includes(todayIdx) ? "today" : ""}>
          <dt>{r.days}</dt>
          <dd>{r.time ?? d.common.closed}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Visit({ locale, d, hours }: { locale: Locale; d: Dict; hours: OpeningDay[] }) {
  return (
    <section className="section visit">
      <div className="container visit-grid">
        <div data-reveal>
          <p className="eyebrow">{d.home.visitEyebrow}</p>
          <h2 className="h2">{d.home.visitTitle}</h2>
          <p className="lead">{d.home.visitText}</p>
          <address className="visit-address">
            {site.address.street}, {site.address.zip} {site.address.city}
            <br />
            <a href={site.phoneHref}>{site.phone}</a>
          </address>
          <div className="btn-row">
            <a className="btn btn-light" href={site.address.mapsUrl} target="_blank" rel="noopener">{d.common.route}</a>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.book}</Link>
          </div>
        </div>
        <div className="visit-card" data-reveal style={{ transitionDelay: "120ms" }}>
          <p className="eyebrow">{d.common.openingHours}</p>
          <Hours hours={hours} d={d} />
          <p className="small muted">{d.footer.walkInNote}</p>
        </div>
      </div>
    </section>
  );
}

export function CtaBand({ locale, d, title, text }: { locale: Locale; d: Dict; title?: string; text?: string }) {
  return (
    <section className="cta-band">
      <div className="cta-media" aria-hidden>
        <div className="parallax-img" data-parallax="0.2">
          <Image src={site.images.lounge} alt="" fill sizes="100vw" />
        </div>
      </div>
      <div className="container cta-inner" data-reveal>
        <h2 className="h-display">{title ?? d.home.finalTitle}</h2>
        <p className="lead">{text ?? d.home.finalText}</p>
        <div className="btn-row center">
          <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
          <a className="btn btn-light" href={site.phoneHref}>{site.phone}</a>
        </div>
      </div>
    </section>
  );
}
