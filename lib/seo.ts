import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getDict } from "./i18n";
import { HREFLANG, LOCALES, OG_LOCALE } from "./i18n/config";

type PageMeta = {
  locale: Locale;
  title?: string; // ohne Zusatz; leer = Startseite
  description: string;
  path: (l: Locale) => string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
  /** Nur für Beiträge: Veröffentlichungsdatum (YYYY-MM-DD) */
  published?: string;
};

const MAX_TITLE = 60;

/**
 * Seitentitel für Google (etwa 60 Zeichen sichtbar).
 * Steht Biel/Bienne schon im Titel, kommt nur der Salonname dazu, sonst der Zusatz mit Ort.
 * Ist der Titel zu lang, wird gekürzt auf «· GYAN» oder ganz ohne Zusatz.
 */
export function pageTitle(locale: Locale, title?: string) {
  const d = getDict(locale);
  const clean = title?.replace(/\s*\|\s*GYAN$/, "").trim();
  if (!clean) return d.meta.siteTitle;
  if (clean.includes("GYAN")) return clean;
  const local = /Biel|Bienne/.test(clean);
  const candidates = [local ? site.name : d.meta.titleSuffix, "GYAN"].map((s) => `${clean} · ${s}`);
  return candidates.find((t) => t.length <= MAX_TITLE) ?? clean;
}

/** Hochformat-Fotos haben unter /og/ eine Querformat-Version (1200 × 630) für Social Media */
function ogImage(image: string, locale: Locale) {
  const og = image.startsWith("/images/") ? image.replace("/images/", "/og/") : null;
  const alt = site.imageAlt[image]?.[locale] ?? site.name;
  return og ? { url: og, width: 1200, height: 630, alt } : { url: image, alt };
}

/** hreflang-Verweise auf alle Sprachversionen, Deutsch als Standard (x-default) */
export function languageAlternates(path: (l: Locale) => string, abs = false) {
  const url = (p: string) => (abs ? absolute(p) : p);
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [HREFLANG[l], url(path(l))]));
  languages["x-default"] = url(path("de"));
  return languages;
}

export function pageMetadata({ locale, title, description, path, image, noindex, type = "website", published }: PageMeta): Metadata {
  const fullTitle = pageTitle(locale, title);
  const img = ogImage(image ?? site.images.hero, locale);
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path(locale), languages: languageAlternates(path) },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type,
      siteName: site.name,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title: fullTitle,
      description,
      url: path(locale),
      images: [img],
      ...(type === "article" && published ? { publishedTime: published, authors: [site.name] } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [img] },
  };
}

/** Für private Seiten (Konto, Bestätigung, Storno): eigener Titel, nie bei Google */
export function privateMetadata(title: string): Metadata {
  return { title: { absolute: `${title} · ${site.name}` }, robots: { index: false, follow: false } };
}

export const absolute = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** JSON-LD sicher in die Seite schreiben */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

/** Meta-Beschreibung auf höchstens 160 Zeichen kürzen, am Wortende */
export function clampDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,;:·–-]$/, "") + "…";
}
