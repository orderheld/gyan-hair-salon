// Pfade zu Inhalten mit eigenem Slug pro Sprache
import type { L, Locale } from "@/content/types";
import { href } from "./config";

type Slugged = { slug: L };

export const servicePath = (locale: Locale, s: Slugged) => href(locale, "services", s.slug[locale] || s.slug.de);
export const postPath = (locale: Locale, p: Slugged) => href(locale, "blog", p.slug[locale] || p.slug.de);
export const seoPath = (locale: Locale, p: Slugged) => `/${locale}/${p.slug[locale] || p.slug.de}`;
