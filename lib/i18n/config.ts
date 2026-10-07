// Sprachen und lokalisierte Pfade. Ohne Abhängigkeiten, damit auch proxy.ts es nutzen kann.
import { LOCALES, type Locale } from "@/content/types";

export { LOCALES, type Locale };
export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_NAMES: Record<Locale, string> = { de: "Deutsch", fr: "Français", en: "English" };
export const INTL_LOCALE: Record<Locale, string> = { de: "de-CH", fr: "fr-CH", en: "en-GB" };
export const OG_LOCALE: Record<Locale, string> = { de: "de_CH", fr: "fr_CH", en: "en_GB" };
/** hreflang-Codes: Deutsch und Französisch für die Schweiz, Englisch ohne Region */
export const HREFLANG: Record<Locale, string> = { de: "de-CH", fr: "fr-CH", en: "en" };

/** Seiten und ihre Pfade pro Sprache. Die Ordner in app/[lang]/ heissen wie der deutsche Pfad. */
export const ROUTES = {
  home: { de: "", fr: "", en: "" },
  zana: { de: "zana", fr: "zana", en: "zana" },
  services: { de: "leistungen", fr: "prestations", en: "services" },
  salon: { de: "salon", fr: "salon", en: "salon" },
  faq: { de: "faq", fr: "faq", en: "faq" },
  blog: { de: "blog", fr: "blog", en: "blog" },
  contact: { de: "kontakt", fr: "contact", en: "contact" },
  social: { de: "social-media", fr: "reseaux-sociaux", en: "social-media" },
  loyalty: { de: "stempelkarte", fr: "carte-fidelite", en: "loyalty-card" },
  booking: { de: "termin", fr: "reservation", en: "booking" },
  account: { de: "meine-termine", fr: "mes-rendez-vous", en: "my-bookings" },
  imprint: { de: "impressum", fr: "mentions-legales", en: "imprint" },
  privacy: { de: "datenschutz", fr: "confidentialite", en: "privacy" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);

/** Pfad zu einer Seite in einer Sprache, z. B. href("fr", "services", "coupe-homme-bienne") */
export function href(locale: Locale, key: RouteKey, ...rest: (string | undefined)[]): string {
  const parts = [locale, ROUTES[key][locale], ...rest].filter(Boolean);
  return "/" + parts.join("/");
}

/** Lokalisierten ersten Pfadteil in den internen (deutschen) Ordnernamen übersetzen. */
export function toInternalSegment(locale: Locale, segment: string): string | null {
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key][locale] === segment) return ROUTES[key].de;
  }
  return null;
}

/** Interner Ordnername, der in dieser Sprache anders heisst (z. B. /fr/leistungen) -> richtiger Pfad */
export function canonicalSegment(locale: Locale, segment: string): string | null {
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const r = ROUTES[key];
    if (r.de === segment && r[locale] !== segment) return r[locale];
  }
  return null;
}
