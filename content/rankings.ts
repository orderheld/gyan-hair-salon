/**
 * Google-Platzierungen für die wichtigsten Suchbegriffe, von Hand auf google.ch geprüft
 * (ohne Anmeldung, Standort Biel). Die tägliche SEO-Routine trägt neue Prüfungen oben ein.
 * maps = Platz in der Karte (Local Pack), organic = Platz in den normalen Treffern, null = nicht gefunden.
 * Ist die Search Console verbunden, zeigt der Admin zusätzlich die Durchschnittsposition von Google selbst.
 */

export type RankingCheck = {
  /** JJJJ-MM-TT */
  date: string;
  results: Record<string, { maps?: number | null; organic?: number | null }>;
  note?: string;
};

/** Die wichtigsten Suchbegriffe, in dieser Reihenfolge im Admin */
export const keywords = [
  "coiffeur biel",
  "biel coiffeur",
  "herrencoiffeur biel",
  "barbier biel",
  "barbershop biel",
  "coiffeur bienne",
  "coiffeur homme bienne",
  "coiffeur ohne termin biel",
  "fade biel",
  "gyan hair salon",
];

/** Neueste Prüfung zuerst */
export const rankingChecks: RankingCheck[] = [
  {
    date: "2026-11-25",
    results: {
      "coiffeur biel": { maps: 1 },
      "biel coiffeur": { maps: 3, organic: null },
      "herrencoiffeur biel": { maps: 3, organic: 1 },
      "barbier biel": { maps: null, organic: 5 },
      "coiffeur homme bienne": { maps: null, organic: 3 },
    },
    note: "Geprüft in Ferhats Chrome (angemeldet). Search Console (28 Tage): «coiffeur biel» Ø Position 1,7 · 24 Klicks · 349 Impressionen",
  },
];
