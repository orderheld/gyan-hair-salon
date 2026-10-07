import "server-only";
import webpush from "web-push";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { customerKey } from "./customers";
import type { Booking } from "./data";
import { getSql } from "./db";
import { href } from "./i18n/config";
import { getSettings } from "./settings";
import { formatShortDate, formatTime, toDateKey } from "./time";

/**
 * Push-Benachrichtigungen (Web Push, ohne App-Store).
 * Schlüssel einmal erzeugen: npx web-push generate-vapid-keys
 * und in Vercel als VAPID_PUBLIC_KEY und VAPID_PRIVATE_KEY eintragen.
 */
const PUBLIC = (process.env.VAPID_PUBLIC_KEY ?? "").trim();
const PRIVATE = (process.env.VAPID_PRIVATE_KEY ?? "").trim();

// Falsch kopierte Schlüssel dürfen nie die Webseite oder das Buchen lahmlegen: dann ist Push einfach aus
function setup() {
  if (!PUBLIC || !PRIVATE) return false;
  try {
    webpush.setVapidDetails(`mailto:${site.email}`, PUBLIC, PRIVATE);
    return true;
  } catch (e) {
    console.error("[GYAN] Push-Schlüssel ungültig, Push ist aus:", e instanceof Error ? e.message : e);
    return false;
  }
}
export const pushEnabled = setup();
export const vapidPublicKey = pushEnabled ? PUBLIC : "";

export type PushSubscriptionJSON = { endpoint: string; keys: { p256dh: string; auth: string } };
type Payload = { title: string; body: string; url: string; tag?: string; actions?: { action: string; title: string; url: string }[] };

