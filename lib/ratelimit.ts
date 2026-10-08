import "server-only";
import { headers } from "next/headers";
import { getSql } from "./db";

/** IP des Besuchers (Vercel setzt x-forwarded-for), sonst leer */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim().slice(0, 64);
}

/**
 * Zählt einen Versuch für key im Zeitfenster und sagt, ob das Limit überschritten ist.
 * Ein Eintrag pro Schlüssel, das Fenster beginnt nach Ablauf neu.
 */
export async function overLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  if (!key) return false;
  const sql = await getSql();
  const win = String(windowSec);
  const [row] = await sql`
    INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < now() - (${win} || ' seconds')::interval THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < now() - (${win} || ' seconds')::interval THEN now() ELSE rate_limits.window_start END
    RETURNING count`;
  return Number(row?.count ?? 0) > max;
}

/** Zähler zurücksetzen (z. B. nach erfolgreicher Anmeldung) */
export async function clearLimit(key: string) {
  if (!key) return;
  const sql = await getSql();
  await sql`DELETE FROM rate_limits WHERE key = ${key}`;
}
