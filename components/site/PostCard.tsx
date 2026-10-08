import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import type { BlogPost, Locale } from "@/content/types";
import type { Dict } from "@/lib/i18n";
import { INTL_LOCALE } from "@/lib/i18n/config";
import { postPath } from "@/lib/i18n/paths";
import { readingTime } from "../Markdown";

export const formatPostDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

export function PostCard({ post, locale, d, delay = 0, preload = false }: { post: BlogPost; locale: Locale; d: Dict; delay?: number; preload?: boolean }) {
  return (
    <Link href={postPath(locale, post)} className="post-card" data-reveal style={{ transitionDelay: `${delay}ms` }}>
      <span className="post-img">
        <Image src={post.image} alt={site.imageAlt[post.image]?.[locale] ?? post.title[locale]} fill preload={preload} sizes="(max-width: 760px) 90vw, 33vw" />
      </span>
      <span className="post-meta">
        {formatPostDate(post.date, locale)} · {readingTime(post.body[locale])} {d.blog.readTime}
      </span>
      <span className="post-title">{post.title[locale]}</span>
      <span className="post-desc">{post.description[locale]}</span>
    </Link>
  );
}
