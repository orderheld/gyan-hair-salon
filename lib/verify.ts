import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { getSql } from "./db";

/**
 * E-Mail-Prüfung mit 6-stelligem Code:
 * - Code ist 10 Minuten gültig, höchstens 5 Eingabeversuche
 * - höchstens 5 Codes pro Stunde und Adresse, frühestens alle 30 Sekunden ein neuer
 * - danach merkt sich der Browser die bestätigte Adresse 180 Tage (signiertes Cookie)
 */
export const VERIFIED_COOKIE = "gyan_mail";
export const VERIFIED_MAX_AGE = 60 * 60 * 24 * 180;
const CODE_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
export const RESEND_SECONDS = 30;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "gyan-local-secret";
const hmac = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");
const same = (a: string, b: string) => {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
};

export type CodeRequest = { ok: true; code: string } | { ok: false; reason: "wait" | "tooMany"; seconds?: number };

export async function createCode(email: string): Promise<CodeRequest> {
  const sql = await getSql();
  const [row] = await sql`
    SELECT sends, extract(epoch FROM now() - window_start) AS window_age, extract(epoch FROM now() - last_sent_at) AS since
    FROM email_codes WHERE email = ${email}`;
  const fresh = !row || Number(row.window_age) > 3600;
  if (row && Number(row.since) < RESEND_SECONDS) return { ok: false, reason: "wait", seconds: Math.ceil(RESEND_SECONDS - Number(row.since)) };
  if (row && !fresh && Number(row.sends) >= MAX_SENDS_PER_HOUR) return { ok: false, reason: "tooMany" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = hmac(`${email}:${code}`);
  const minutes = String(CODE_MINUTES);
  if (fresh) {
    await sql`
      INSERT INTO email_codes (email, code_hash, expires_at, attempts, sends, window_start, last_sent_at)
      VALUES (${email}, ${hash}, now() + (${minutes} || ' minutes')::interval, 0, 1, now(), now())
      ON CONFLICT (email) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at,
        attempts = 0, sends = 1, window_start = now(), last_sent_at = now()`;
  } else {
    await sql`
      UPDATE email_codes SET code_hash = ${hash}, expires_at = now() + (${minutes} || ' minutes')::interval,
        attempts = 0, sends = sends + 1, last_sent_at = now()
      WHERE email = ${email}`;
  }
  return { ok: true, code };
}

export type CodeCheck = "ok" | "wrong" | "expired" | "tooMany";

export async function checkCode(email: string, code: string): Promise<CodeCheck> {
  const sql = await getSql();
  const [row] = await sql`SELECT code_hash, attempts, expires_at < now() AS expired FROM email_codes WHERE email = ${email}`;
  if (!row || row.expired) return "expired";
  if (Number(row.attempts) >= MAX_ATTEMPTS) return "tooMany";
  if (/^\d{6}$/.test(code) && same(String(row.code_hash), hmac(`${email}:${code}`))) {
    // Code verbrauchen, Zähler fürs Senden bleiben bestehen
    await sql`UPDATE email_codes SET expires_at = now(), attempts = ${MAX_ATTEMPTS} WHERE email = ${email}`;
    return "ok";
  }
  await sql`UPDATE email_codes SET attempts = attempts + 1 WHERE email = ${email}`;
  return Number(row.attempts) + 1 >= MAX_ATTEMPTS ? "tooMany" : "wrong";
}

/** Wert fürs Cookie: Adresse (gehasht) + Ablauf + Signatur */
export function verifiedCookieValue(email: string) {
  const expires = String(Math.floor(Date.now() / 1000) + VERIFIED_MAX_AGE);
  const id = hmac(`mail:${email}`).slice(0, 22);
  return `${id}.${expires}.${hmac(`${id}.${expires}`)}`;
}

export function cookieMatches(value: string | undefined, email: string) {
  if (!value) return false;
  const [id, expires, signature] = value.split(".");
  if (!id || !expires || !signature || Number(expires) < Date.now() / 1000) return false;
  return same(id, hmac(`mail:${email}`).slice(0, 22)) && same(signature, hmac(`${id}.${expires}`));
}
