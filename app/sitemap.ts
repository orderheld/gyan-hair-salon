import type { MetadataRoute } from "next";
import { posts } from "@/content/blog";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getServices } from "@/lib/data";
import { href, LOCALES, type RouteKey } from "@/lib/i18n/config";
import { postPath, seoPath, servicePath } from "@/lib/i18n/paths";

export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

// Jede Seite in allen drei Sprachen, mit hreflang-Verweisen untereinander
function entries(build: (l: Locale) => string, opts: Partial<Entry> = {}): Entry[] {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${site.url}${build(l)}`]));
  return LOCALES.map((l) => ({ url: `${site.url}${build(l)}`, alternates: { languages }, ...opts }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  const pages: [RouteKey, number][] = [
    ["home", 1],
    ["booking", 0.9],
    ["services", 0.9],
    ["zana", 0.8],
    ["salon", 0.7],
    ["contact", 0.8],
    ["faq", 0.6],
    ["blog", 0.6],
  ];
  return [
    ...pages.flatMap(([key, priority]) => entries((l) => href(l, key), { priority, changeFrequency: "weekly" })),
    ...services.flatMap((s) => entries((l) => servicePath(l, s), { priority: 0.8, changeFrequency: "monthly" })),
    ...topics.flatMap((t) => entries((l) => seoPath(l, t), { priority: 0.8, changeFrequency: "monthly" })),
    ...places.flatMap((p) => entries((l) => seoPath(l, p), { priority: 0.7, changeFrequency: "monthly" })),
    ...posts.flatMap((p) => entries((l) => postPath(l, p), { priority: 0.6, lastModified: p.date, changeFrequency: "yearly" })),
  ];
}
