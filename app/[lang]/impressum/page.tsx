import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.legal.imprintTitle, description: `${d.legal.imprintTitle} · ${site.name}`, path: (l) => href(l, "imprint"), noindex: true });
}

export default async function Imprint({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return (
    <section className="section-tight legal">
      <div className="container narrow prose">
        <h1 className="h1">{d.legal.imprintTitle}</h1>
        <h2>{d.legal.contact}</h2>
        <p>
          {site.name}
          <br />
          {site.address.street}
          <br />
          {site.address.zip} {site.address.city}
          <br />
          {d.common.phone}: <a href={site.phoneHref}>{site.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <h2>{d.legal.company}</h2>
        <p>
          {site.legalName}
          <br />
          {d.legal.owner}: {site.ownerFull}
          <br />
          {d.legal.legalForm}: {d.legal.legalFormValue}
          <br />
          {d.legal.uid}: {site.uid}
        </p>
        <h2>{d.legal.disclaimerTitle}</h2>
        <p>{d.legal.disclaimer}</p>
      </div>
    </section>
  );
}
