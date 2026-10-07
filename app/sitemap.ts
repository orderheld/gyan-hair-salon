import type { MetadataRoute } from "next";
import { posts } from "@/content/blog";
import { places } from "@/content/seo/places";
import { topics } from "@/content/seo/topics";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getServices } from "@/lib/data";
import { href, LOCALES, type RouteKey } from "@/lib/i18n/config";
import { postPath, seoPath, servicePath } from "@/lib/i18n/paths";
import { absolute, languageAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Entry = MetadataRoute.Sitemap[number];

// Jede öffentliche Seite in allen drei Sprachen, mit hreflang-Verweisen untereinander (inkl. x-default).
// Nicht enthalten: Admin, API, Konto, Buchungsbestätigung, Storno, Impressum und Datenschutz (noindex).
function entries(build: (l: Locale) => string, opts: Partial<Entry> = {}): Entry[] {
  const languages = languageAlternates(build, true);
  return LOCALES.map((l) => ({ url: `${site.url}${build(l)}`, alternates: { languages }, ...opts }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getServices();
  // Neuester Beitrag: Startseite und Journal zeigen ihn, also gilt sein Datum dort als letzte Änderung
  const latestPost = posts.map((p) => p.updated ?? p.date).sort().at(-1);
  const pages: [RouteKey, number, string[]?][] = [
    ["home", 1, [site.images.hero, site.images.lounge]],
    ["booking", 0.9],
    ["services", 0.9],
    ["zana", 0.8, [site.images.zanaMain]],
    ["salon", 0.7, [site.images.lounge, site.images.reception, site.images.wash]],
    ["contact", 0.8, [site.images.reception]],
    ["faq", 0.6],
    ["blog", 0.7],
    ["voucher", 0.6, ["/images/gutschein-kuverts.jpg"]],
    ["loyalty", 0.4],
    ["social", 0.4],
  ];
  return [
    ...pages.flatMap(([key, priority, images]) =>
      entries((l) => href(l, key), {
        priority,
        changeFrequency: "weekly",
        ...(key === "home" || key === "blog" ? { lastModified: latestPost } : {}),
        ...(images ? { images: images.map(absolute) } : {}),
      }),
    ),
    ...services.flatMap((s) => entries((l) => servicePath(l, s), { priority: 0.8, changeFrequency: "monthly", ...(s.image ? { images: [absolute(s.image)] } : {}) })),
    ...topics.flatMap((t) => entries((l) => seoPath(l, t), { priority: 0.8, changeFrequency: "monthly" })),
    ...places.flatMap((p) => entries((l) => seoPath(l, p), { priority: 0.7, changeFrequency: "monthly" })),
    ...posts.flatMap((p) => entries((l) => postPath(l, p), { priority: 0.6, lastModified: p.updated ?? p.date, changeFrequency: "yearly", images: [absolute(p.image)] })),
  ];
}
