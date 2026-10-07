import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE as COOKIE, comingSoon } from "./coming-soon";
import { getSql } from "./db";

const KASSE_COOKIE = "gyan_kasse";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 Tage

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD ist nicht gesetzt.");
  return s;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

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

/* Kassen-Login: eigenes Passwort (im Admin unter Kasse → Einstellungen gesetzt).
   Sieht nur die Kasse und den eben erstellten Beleg, keine Umsätze, Auswertungen oder Kundendaten. */

const kasseSign = (expires: string) => sign(`kasse:${expires}`);

export async function setKassePassword(password: string) {
  const sql = await getSql();
  const salt = randomBytes(16).toString("hex");
  const hash = password ? scryptSync(password, salt, 32).toString("hex") : "";
  const value = JSON.stringify(password ? { salt, hash } : null);
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('kassePassword', ${value}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

export async function hasKassePassword() {
  const sql = await getSql();
  const [row] = await sql`SELECT value FROM settings WHERE key = 'kassePassword'`;
  return Boolean(row?.value?.hash);
}

export async function checkKassePassword(input: string) {
  if (!input) return false;
  const sql = await getSql();
  const [row] = await sql`SELECT value FROM settings WHERE key = 'kassePassword'`;
  const stored = row?.value as { salt?: string; hash?: string } | null;
  if (!stored?.salt || !stored.hash) return false;
  return safeEqual(scryptSync(input, stored.salt, 32).toString("hex"), stored.hash);
}

export async function startKasseSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(KASSE_COOKIE, `${expires}.${kasseSign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

async function isKasse() {
  const value = (await cookies()).get(KASSE_COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return safeEqual(signature, kasseSign(expires));
  } catch {
    return false;
  }
}

export type Role = "admin" | "kasse";

/** Wer ist angemeldet? Der volle Admin geht immer vor. */
export async function getRole(): Promise<Role | null> {
  if (await isAdmin()) return "admin";
  if (await isKasse()) return "kasse";
  return null;
}

/** Für die Kasse: Admin oder Kassen-Login. */
export async function requireKasse(): Promise<Role> {
  const role = await getRole();
  if (!role) redirect("/admin/login");
  return role!;
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
