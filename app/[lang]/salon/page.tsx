import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { CtaBand, PageHero, Visit } from "@/components/site/Blocks";
import { getOpeningHours } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.salon.metaTitle, description: d.salon.metaDescription, path: (l) => href(l, "salon"), image: site.images.lounge });
}

const FEATURE_IMAGES = [site.images.hero, site.images.reception, site.images.lounge, site.images.wash];

export default async function Salon({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const hours = await getOpeningHours();
  return (
    <>
      <PageHero
        eyebrow={d.salon.eyebrow}
        title={d.salon.title}
        lead={d.salon.lead}
        image={site.images.lounge}
        imageAlt="GYAN Hair Salon Biel, Lounge"
        crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.salon, href: href(locale, "salon") }]}
      />
      <section className="section">
        <div className="container feature-list">
          {d.salon.features.map((f, i) => (
            <article key={f.title} className={`feature ${i % 2 ? "flip" : ""}`}>
              <div className="feature-img" data-reveal>
                <div className="parallax-img" data-parallax="0.1">
                  <Image src={FEATURE_IMAGES[i] ?? site.images.hero} alt={`${f.title} · GYAN Hair Salon Biel`} fill sizes="(max-width: 900px) 92vw, 50vw" />
                </div>
              </div>
              <div className="feature-text" data-reveal style={{ transitionDelay: "120ms" }}>
                <span className="promise-no">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="h2">{f.title}</h2>
                <p className="lead">{f.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section-tight bg-cream">
        <div className="container">
          <h2 className="h2" data-reveal>{d.salon.galleryTitle}</h2>
          <div className="gallery">
            {[site.images.reception, site.images.signature, "/images/cut-mulet.jpg", "/images/cut-standard.jpg"].map((src, i) => (
              <div key={src} className="gallery-item" data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
                <Image src={src} alt={`GYAN Hair Salon Biel · ${d.salon.galleryTitle} ${i + 1}`} fill sizes="(max-width: 760px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Visit locale={locale} d={d} hours={hours} />
      <CtaBand locale={locale} d={d} />
    </>
  );
}
