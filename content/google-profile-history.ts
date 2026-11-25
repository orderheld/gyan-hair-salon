/**
 * Google-Unternehmensprofil (Google Suche und Google Maps), Leistung pro Monat, von Hand aus Ferhats Chrome
 * übernommen (google.com → «Mein Unternehmen» → Leistung). Google zeigt höchstens 6 Monate rückwirkend,
 * darum diese Datei monatlich ergänzen (SEO-Routine), sonst gehen ältere Monate verloren.
 * Der laufende Monat ist unvollständig.
 */

export type ProfileMonth = {
  /** JJJJ-MM */
  month: string;
  interactions: number;
  calls: number;
  directions: number;
  websiteClicks: number;
  chatClicks: number;
};

export const profileHistory = {
  asOf: "2026-11-25",
  months: [
    { month: "2026-06", interactions: 215, calls: 33, directions: 53, websiteClicks: 121, chatClicks: 8 },
    { month: "2026-07", interactions: 308, calls: 37, directions: 80, websiteClicks: 176, chatClicks: 15 },
    { month: "2026-08", interactions: 220, calls: 30, directions: 72, websiteClicks: 109, chatClicks: 9 },
    { month: "2026-09", interactions: 242, calls: 40, directions: 50, websiteClicks: 138, chatClicks: 14 },
    { month: "2026-10", interactions: 351, calls: 15, directions: 95, websiteClicks: 227, chatClicks: 14 },
    { month: "2026-11", interactions: 146, calls: 9, directions: 47, websiteClicks: 90, chatClicks: 0 },
  ] as ProfileMonth[],
  /** Juni bis November 2026 zusammen */
  period: "Juni–Nov. 2026",
  views: { total: 9962, searchMobile: 6352, mapsMobile: 2137, searchDesktop: 1097, mapsDesktop: 376 },
  searches: 3772,
  /** Suchbegriffe, bei denen das Profil gezeigt wurde */
  searchTerms: [["coiffeur bienne", 1251], ["coiffeur biel", 1092], ["coiffeur", 451], ["barber", 135], ["coiffure bienne", 120]] as [string, number][],
};