export async function savePushSubscription(sub: PushSubscriptionJSON, role: "admin" | "customer", key = "", locale: Locale = "de") {
  const sql = await getSql();
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, role, customer_key, locale)
    VALUES (${sub.endpoint}, ${sub.keys.p256dh}, ${sub.keys.auth}, ${role}, ${key}, ${locale})
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, role = EXCLUDED.role,
      customer_key = CASE WHEN EXCLUDED.role = 'customer' THEN EXCLUDED.customer_key ELSE push_subscriptions.customer_key END,
      locale = EXCLUDED.locale`;
}

export async function removePushSubscription(endpoint: string, role?: "admin" | "customer"): Promise<number> {
  const sql = await getSql();
  const rows = role
    ? await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND role = ${role} RETURNING endpoint`
    : await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} RETURNING endpoint`;
  return rows.length;
}

async function deliver(rows: Record<string, unknown>[], payload: Payload) {
  if (!pushEnabled || !rows.length) return 0;
  const sql = await getSql();
  let sent = 0;
  await Promise.all(
    rows.map(async (r) => {
      try {
        await webpush.sendNotification(
          { endpoint: String(r.endpoint), keys: { p256dh: String(r.p256dh), auth: String(r.auth) } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24, urgency: "high" },
        );
        sent++;
        await sql`UPDATE push_subscriptions SET last_ok_at = now() WHERE endpoint = ${String(r.endpoint)}`;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        // Abo abgelaufen oder vom Nutzer entfernt: aufräumen
        if (status === 404 || status === 410) await sql`DELETE FROM push_subscriptions WHERE endpoint = ${String(r.endpoint)}`;
        else console.error("[GYAN] Push fehlgeschlagen:", status ?? e);
      }
    }),
  );
  return sent;
}

/* ---------- Texte (passend zu den E-Mails) ---------- */
const T = {
  de: {
    confirmed: ["Termin bestätigt ✓", "{service} am {date} um {time} bei {owner}. Wir freuen uns auf dich!"],
    reminder: ["Bald ist es so weit ✂", "{when} um {time}: {service} bei GYAN, {street}. Bis gleich!"],
    followup: ["Danke für deinen Besuch!", "Hat es dir gefallen? Eine kurze Google-Bewertung hilft uns sehr. ⭐"],
    rescheduled: ["Termin geändert", "Neu: {service} am {date} um {time}."],
    cancelled: ["Termin abgesagt", "Dein Termin am {date} um {time} wurde abgesagt. Ruf uns gern an: {phone}"],
    review: "Bewerten",
    insta: "Instagram",
    today: "Heute",
    tomorrow: "Morgen",
  },
  fr: {
    confirmed: ["Rendez-vous confirmé ✓", "{service} le {date} à {time} avec {owner}. Au plaisir de te voir !"],
    reminder: ["C’est bientôt ✂", "{when} à {time} : {service} chez GYAN, {street}. À tout à l’heure !"],
    followup: ["Merci pour ta visite !", "Ça t’a plu ? Un petit avis Google nous aide beaucoup. ⭐"],
    rescheduled: ["Rendez-vous modifié", "Nouveau : {service} le {date} à {time}."],
    cancelled: ["Rendez-vous annulé", "Ton rendez-vous du {date} à {time} a été annulé. Appelle-nous : {phone}"],
    review: "Donner un avis",
    insta: "Instagram",
    today: "Aujourd’hui",
    tomorrow: "Demain",
  },
  en: {
    confirmed: ["Booking confirmed ✓", "{service} on {date} at {time} with {owner}. See you soon!"],
    reminder: ["Almost time ✂", "{when} at {time}: {service} at GYAN, {street}. See you soon!"],
    followup: ["Thanks for your visit!", "Did you like it? A quick Google review helps us a lot. ⭐"],
    rescheduled: ["Booking changed", "New: {service} on {date} at {time}."],
    cancelled: ["Booking cancelled", "Your booking on {date} at {time} was cancelled. Give us a call: {phone}"],
    review: "Write a review",
    insta: "Instagram",
    today: "Today",
    tomorrow: "Tomorrow",
  },
} as const;

type CustomerKind = "confirmed" | "reminder" | "followup" | "rescheduled" | "cancelled";

function fillText(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

async function customerPayload(kind: CustomerKind, b: Booking, locale: Locale): Promise<Payload> {
  const t = T[locale] ?? T.de;
  const s = await getSettings();
  const day = toDateKey(b.startsAt);
  const today = toDateKey(new Date());
  const tomorrow = toDateKey(new Date(Date.now() + 864e5));
  const vars = {
    service: b.serviceName,
    date: formatShortDate(b.startsAt, locale),
    time: formatTime(b.startsAt, locale),
    owner: site.owner,
    street: site.address.street,
    phone: site.phone,
    when: day === today ? t.today : day === tomorrow ? t.tomorrow : formatShortDate(b.startsAt, locale),
  };
  const [title, body] = t[kind];
  const home = href(locale, "home");
  const payload: Payload = { title, body: fillText(body, vars), url: kind === "cancelled" ? href(locale, "booking") : home, tag: `gyan-${b.id}-${kind}` };
  if (kind === "reminder") payload.url = site.address.mapsUrl;
  if (kind === "followup") {
    payload.url = s.reviewUrl;
    payload.actions = [
      { action: "review", title: t.review, url: s.reviewUrl },
      { action: "insta", title: t.insta, url: s.instagramUrl },
    ];
  }
  return payload;
}

/** An alle Geräte des Kunden (verknüpft über E-Mail bzw. Telefon) */
export async function pushToCustomer(kind: CustomerKind, b: Booking) {
  if (!pushEnabled) return 0;
  const key = customerKey(b.customerEmail, b.customerPhone);
  if (!key) return 0;
  const sql = await getSql();
  const rows = await sql`SELECT * FROM push_subscriptions WHERE role = 'customer' AND customer_key = ${key}`;
  let sent = 0;
  for (const locale of new Set(rows.map((r) => String(r.locale)))) {
    const l = (["de", "fr", "en"].includes(locale) ? locale : b.locale) as Locale;
    sent += await deliver(rows.filter((r) => r.locale === locale), await customerPayload(kind, b, l));
  }
  return sent;
}

/** An alle Admin-Geräte (Zana) */
export async function pushToAdmins(kind: "new" | "cancelled", b: Booking) {
  if (!pushEnabled) return 0;
  const sql = await getSql();
  const rows = await sql`SELECT * FROM push_subscriptions WHERE role = 'admin'`;
  const when = `${formatShortDate(b.startsAt, "de")} ${formatTime(b.startsAt, "de")}`;
  const payload: Payload =
    kind === "new"
      ? { title: "Neue Buchung ✂", body: `${b.customerName} · ${b.serviceName} · ${when}`, url: `/admin/termin/${b.id}`, tag: `gyan-admin-${b.id}` }
      : { title: b.lateCancel ? "Zu spät storniert" : "Termin storniert", body: `${b.customerName} · ${b.serviceName} · ${when}`, url: `/admin/termin/${b.id}`, tag: `gyan-admin-${b.id}` };
  return deliver(rows, payload);
}

/** Testnachricht an alle Admin-Geräte */
export async function pushTestToAdmins() {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM push_subscriptions WHERE role = 'admin'`;
  return deliver(rows, { title: "GYAN Admin ✓", body: "Push-Benachrichtigungen sind aktiv. So sieht eine neue Buchung aus.", url: "/admin/kalender", tag: "gyan-admin-test" });
}

export async function countAdminDevices() {
  const sql = await getSql();
  const rows = await sql`SELECT count(*)::int AS n FROM push_subscriptions WHERE role = 'admin'`;
  return Number(rows[0]?.n ?? 0);
}
