import { Signature } from "@/components/site/Signature";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { Breadcrumbs, CtaBand, JsonLd } from "@/components/site/Blocks";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.zana.metaTitle, description: d.zana.metaDescription, path: (l) => href(l, "zana"), image: site.images.zanaMain });
}

export default async function ZanaPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const z = d.zana;
  return (
    <>
      <section className="zana-hero">
        <div className="container zana-hero-grid">
          <div className="zana-hero-text">
            <Breadcrumbs items={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.zana, href: href(locale, "zana") }]} />
            <p className="eyebrow rise">{z.eyebrow}</p>
            <h1 className="h-giant rise" style={{ animationDelay: "80ms" }}>{z.title}</h1>
            <p className="lead rise" style={{ animationDelay: "160ms" }}>{z.lead}</p>
          </div>
          <div className="zana-hero-media rise" style={{ animationDelay: "200ms" }} data-progress>
            <div className="zana-frame sweep">
              <Image src={site.images.zanaMain} alt={`${site.owner} · GYAN Hair Salon`} fill priority sizes="(max-width: 900px) 90vw, 40vw" />
            </div>
            <div className="zana-art sweep-slow">
              <Image src={site.images.zana} alt={site.owner} fill sizes="280px" />
            </div>
          </div>
        </div>
      </section>

      <div>
        <section className="section">
          <div className="container narrow story-long">
            {z.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "lead-xl" : "lead"} data-reveal>{p}</p>
            ))}
            <blockquote className="quote quote-xl" data-reveal>
              <p>«{d.home.quote}»</p>
              <cite>{d.home.quoteBy}</cite>
            </blockquote>
            <Signature className="signature signature-lg" label={z.signature} reveal />
          </div>
        </section>

        <section className="section bg-cream">
          <div className="container">
            <div className="section-head" data-reveal>
              <h2 className="h2">{z.valuesTitle}</h2>
            </div>
            <ol className="promise-grid three">
              {z.values.map((v, i) => (
                <li key={v.title} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="promise-no">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="h3">{v.title}</h3>
                  <p>{v.text}</p>
                </li>
              ))}
            </ol>
            <div className="btn-row" data-reveal>
              <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
              <Link className="btn btn-light" href={href(locale, "salon")}>{d.home.salonCta}</Link>
            </div>
          </div>
        </section>
      </div>
      <CtaBand locale={locale} d={d} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.owner,
          jobTitle: locale === "de" ? "Inhaber und Herren Coiffeur" : locale === "fr" ? "Propriétaire et coiffeur homme" : "Owner and men's hairdresser",
          worksFor: { "@id": `${site.url}/#salon` },
        }}
      />
    </>
  );
}
