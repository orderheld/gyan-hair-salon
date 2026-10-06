// Startdaten: Leistungen (aus services.json) und Öffnungszeiten.
// Wird nur eingefügt, wenn noch nichts vorhanden ist.
import { readFile } from "node:fs/promises";
import path from "node:path";

/** @param {(text: string, params?: unknown[]) => Promise<unknown>} query */
export async function seed(query, root = process.cwd()) {
  const services = JSON.parse(await readFile(path.join(root, "db", "services.json"), "utf8"));
  const [{ count }] = /** @type {any[]} */ (await query("SELECT count(*)::int AS count FROM services"));
  if (count === 0) {
    for (const s of services) {
      await query(
        `INSERT INTO services (slug_de, slug_fr, slug_en, name_de, name_fr, name_en, short_de, short_fr, short_en,
           long_de, long_fr, long_en, image, duration_min, price_chf, sort)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [s.slug.de, s.slug.fr, s.slug.en, s.name.de, s.name.fr, s.name.en, s.short.de, s.short.fr, s.short.en,
         s.long.de, s.long.fr, s.long.en, s.image, s.duration_min, s.price_chf, s.sort],
      );
    }
  }
  const hours = [
    [1, true, "09:00", "19:00"], [2, true, "09:00", "19:00"], [3, true, "09:00", "19:00"],
    [4, true, "09:00", "20:00"], [5, true, "09:00", "20:00"], [6, true, "08:30", "18:00"], [0, false, "09:00", "18:00"],
  ];
  for (const h of hours) {
    await query(
      "INSERT INTO opening_hours (weekday, is_open, open_time, close_time) VALUES ($1,$2,$3,$4) ON CONFLICT (weekday) DO NOTHING",
      h,
    );
  }
}

/** Zerlegt eine SQL-Datei in einzelne Anweisungen. */
export function splitSql(text) {
  return text
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
}
