import services from "@/db/services.json";

/**
 * Bringt die Leistungen einmalig auf die Preisliste aus db/services.json (Stand Oktober 2026).
 * Läuft beim Start, solange settings.catalog_version kleiner ist als CATALOG_VERSION.
 * Version 2 (alles ersetzen):
 * - gleiche Leistung (gleicher deutscher Slug): Name, Texte, Preise und Dauer werden überschrieben
 * - neue Leistungen werden angelegt
 * - alte Leistungen werden gelöscht, oder nur ausgeblendet, wenn schon Termine darauf gebucht sind
 * Danach gehören die Leistungen wieder ganz dem Admin-Panel.
 */
export const CATALOG_VERSION = 3;

type Query = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

export async function syncCatalog(query: Query) {
  const [row] = await query(`SELECT value FROM settings WHERE key = 'catalog_version'`);
  const version = row ? Number(row.value) : 0;
  if (version >= CATALOG_VERSION) return;
  if (version < 2) await replaceAll(query);
  // Version 3: echte Dauer pro Leistung (Oktober 2026), sonst bleibt alles, wie es im Admin steht
  for (const s of services) {
    await query(`UPDATE services SET duration_min = $2 WHERE slug_de = $1`, [s.slug.de, s.duration_min]);
  }
  // Rasur-Text sprach von «einer halben Stunde»
  const shave = services.find((s) => s.slug.de === "nassrasur-biel");
  if (shave) {
    await query(`UPDATE services SET long_de = $2, long_fr = $3, long_en = $4 WHERE slug_de = $1 AND long_de LIKE '%halbe Stunde%'`,
      [shave.slug.de, shave.long.de, shave.long.fr, shave.long.en]);
  }
  await query(
    `INSERT INTO settings (key, value) VALUES ('catalog_version', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now()`,
    [String(CATALOG_VERSION)],
  );
}

async function replaceAll(query: Query) {
  for (const s of services) {
    await query(
      `INSERT INTO services (slug_de, slug_fr, slug_en, name_de, name_fr, name_en, short_de, short_fr, short_en,
         long_de, long_fr, long_en, image, duration_min, price_chf, price_from, active, sort, walkin_price_chf, category, popular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,false,true,$16,$17,$18,$19)
       ON CONFLICT (slug_de) DO UPDATE SET slug_fr = excluded.slug_fr, slug_en = excluded.slug_en,
         name_de = excluded.name_de, name_fr = excluded.name_fr, name_en = excluded.name_en,
         short_de = excluded.short_de, short_fr = excluded.short_fr, short_en = excluded.short_en,
         long_de = excluded.long_de, long_fr = excluded.long_fr, long_en = excluded.long_en,
         image = excluded.image, duration_min = excluded.duration_min, price_chf = excluded.price_chf,
         price_from = false, active = true, sort = excluded.sort, walkin_price_chf = excluded.walkin_price_chf,
         category = excluded.category, popular = excluded.popular`,
      [s.slug.de, s.slug.fr, s.slug.en, s.name.de, s.name.fr, s.name.en, s.short.de, s.short.fr, s.short.en,
       s.long.de, s.long.fr, s.long.en, s.image, s.duration_min, s.price_chf, s.sort, s.walkin_price_chf, s.category, s.popular],
    );
  }
  const keep = services.map((s) => s.slug.de);
  await query(
    `DELETE FROM services s WHERE NOT (s.slug_de = ANY($1::text[])) AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.service_id = s.id)`,
    [keep],
  );
  await query(`UPDATE services SET active = false WHERE NOT (slug_de = ANY($1::text[]))`, [keep]);
}
