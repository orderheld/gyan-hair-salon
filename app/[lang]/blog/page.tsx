import type { Metadata } from "next";
import { posts } from "@/content/blog";
import type { Locale } from "@/content/types";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { PostCard } from "@/components/site/PostCard";
import { getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return pageMetadata({ locale, title: d.blog.metaTitle, description: d.blog.metaDescription, path: (l) => href(l, "blog") });
}

export default async function Blog({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  return (
    <>
      <PageHero eyebrow={d.blog.eyebrow} title={d.blog.title} lead={d.blog.lead} crumbs={[{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.blog, href: href(locale, "blog") }]} />
      <section className="section-tight">
        <div className="container post-grid">
          {posts.map((p, i) => (
            <PostCard key={p.key} post={p} locale={locale} d={d} delay={(i % 3) * 80} preload={i === 0} />
          ))}
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
    </>
  );
}
