import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE as COOKIE, comingSoon } from "./coming-soon";
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
  (await cookies()).delete(COOKIE);
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
