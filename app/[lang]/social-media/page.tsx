import type { Metadata } from "next";
import type { Locale } from "@/content/types";
import { site } from "@/content/site";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { SocialIcon } from "@/components/site/SocialIcons";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.social.metaTitle, description: d.social.metaDescription, path: (l) => href(l, "social") });
}

export default async function SocialPage({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const t = d.social;
  const networks = [
    { key: "instagram" as const, name: "Instagram", url: site.instagram, handle: site.instagramHandle, text: t.instagram },
    { key: "tiktok" as const, name: "TikTok", url: site.tiktok, handle: site.tiktokHandle, text: t.tiktok },
    { key: "facebook" as const, name: "Facebook", url: site.facebook, handle: site.facebookHandle, text: t.facebook },
  ];
  return (
    <>
      <PageHero eyebrow={t.eyebrow} title={t.title} lead={t.lead} crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.social, href: href(locale, "social") }]} />
      <section className="section-tight">
        <div className="container">
          <ul className="social-grid">
            {networks.map((n) => (
              <li key={n.key} data-reveal>
                <a className="social-card" href={n.url} target="_blank" rel="noopener">
                  <SocialIcon name={n.key} className="social-icon" />
                  <span className="social-name">{n.name}</span>
                  <span className="social-handle">{n.handle}</span>
                  <span className="muted social-text">{n.text}</span>
                  <span className="btn btn-dark btn-sm social-follow">{t.follow} →</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
