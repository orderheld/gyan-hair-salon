import "server-only";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { fill, getDict } from "@/lib/i18n";
import { cardQrPayload } from "@/lib/loyalty-qr";
import { freeNth } from "@/lib/loyalty-text";
import type { CardState } from "@/lib/loyalty";
import { patchLoyaltyObject, saveUrl, type GoogleCardData, type ServiceAccount } from "./google";
import { buildPkpass } from "./pkpass";

/**
 * Apple Wallet und Google Wallet sind freiwillig: Die Knöpfe erscheinen nur, wenn die Umgebungsvariablen gesetzt sind.
 * Variablen: APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_PASS_CERT_P12_BASE64, APPLE_PASS_CERT_PASSWORD, APPLE_WWDR_CERT_BASE64;
 * GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_JSON (JSON oder Base64).
 */
const env = (name: string) => (process.env[name] ?? "").trim();

export const appleWalletEnabled = () =>
  !!(env("APPLE_PASS_TYPE_ID") && env("APPLE_TEAM_ID") && env("APPLE_PASS_CERT_P12_BASE64") && env("APPLE_WWDR_CERT_BASE64"));

function googleAccount(): ServiceAccount | null {
  const raw = env("GOOGLE_WALLET_SERVICE_ACCOUNT_JSON");
  if (!raw || !env("GOOGLE_WALLET_ISSUER_ID")) return null;
  try {
    // als JSON oder Base64-JSON
    const json = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8")) as ServiceAccount;
    return json.client_email && json.private_key ? json : null;
  } catch {
    console.error("[GYAN] GOOGLE_WALLET_SERVICE_ACCOUNT_JSON ist kein gültiges JSON");
    return null;
  }
}

export const googleWalletEnabled = () => !!googleAccount();

function texts(state: CardState, locale: Locale) {
  const t = getDict(locale).loyalty;
  const needed = state.settings.stampsNeeded;
  return {
    t,
    stampsValue: `${state.onCard} / ${needed}`,
    rewardValue: state.rewardsAvailable ? t.walletRewardReady : fill(t.walletRewardNone, { n: needed - state.onCard }),
    back: fill(t.walletBack, { nth: freeNth(needed, locale) }),
  };
}

/** Bilder der Karte von der eigenen Webseite (funktioniert lokal und auf Vercel gleich) */
async function passImages(origin: string) {
  const load = async (path: string) => {
    const res = await fetch(new URL(path, origin));
    if (!res.ok) throw new Error(`Bild fehlt: ${path}`);
    return Buffer.from(await res.arrayBuffer());
  };
  const [icon, icon2x, logo] = await Promise.all([load("/icons/favicon-48.png"), load("/icons/apple-touch-icon.png"), load("/brand/logo-email.png")]);
  return { "icon.png": icon, "icon@2x.png": icon2x, "logo.png": logo, "logo@2x.png": logo };
}

export function applePassJson(state: CardState, locale: Locale) {
  const { t, stampsValue, rewardValue, back } = texts(state, locale);
  const qr = cardQrPayload(state.card.token);
  return {
    formatVersion: 1,
    passTypeIdentifier: env("APPLE_PASS_TYPE_ID"),
    teamIdentifier: env("APPLE_TEAM_ID"),
    serialNumber: `gyan-${state.card.id}-${state.card.refCode}`,
    organizationName: site.name,
    description: t.title,
    logoText: site.name,
    foregroundColor: "rgb(20, 18, 16)",
    labelColor: "rgb(107, 91, 75)",
    backgroundColor: "rgb(243, 236, 225)",
    storeCard: {
      primaryFields: [{ key: "stamps", label: t.walletStamps, value: stampsValue }],
      secondaryFields: [
        { key: "name", label: t.yourCard, value: state.card.name || state.card.customerKey },
        { key: "reward", label: t.walletReward, value: rewardValue },
      ],
      backFields: [
        { key: "rules", label: t.title, value: back },
        { key: "address", label: site.name, value: `${site.address.street}, ${site.address.zip} ${site.address.city} · ${site.phone}` },
      ],
    },
    barcodes: [{ format: "PKBarcodeFormatQR", message: qr, messageEncoding: "iso-8859-1", altText: state.card.refCode }],
    barcode: { format: "PKBarcodeFormatQR", message: qr, messageEncoding: "iso-8859-1", altText: state.card.refCode },
  };
}

export async function applePass(state: CardState, locale: Locale, origin: string): Promise<Buffer> {
  return buildPkpass({
    pass: applePassJson(state, locale),
    images: await passImages(origin),
    p12Base64: env("APPLE_PASS_CERT_P12_BASE64"),
    p12Password: process.env.APPLE_PASS_CERT_PASSWORD ?? "",
    wwdrBase64: env("APPLE_WWDR_CERT_BASE64"),
  });
}

function googleData(state: CardState, locale: Locale): GoogleCardData {
  const { t, stampsValue, rewardValue } = texts(state, locale);
  return {
    issuerId: env("GOOGLE_WALLET_ISSUER_ID"),
    cardId: `gyan_${state.card.id}_${state.card.refCode}`,
    name: state.card.name || state.card.customerKey,
    stampsLabel: t.walletStamps,
    stampsValue,
    rewardLabel: t.walletReward,
    rewardValue,
    qrValue: cardQrPayload(state.card.token),
    programName: t.title,
    issuerName: site.name,
    logoUrl: `${site.url}/icons/app-512.png`,
    siteUrl: site.url,
  };
}

export function googleSaveUrl(state: CardState, locale: Locale): string | null {
  const account = googleAccount();
  return account ? saveUrl(googleData(state, locale), account) : null;
}

/** Nach jedem Stempel: gespeicherte Google-Karte nachführen (Fehler nur loggen) */
export async function syncGoogleWallet(state: CardState, locale: Locale = "de") {
  const account = googleAccount();
  if (!account) return;
  await patchLoyaltyObject(googleData(state, locale), account).catch((e) => console.error("[GYAN] Google Wallet:", e instanceof Error ? e.message : e));
}
