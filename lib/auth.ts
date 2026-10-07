import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE as COOKIE, comingSoon } from "./coming-soon";
import { getSql } from "./db";

const KASSE_COOKIE = "gyan_kasse_pin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
  return s;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

/** Signatur für kurzlebige Werte (z. B. OAuth-State), mit eigenem Präfix getrennt von der Sitzung */
export const signValue = (purpose: string, value: string) => sign(`${purpose}:${value}`);
export const checkSignedValue = (purpose: string, value: string, signature: string) => {
  try {
    return safeEqual(signature, signValue(purpose, value));
  } catch {
    return false;
  }
};

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(sign(input), sign(expected));
}

export async function startSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  const jar = await cookies();
  jar.set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  jar.delete(KASSE_COOKIE);
}

/* Kasse mit PIN wie ein Handy-Sperrbildschirm: nach dem Admin-Login muss für die Kasse
   zusätzlich die 6-stellige PIN eingegeben werden. «Verlassen» sperrt die Kasse wieder. */

const DEFAULT_PIN = "020202";
const PIN_HOURS = 12;
const pinSign = (expires: string, version: string) => sign(`pin:${expires}:${version}`);

type StoredPin = { salt: string; hash: string };

async function storedPin(): Promise<StoredPin | null> {
  const sql = await getSql();
  const [row] = await sql`SELECT value FROM settings WHERE key = 'kassePin'`;
  const v = row?.value as StoredPin | null | undefined;
  return v?.salt && v.hash ? v : null;
}

/** Ändert sich die PIN, werden offene Kassen-Freigaben ungültig */
const pinVersion = (p: StoredPin | null) => (p ? p.hash.slice(0, 12) : "default");

export const isPin = (pin: string) => /^\d{6}$/.test(pin);

export async function setKassePin(pin: string) {
  const sql = await getSql();
  const salt = randomBytes(16).toString("hex");
  const value = JSON.stringify({ salt, hash: scryptSync(pin, salt, 32).toString("hex") });
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('kassePin', ${value}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

/** Prüft die PIN und entsperrt bei Erfolg die Kasse in diesem Browser */
export async function unlockKasse(pin: string): Promise<boolean> {
  if (!isPin(pin)) return false;
  const stored = await storedPin();
  const ok = stored ? safeEqual(scryptSync(pin, stored.salt, 32).toString("hex"), stored.hash) : safeEqual(pin, DEFAULT_PIN);
  if (!ok) return false;
  const expires = String(Math.floor(Date.now() / 1000) + PIN_HOURS * 3600);
  // ohne maxAge: schliesst man den Browser, ist die Kasse wieder gesperrt
  (await cookies()).set(KASSE_COOKIE, `${expires}.${pinSign(expires, pinVersion(stored))}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return true;
}

export async function lockKasse() {
  (await cookies()).delete(KASSE_COOKIE);
}

async function isKasseUnlocked() {
  const value = (await cookies()).get(KASSE_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return safeEqual(signature, pinSign(expires, pinVersion(await storedPin())));
  } catch {
    return false;
  }
}

/** Für alle Seiten und Aktionen der Kasse: Admin-Login und entsperrte Kasse */
export async function requireKasse() {
  await requireAdmin();
  if (!(await isKasseUnlocked())) redirect("/admin/pin");
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return safeEqual(signature, sign(expires));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** Im Coming-soon-Modus dürfen nur eingeloggte Admins buchen oder Zeiten abfragen. */
export async function siteLocked() {
  return comingSoon() && !(await isAdmin());
}
