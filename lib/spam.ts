import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsichtbarer Spamschutz für die öffentlichen Formulare (Buchen, Code anfordern, Gutschein, Mein Konto):
 * - Formular-Token: holt der Browser beim Öffnen des Formulars (GET /api/form), signiert mit Zeitstempel.
 *   Bots, die direkt an die API senden, haben keins; wer schneller als MIN_SECONDS absendet, ist kein Mensch.
 * - Honeypot-Feld «website» (in den Routen geprüft)
 * - Links in Namen und Gutschein-Text werden abgelehnt
 * - Rate-Limits pro IP und E-Mail (lib/ratelimit.ts)
 */
const MIN_SECONDS = 3;
const MAX_AGE_SECONDS = 60 * 60 * 24;

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "gyan-local-secret";
const sign = (ts: string) => createHmac("sha256", secret()).update(`form:${ts}`).digest("base64url").slice(0, 22);

export function newFormToken(now = Date.now()) {
  const ts = Math.floor(now / 1000).toString(36);
  return `${ts}.${sign(ts)}`;
}

export type FormTokenCheck = "ok" | "missing" | "invalid" | "fast" | "old";

export function checkFormToken(token: unknown, minSeconds = MIN_SECONDS, now = Date.now()): FormTokenCheck {
  if (typeof token !== "string" || !token) return "missing";
  const [ts, sig] = token.split(".");
  if (!ts || !sig || sig.length !== 22) return "invalid";
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(ts));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  const age = now / 1000 - parseInt(ts, 36);
  if (!Number.isFinite(age) || age < -60) return "invalid";
  if (age < minSeconds) return "fast";
  if (age > MAX_AGE_SECONDS) return "old";
  return "ok";
}

/** Link oder HTML in einem Feld, wo keins hingehört (Name, Gutschein-Text) */
export function hasLink(value: string) {
  return /(https?:\/\/|www\.|<\s*\/?\s*[a-z]|\[url|\b[a-z0-9-]{2,}\.(com|net|org|ru|su|cn|xyz|top|info|biz|online|site|shop|store|click|link|io|co|me|ly|tk|ml|ga|cf|gq|pw|cc|ws|bid|win|loan|vip)\b)/i.test(value);
}

/** Abgelehnten Versuch fürs Vercel-Log notieren (ohne Personendaten) */
export function logSpam(form: string, reason: string) {
  console.warn(`[GYAN] Spam abgewehrt: ${form} (${reason})`);
}
