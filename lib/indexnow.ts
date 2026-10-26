import "server-only";
import { createHash } from "node:crypto";
import sitemap from "@/app/sitemap";
import { site } from "@/content/site";
import { getSql } from "./db";

/**
 * IndexNow: meldet Bing (und damit Copilot und ChatGPT-Suche), Yandex, Seznam und Naver sofort,
 * wenn sich die Sitemap ändert (neuer Beitrag, neue Leistung, geänderte Seite). Google nutzt IndexNow nicht.
 * Läuft mit den Cron-Jobs, nur auf der Live-Seite, höchstens einmal pro Stunde und nur bei einer Änderung.
 * Der Schlüssel liegt öffentlich unter /<KEY>.txt, so wie IndexNow es verlangt. Fasst keine Kundendaten an.
 */
const KEY = "c4338e62f6b8fef8cf0c405d96388732";

export async function pingIndexNowThrottled() {
  if (process.env.VERCEL_ENV !== "production") return;
  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  const hash = createHash("sha256")
    .update(JSON.stringify(entries.map((e) => [e.url, e.lastModified ?? ""])))
    .digest("hex")
    .slice(0, 16);
  const sql = await getSql();
  const claimed = await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('indexNow', ${JSON.stringify({ hash, at: new Date().toISOString(), urls: urls.length })}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      WHERE settings.value->>'hash' IS DISTINCT FROM EXCLUDED.value->>'hash' AND settings.updated_at < now() - interval '1 hour'
    RETURNING key`;
  if (!claimed.length) return;
  const host = new URL(site.url).host;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${site.url}/${KEY}.txt`, urlList: urls }),
  }).catch((e: Error) => ({ ok: false, status: 0, statusText: e.message }) as const);
  if (!res.ok) {
    // Beim nächsten Lauf (frühestens in einer Stunde) nochmals versuchen
    await sql`UPDATE settings SET value = jsonb_set(value, '{hash}', '""') WHERE key = 'indexNow'`;
    throw new Error(`IndexNow ${res.status} ${res.statusText}`);
  }
}
