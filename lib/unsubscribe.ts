import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/content/site";
import { getSql } from "./db";

/**
 * Abmeldung von freiwilligen E-Mails (Dank nach dem Besuch mit Bewertungsbitte, Geburtstagsgruss).
 * Termin-Mails (Bestätigung, Erinnerung, Storno, Code) gehen immer raus, die braucht der Kunde.
 * Der Link ist mit ADMIN_SECRET signiert, damit niemand fremde Adressen abmelden kann.
 * Gmail/Yahoo/Apple zeigen dank List-Unsubscribe einen «Abmelden»-Knopf statt «Spam melden».
 */
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "gyan-local-secret";
const norm = (email: string) => email.trim().toLowerCase();
const sign = (email: string) => createHmac("sha256", secret()).update(`optout:${norm(email)}`).digest("base64url").slice(0, 24);

export function unsubscribeUrl(email: string) {
  return `${site.url}/api/abmelden?e=${encodeURIComponent(norm(email))}&t=${sign(email)}`;
}

export function checkUnsubscribeToken(email: string, token: string) {
  const a = Buffer.from(token);
  const b = Buffer.from(sign(email));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Header für die Mail: Ein-Klick-Abmeldung nach RFC 8058 plus mailto als Rückfall */
export function unsubscribeHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(email)}>, <mailto:${site.email}?subject=Abmelden%20${encodeURIComponent(norm(email))}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

export async function optOut(email: string) {
  const sql = await getSql();
  await sql`INSERT INTO email_optout (email) VALUES (${norm(email)}) ON CONFLICT (email) DO NOTHING`;
}

export async function isOptedOut(email: string) {
  try {
    const sql = await getSql();
    const rows = await sql`SELECT 1 FROM email_optout WHERE email = ${norm(email)}`;
    return rows.length > 0;
  } catch (e) {
    console.error("[GYAN] Abmeldeliste nicht lesbar:", e);
    return false;
  }
}
