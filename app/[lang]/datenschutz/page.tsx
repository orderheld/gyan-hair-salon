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
  return pageMetadata({ locale, title: d.legal.privacyTitle, description: `${d.legal.privacyTitle} · ${site.name}`, path: (l) => href(l, "privacy"), noindex: true });
}

export default async function Privacy({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return (
    <section className="section-tight legal">
      <div className="container narrow prose">
        <h1 className="h1">{d.legal.privacyTitle}</h1>
        {d.legal.privacy.map((s) => (
          <div key={s.title}>
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </div>
        ))}
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </section>
  );
}
