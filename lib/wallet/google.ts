// Google Wallet: «Speichern»-Link (signiertes JWT mit loyaltyClass und loyaltyObject)
// und Aktualisieren der Stempelzahl über die Wallet-API.
// Ohne Server-Abhängigkeiten, damit die Tests es direkt mit Node prüfen können.
import { createSign } from "node:crypto";

export type ServiceAccount = { client_email: string; private_key: string };

export type GoogleCardData = {
  issuerId: string;
  /** stabile, eindeutige Kennung der Karte (nur Buchstaben, Ziffern, _ . -) */
  cardId: string;
  name: string;
  stampsLabel: string;
  stampsValue: string;
  rewardLabel: string;
  rewardValue: string;
  qrValue: string;
  programName: string;
  issuerName: string;
  logoUrl: string;
  siteUrl: string;
};

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

/** JWT mit RS256 signieren (Schlüssel des Google-Dienstkontos) */
export function signJwt(payload: object, privateKey: string): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const signature = createSign("RSA-SHA256").update(`${header}.${body}`).sign(privateKey);
  return `${header}.${body}.${b64url(signature)}`;
}

export const classId = (issuerId: string) => `${issuerId}.gyan_stempelkarte`;
export const objectId = (issuerId: string, cardId: string) => `${issuerId}.${cardId.replace(/[^\w.-]/g, "_")}`;

export function loyaltyClass(d: GoogleCardData) {
  return {
    id: classId(d.issuerId),
    issuerName: d.issuerName,
    programName: d.programName,
    programLogo: { sourceUri: { uri: d.logoUrl }, contentDescription: { defaultValue: { language: "de", value: d.issuerName } } },
    hexBackgroundColor: "#f3ece1",
    countryCode: "CH",
    reviewStatus: "UNDER_REVIEW",
    homepageUri: { uri: d.siteUrl, description: d.issuerName },
  };
}

export function loyaltyObject(d: GoogleCardData) {
  return {
    id: objectId(d.issuerId, d.cardId),
    classId: classId(d.issuerId),
    state: "ACTIVE",
    accountName: d.name,
    accountId: d.cardId,
    loyaltyPoints: { label: d.stampsLabel, balance: { string: d.stampsValue } },
    textModulesData: [{ id: "reward", header: d.rewardLabel, body: d.rewardValue }],
    barcode: { type: "QR_CODE", value: d.qrValue },
  };
}

/** Inhalt des «Save to Google Wallet»-JWT */
export function saveJwtPayload(d: GoogleCardData, account: ServiceAccount, now = Math.floor(Date.now() / 1000)) {
  return {
    iss: account.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: [d.siteUrl],
    payload: { loyaltyClasses: [loyaltyClass(d)], loyaltyObjects: [loyaltyObject(d)] },
  };
}

export function saveUrl(d: GoogleCardData, account: ServiceAccount): string {
  return `https://pay.google.com/gp/v/save/${signJwt(saveJwtPayload(d, account), account.private_key)}`;
}

/** Zugriffstoken fürs Aktualisieren gespeicherter Karten (OAuth mit dem Dienstkonto) */
async function accessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt(
    { iss: account.client_email, scope: "https://www.googleapis.com/auth/wallet_object.issuer", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 },
    account.private_key,
  );
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) throw new Error(`Google OAuth: ${data.error ?? res.status}`);
  return data.access_token;
}

/** Stempelzahl einer schon gespeicherten Karte nachführen (404 = noch nicht gespeichert, ignorieren) */
export async function patchLoyaltyObject(d: GoogleCardData, account: ServiceAccount): Promise<void> {
  const token = await accessToken(account);
  const o = loyaltyObject(d);
  const res = await fetch(`https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(o.id)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ loyaltyPoints: o.loyaltyPoints, textModulesData: o.textModulesData, accountName: o.accountName }),
  });
  if (!res.ok && res.status !== 404) throw new Error(`Google Wallet: ${res.status}`);
}
