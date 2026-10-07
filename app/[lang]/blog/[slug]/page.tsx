import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { posts } from "@/content/blog";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { Markdown, readingTime } from "@/components/Markdown";
import { Breadcrumbs, CtaBand, JsonLd } from "@/components/site/Blocks";
import { formatPostDate, PostCard } from "@/components/site/PostCard";
import { getDict } from "@/lib/i18n";
import { HREFLANG, href } from "@/lib/i18n/config";
import { postPath } from "@/lib/i18n/paths";
import { absolute, pageMetadata } from "@/lib/seo";


export function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ lang: string; slug: string }> };

const find = (slug: string) => posts.find((p) => Object.values(p.slug).includes(decodeURIComponent(slug)));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const post = find(slug);
  if (!post) return {};
  return pageMetadata({ locale, title: post.title[locale], description: post.description[locale], path: (l) => postPath(l, post), image: post.image, type: "article", published: post.date });
}

export default async function PostPage({ params }: Props) {
  const { lang, slug } = await params;
  const locale = lang as Locale;
  const d = getDict(locale);
  const post = find(slug);
  if (!post) notFound();
  if (post.slug[locale] !== decodeURIComponent(slug)) permanentRedirect(postPath(locale, post));
  const related = posts.filter((p) => p.key !== post.key).slice(0, 3);

  return (
    <>
      <article>
        <header className="post-hero">
          <div className="container narrow">
            <Breadcrumbs
              items={[
                { label: d.nav.home, href: href(locale, "home") },
                { label: d.nav.blog, href: href(locale, "blog") },
                { label: post.title[locale], href: postPath(locale, post) },
              ]}
            />
            <p className="eyebrow rise">
              {formatPostDate(post.date, locale)} · {readingTime(post.body[locale])} {d.blog.readTime}
            </p>
            <h1 className="h1 rise" style={{ animationDelay: "80ms" }}>{post.title[locale]}</h1>
            <p className="lead rise" style={{ animationDelay: "160ms" }}>{post.description[locale]}</p>
          </div>
          <div className="container post-cover rise" style={{ animationDelay: "220ms" }}>
            <Image src={post.image} alt={site.imageAlt[post.image]?.[locale] ?? ""} fill preload sizes="(max-width: 1200px) 100vw, 1120px" />
          </div>
        </header>
        <div className="section-tight">
          <div className="container narrow">
          <Markdown text={post.body[locale]} locale={locale} className="prose prose-lg" />
          <div className="post-cta" data-reveal>
            <p className="aside-title">{d.home.finalTitle}</p>
            <p className="muted">{d.home.finalText}</p>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
          </div>
          </div>
        </div>
      </article>
      <section className="section bg-cream">
        <div className="container">
          <h2 className="h2" data-reveal>{d.blog.related}</h2>
          <div className="post-grid">
            {related.map((p, i) => (
              <PostCard key={p.key} post={p} locale={locale} d={d} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>
      <CtaBand locale={locale} d={d} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${absolute(postPath(locale, post))}#article`,
          headline: post.title[locale],
          description: post.description[locale],
          image: [absolute(post.image), absolute(post.image.replace("/images/", "/og/"))],
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          inLanguage: HREFLANG[locale],
          wordCount: post.body[locale].split(/\s+/).length,
          mainEntityOfPage: { "@type": "WebPage", "@id": absolute(postPath(locale, post)) },
          isPartOf: { "@type": "Blog", name: `${d.nav.blog} · ${site.name}`, url: absolute(href(locale, "blog")) },
          about: { "@id": `${site.url}/#salon` },
          author: { "@type": "Organization", name: site.name, url: `${site.url}/${locale}` },
          publisher: { "@type": "Organization", name: site.name, url: `${site.url}/${locale}`, logo: { "@type": "ImageObject", url: absolute("/brand/logo-email.png") } },
        }}
      />
    </>
  );
}
