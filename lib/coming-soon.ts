/**
 * Coming-soon-Modus: COMING_SOON=1 in Vercel setzen.
 * Besucher sehen dann nur die Seite /bald. Wer im Admin eingeloggt ist
 * (Ferhat, Zana), sieht die ganze Webseite wie gewohnt.
 * Läuft im Proxy, darum Web Crypto statt node:crypto.
 */
export const comingSoon = () => ["1", "true", "on", "yes", "ja"].includes((process.env.COMING_SOON ?? "").replace(/["'\s]/g, "").toLowerCase());

export const ADMIN_COOKIE = "gyan_admin";

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/** Prüft das Admin-Cookie (gleiches Format wie lib/auth.ts). */
export async function hasAdminCookie(value: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!value || !secret) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now() / 1000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(expires)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
