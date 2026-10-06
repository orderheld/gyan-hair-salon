// Pfade zu Inhalten mit eigenem Slug pro Sprache
import type { L, Locale } from "@/content/types";
import { href, LOCALES } from "./config";

type Slugged = { slug: L };

export const servicePath = (locale: Locale, s: Slugged) => href(locale, "services", s.slug[locale] || s.slug.de);
export const postPath = (locale: Locale, p: Slugged) => href(locale, "blog", p.slug[locale] || p.slug.de);
export const seoPath = (locale: Locale, p: Slugged) => `/${locale}/${p.slug[locale] || p.slug.de}`;

/** Alle Sprachversionen einer Seite (für hreflang und den Sprachumschalter) */
export const allLocales = (build: (l: Locale) => string) =>
  Object.fromEntries(LOCALES.map((l) => [l, build(l)])) as Record<Locale, string>;
