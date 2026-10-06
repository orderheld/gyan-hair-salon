import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { CtaBand, FaqList, faqSchema, JsonLd, PageHero } from "@/components/site/Blocks";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.faq.metaTitle, description: d.faq.metaDescription, path: (l) => href(l, "faq") });
}

export default async function FaqPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return (
    <>
      <PageHero eyebrow={d.faq.eyebrow} title={d.faq.title} crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.faq, href: href(locale, "faq") }]} />
      <section className="section-tight">
        <div className="container narrow">
          <FaqList items={d.faq.items} />
          <div className="btn-row" data-reveal>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
            <Link className="btn btn-light" href={href(locale, "contact")}>{d.nav.contact}</Link>
          </div>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
      <JsonLd data={faqSchema(d.faq.items)} />
    </>
  );
}
