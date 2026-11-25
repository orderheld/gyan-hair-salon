/**
 * Handgepflegte Messwerte für Admin → «Für Ferhat», die keine API liefert.
 * Die täglichen Routinen (SEO-Check, Performance-Check) tragen hier neue Werte oben ein:
 * - lighthouse: Lighthouse mobil (Median aus 3 Läufen, Aufwärmlauf verworfen) auf einem Produktions-Build
 * - citations: Verzeichnisse und Backlinks aus gyan/verzeichnisse-backlinks.md mit Stand
 * - seoScore: Gesamtbewertung aus gyan/seo-analyse.md
 */

export type LighthouseRun = { date: string; commit?: string; home: number; booking: number; seo?: number; lcpHome?: string; note?: string };

/** Neueste zuerst */
export const lighthouse: LighthouseRun[] = [
  { date: "2026-11-23", commit: "d322a77", home: 92, booking: 94, seo: 100 },
  { date: "2026-11-19", commit: "d1d80e5", home: 90, booking: 98, seo: 100 },
  { date: "2026-11-16", commit: "d1d80e5", home: 90, booking: 98, seo: 100 },
  { date: "2026-11-12", commit: "e38771f", home: 90, booking: 94, seo: 100 },
  { date: "2026-11-09", commit: "34e8d6f", home: 90, booking: 94, seo: 100 },
  { date: "2026-11-05", commit: "7f02010", home: 91, booking: 95, seo: 100 },
  { date: "2026-11-02", commit: "a8e2125", home: 91, booking: 95, seo: 100, lcpHome: "2,7–3,5 s" },
  { date: "2026-10-29", home: 90, booking: 95 },
  { date: "2026-10-22", home: 91, booking: 92 },
];

export type CitationStatus = "live" | "open" | "check" | "skip";
export type Citation = { id: string; name: string; url: string; status: CitationStatus; link: "citation" | "nofollow" | "follow" | "unclear"; note?: string };

/**
 * Stand der Einträge. «live» = Eintrag existiert mit Link zur Webseite, «check» = existiert, Angaben/Link prüfen,
 * «open» = noch nicht gemacht, «skip» = bewusst nicht.
 */
export const citations: Citation[] = [
  { id: "A1", name: "Google Unternehmensprofil", url: "https://business.google.com", status: "live", link: "citation", note: "4,9 Sterne / 330 Bewertungen (25.11.)" },
  { id: "A2", name: "Apple Business Connect", url: "https://businessconnect.apple.com", status: "open", link: "citation" },
  { id: "A3", name: "Bing Places", url: "https://www.bing.com/forbusiness", status: "open", link: "citation" },
  { id: "A4", name: "local.ch / search.ch", url: "https://customercenter.local.ch/de/update", status: "live", link: "nofollow", note: "Eintrag existiert, aber ohne Link zur Webseite (25.11.): Ferhat soll gyanhairsalon.ch im Customer Center ergänzen" },
  { id: "A5", name: "Instagram @gyan_hair_salon", url: "https://www.instagram.com/gyan_hair_salon/", status: "live", link: "nofollow", note: "Link in Bio auf /de/termin" },
  { id: "A6", name: "Facebook GyanHairSalon", url: "https://www.facebook.com/GyanHairSalon", status: "check", link: "nofollow" },
  { id: "A7", name: "Moneyhouse / Zefix", url: "https://www.moneyhouse.ch/de/company/gyan-salon-inh-ali-4933313481", status: "live", link: "citation" },
  { id: "B1", name: "OpenStreetMap", url: "https://www.openstreetmap.org", status: "open", link: "citation" },
  { id: "B2", name: "TikTok @gyan_hair_salon", url: "https://www.tiktok.com/@gyan_hair_salon", status: "check", link: "nofollow" },
  { id: "B3", name: "Bienne2go", url: "https://www.bienne2go.ch/de/Z13700/laden-anmeldung", status: "open", link: "unclear" },
  { id: "B4", name: "cylex", url: "https://www.cylex-swiss.ch/register-company", status: "open", link: "nofollow" },
  { id: "B5", name: "help.ch", url: "https://www.help.ch/firma/", status: "open", link: "unclear" },
  { id: "B6", name: "Waze", url: "https://www.waze.com/editor", status: "open", link: "citation" },
  { id: "B7", name: "TomTom MapShare", url: "https://www.tomtom.com/mapshare/tools", status: "open", link: "citation" },
  { id: "C1", name: "coiffureSUISSE", url: "https://www.coiffuresuisse.ch/de/services/mitglied-werden", status: "open", link: "follow", note: "Mitgliedschaft, Entscheid offen" },
  { id: "C2", name: "Bieler KMU", url: "https://www.bielerkmu.ch/mitglied-werden", status: "open", link: "follow", note: "CHF 180/Jahr, Entscheid offen" },
  { id: "X1", name: "swissbarbers.ch", url: "https://swissbarbers.ch", status: "check", link: "unclear", note: "Eintrag existiert, verlinkt aber noch die alte localo-Seite (25.11.): «Diesen Ort beanspruchen» und Link auf gyanhairsalon.ch ändern" },
  { id: "X2", name: "gyan-hair-salon.localo.site (alte Seite)", url: "https://gyan-hair-salon.localo.site", status: "check", link: "unclear", note: "Noch bei Google sichtbar, sollte gelöscht werden" },
  { id: "C4", name: "Yelp", url: "https://biz.yelp.com", status: "open", link: "nofollow" },
];

/** Gesamtbewertung SEO (gyan/seo-analyse.md), die tägliche SEO-Routine hält sie aktuell */
export const seoScore = {
  date: "2026-11-25",
  total: 82,
  parts: [
    { name: "Technik (Indexierung, Sitemap, hreflang)", value: 97 },
    { name: "Titel und Beschreibungen", value: 95 },
    { name: "Teilen-Vorschau", value: 95 },
    { name: "Strukturierte Daten", value: 90 },
    { name: "Performance und Cache", value: 85 },
    { name: "Inhalt und Keywords", value: 80 },
    { name: "Lokales SEO (Google-Profil)", value: 60 },
    { name: "Backlinks", value: 25 },
  ],
};
