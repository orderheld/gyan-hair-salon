import type { Metadata } from "next";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getDict } from "./i18n";
import { LOCALES, OG_LOCALE } from "./i18n/config";

type PageMeta = {
  locale: Locale;
  title?: string; // ohne Zusatz; leer = Startseite
  description: string;
  path: (l: Locale) => string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
};

export function pageMetadata({ locale, title, description, path, image, noindex, type = "website" }: PageMeta): Metadata {
  const d = getDict(locale);
  // Google zeigt etwa 60 Zeichen: bei langen Titeln nur «GYAN» anhängen
  const clean = title?.replace(/\s*\|\s*GYAN$/, "");
  const fullTitle = !clean ? d.meta.siteTitle : `${clean} · ${d.meta.titleSuffix}`.length <= 60 ? `${clean} · ${d.meta.titleSuffix}` : clean.includes("GYAN") ? clean : `${clean} · GYAN`;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, path(l)]));
  languages["x-default"] = path("de");
  const img = image ?? "/images/salon-spiegel.jpg";
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path(locale), languages },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      siteName: site.name,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title: fullTitle,
      description,
      url: path(locale),
      images: [{ url: img }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [img] },
  };
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
