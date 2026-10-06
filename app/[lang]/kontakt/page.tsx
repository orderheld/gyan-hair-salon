import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { CtaBand, Hours, PageHero } from "@/components/site/Blocks";
import { getOpeningHours } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.contact.metaTitle, description: d.contact.metaDescription, path: (l) => href(l, "contact"), image: site.images.reception });
}

export default async function Contact({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const hours = await getOpeningHours();
  return (
    <>
      <PageHero eyebrow={d.contact.eyebrow} title={d.contact.title} lead={d.contact.lead} crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.contact, href: href(locale, "contact") }]} />
      <section className="section-tight">
        <div className="container contact-grid">
          <div className="contact-card" data-reveal>
            <dl className="contact-list">
              <div><dt>{d.common.address}</dt><dd>{site.address.street}<br />{site.address.zip} {site.address.city}</dd></div>
              <div><dt>{d.common.phone}</dt><dd><a href={site.phoneHref}>{site.phone}</a></dd></div>
              <div><dt>{d.contact.email}</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt>{d.contact.instagram}</dt><dd><a href={site.instagram} target="_blank" rel="noopener">{site.instagramHandle}</a></dd></div>
            </dl>
            <div className="btn-row">
              <a className="btn btn-dark" href={site.address.mapsUrl} target="_blank" rel="noopener">{d.contact.mapCta}</a>
              <Link className="btn btn-light" href={href(locale, "booking")}>{d.common.book}</Link>
            </div>
          </div>
          <div className="contact-card" data-reveal style={{ transitionDelay: "100ms" }}>
            <p className="eyebrow">{d.common.openingHours}</p>
            <Hours hours={hours} d={d} />
            <p className="small muted">{d.footer.walkInNote}</p>
          </div>
          <a className="contact-photo" href={site.address.mapsUrl} target="_blank" rel="noopener" data-reveal>
            <Image src={site.images.reception} alt="GYAN Hair Salon, Zentralstrasse 22, Biel/Bienne" fill sizes="(max-width: 900px) 92vw, 40vw" />
            <span className="contact-pin">
              <strong>GYAN</strong> {site.address.street}
            </span>
          </a>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
