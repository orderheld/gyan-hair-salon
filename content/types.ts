export const LOCALES = ["de", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type L<T = string> = Record<Locale, T>;

/**
 * Einfaches Markdown für Texte: Absätze durch Leerzeile, "## " Zwischentitel, "- " Listen, **fett**.
 * Links: [Text](ziel). Ziel ist entweder eine https-Adresse oder ein interner Schlüssel:
 *   page:home | page:zana | page:services | page:salon | page:faq | page:contact | page:booking | page:blog
 *   service:<key>   (key = deutscher Slug, z. B. service:skin-fade-biel)
 *   seo:<key>       (Thema oder Ort, z. B. seo:barbier oder seo:nidau)
 *   blog:<key>      (key = deutscher Slug des Beitrags)
 * Interne Links werden automatisch in die richtige Sprache übersetzt.
 */
export type Markdown = string;

export type BlogPost = {
  key: string; // = deutscher Slug
  slug: L;
  date: string; // YYYY-MM-DD
  image: string; // Pfad unter /public, z. B. /images/cut-mulet.jpg
  title: L;
  description: L; // Meta-Beschreibung, max. 155 Zeichen
  body: L<Markdown>;
};

export type Faq = { q: string; a: string };

export type SeoTopic = {
  key: string;
  slug: L;
  h1: L;
  title: L; // Meta-Titel, max. 60 Zeichen
  description: L; // max. 155 Zeichen
  intro: L;
  body: L<Markdown>;
  faq: L<Faq[]>;
  services: string[]; // Service-Keys, die auf der Seite gezeigt werden
};

export type SeoPlace = {
  key: string;
  name: L;
  slug: L;
  km: number; // Distanz zum Salon (Strasse, gerundet)
  title: L;
  description: L;
  h1: L;
  intro: L;
  body: L<Markdown>;
  neighbors: string[]; // andere Place-Keys
};
