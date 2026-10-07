// Kleiner Markdown-Renderer für Leistungen, SEO-Seiten und Blog.
// Interne Links (page:, service:, seo:, blog:) werden in die aktuelle Sprache übersetzt.
import Link from "next/link";
import type { ReactNode } from "react";
import { posts } from "@/content/blog";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import type { Locale } from "@/content/types";
import { getServices } from "@/lib/data";
import { href, type RouteKey } from "@/lib/i18n/config";
import { postPath, seoPath, servicePath } from "@/lib/i18n/paths";

type Resolver = (target: string) => string | null;

const PAGE_KEYS: Record<string, RouteKey> = {
  home: "home",
  zana: "zana",
  services: "services",
  salon: "salon",
  faq: "faq",
  contact: "contact",
  booking: "booking",
  blog: "blog",
  gutschein: "voucher",
  voucher: "voucher",
};

export async function linkResolver(locale: Locale): Promise<Resolver> {
  const services = await getServices({ includeInactive: true });
  return (target) => {
    const [kind, key] = target.split(":");
    if (kind === "page") return PAGE_KEYS[key] ? href(locale, PAGE_KEYS[key]) : null;
    if (kind === "service") {
      const s = services.find((x) => x.slug.de === key);
      return s ? servicePath(locale, s) : href(locale, "services");
    }
    if (kind === "seo") {
      const p = topics.find((x) => x.key === key) ?? places.find((x) => x.key === key);
      return p ? seoPath(locale, p) : null;
    }
    if (kind === "blog") {
      const p = posts.find((x) => x.key === key);
      return p ? postPath(locale, p) : href(locale, "blog");
    }
    return null;
  };
}

function inline(text: string, resolve: Resolver, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[1]) out.push(<strong key={k}>{m[1]}</strong>);
    else {
      const label = m[2];
      const target = m[3];
      if (/^https?:\/\//.test(target)) {
        out.push(<a key={k} href={target} target="_blank" rel="noopener">{label}</a>);
      } else if (target.startsWith("tel:") || target.startsWith("mailto:")) {
        out.push(<a key={k} href={target}>{label}</a>);
      } else {
        const url = resolve(target);
        out.push(url ? <Link key={k} href={url}>{label}</Link> : label);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(md: string, resolve: Resolver): ReactNode[] {
  const blocks = md.trim().split(/\n\s*\n/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const k = `b${bi}`;
    if (lines[0].startsWith("### ")) return <h3 key={k}>{inline(lines[0].slice(4), resolve, k)}</h3>;
    if (lines[0].startsWith("## ")) {
      const rest = lines.slice(1).join(" ");
      return (
        <div key={k}>
          <h2>{inline(lines[0].slice(3), resolve, k)}</h2>
          {rest && <p>{inline(rest, resolve, `${k}p`)}</p>}
        </div>
      );
    }
    if (lines.every((l) => l.startsWith("- "))) {
      return <ul key={k}>{lines.map((l, i) => <li key={i}>{inline(l.slice(2), resolve, `${k}-${i}`)}</li>)}</ul>;
    }
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      return <ol key={k}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\d+\.\s/, ""), resolve, `${k}-${i}`)}</li>)}</ol>;
    }
    if (lines[0].startsWith("> ")) {
      return <blockquote key={k}>{inline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), resolve, k)}</blockquote>;
    }
    return <p key={k}>{inline(lines.join(" "), resolve, k)}</p>;
  });
}

export async function Markdown({ text, locale, className = "prose" }: { text: string; locale: Locale; className?: string }) {
  const resolve = await linkResolver(locale);
  return <div className={className}>{renderMarkdown(text, resolve)}</div>;
}

/** Ungefähre Lesezeit in Minuten */
export const readingTime = (text: string) => Math.max(2, Math.round(text.split(/\s+/).length / 200));
