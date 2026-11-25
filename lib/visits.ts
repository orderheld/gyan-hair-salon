import "server-only";
import { createHash } from "node:crypto";
import { LOCALES } from "@/content/types";
import { getSql, type Row } from "./db";
import { href } from "./i18n/config";
import { addDays, toDateKey } from "./time";

/**
 * Eigene Besucherstatistik, ohne Google Analytics und ohne Cookies.
 * Pro Seitenaufruf ein Eintrag. Die IP-Adresse wird nie gespeichert: sie fliesst nur in eine
 * Tages-Prüfsumme ein (visitor), die jeden Tag wechselt. So lassen sich Besucher pro Tag zählen,
 * aber niemand über Tage hinweg verfolgen. Land und Ort kommen grob aus dem Vercel-Netz.
 */

export const SOURCES = ["google", "googleAds", "bing", "search", "ai", "instagram", "facebook", "tiktok", "whatsapp", "email", "qr", "app", "referral", "direct"] as const;
export type Source = (typeof SOURCES)[number];

/** Daten nach 14 Monaten löschen */
const KEEP_DAYS = 430;

const SEARCH = /(^|\.)(duckduckgo|yahoo|ecosia|qwant|yandex|startpage|baidu|search\.brave|swisscows)\./;
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|you\.com|mistral\.ai)$/;
const MAIL = /(^|\.)(mail\.|webmail|outlook\.|gmx\.|bluewin\.ch|web\.de|proton\.me)/;

export function classifySource(input: { refHost: string; utmSource: string; utmMedium: string; gclid: boolean; fbclid: boolean; app: boolean }): Source {
  const u = input.utmSource.toLowerCase();
  const m = input.utmMedium.toLowerCase();
  const h = input.refHost;
  if (input.gclid || (u === "google" && /cpc|ppc|paid|ads/.test(m))) return "googleAds";
  if (u) {
    if (u === "qr" || m === "qr") return "qr";
    if (/^(ig|instagram)/.test(u)) return "instagram";
    if (/^(fb|facebook|meta)/.test(u)) return "facebook";
    if (u.startsWith("tiktok")) return "tiktok";
    if (u.startsWith("whatsapp") || u === "wa") return "whatsapp";
    if (m === "email" || u.includes("mail") || u === "newsletter") return "email";
    if (u.startsWith("google") || u === "gbp") return "google";
    if (u.startsWith("bing")) return "bing";
    if (/chatgpt|openai|perplexity|gemini|copilot|claude/.test(u)) return "ai";
  }
  if (h) {
    if (h === "gemini.google.com" || AI.test(h)) return "ai";
    if (/(^|\.)google\.[a-z.]+$/.test(h) || h === "com.google.android.googlequicksearchbox") return "google";
    if (/(^|\.)bing\.com$/.test(h)) return "bing";
    if (SEARCH.test(h)) return "search";
    if (/(^|\.)instagram\.com$/.test(h)) return "instagram";
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/.test(h)) return "facebook";
    if (/(^|\.)tiktok\.com$/.test(h)) return "tiktok";
    if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(h)) return "whatsapp";
    if (MAIL.test(h)) return "email";
    return "referral";
  }
  if (input.fbclid) return "facebook";
  if (input.app) return "app";
  return "direct";
}

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|python|curl|wget|httpclient|scrapy|phantom|puppeteer|playwright/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export function deviceOf(ua: string) {
  if (/iPad|Tablet|Nexus (7|9|10)|SM-T|Kindle|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export function visitorHash(day: string, ip: string, ua: string) {
  const salt = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "gyan";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("base64url").slice(0, 16);
}

export type Hit = {
  path: string;
  locale: string;
  landing: boolean;
  source: Source;
  refHost: string;
  campaign: string;
  country: string;
  region: string;
  city: string;
  device: string;
  visitor: string;
  session: string;
  day: string;
};

export async function recordHit(h: Hit) {
  const sql = await getSql();
  await sql`INSERT INTO visits (day, path, locale, landing, source, ref_host, campaign, country, region, city, device, visitor, session)
            VALUES (${h.day}, ${clip(h.path, 200)}, ${clip(h.locale, 2)}, ${h.landing}, ${h.source}, ${clip(h.refHost, 100)}, ${clip(h.campaign, 80)},
                    ${clip(h.country, 2)}, ${clip(h.region, 10)}, ${clip(h.city, 80)}, ${h.device}, ${h.visitor}, ${clip(h.session, 32)})`;
  // ab und zu alte Einträge löschen
  if (Math.random() < 0.01) await sql`DELETE FROM visits WHERE day < ${addDays(toDateKey(new Date()), -KEEP_DAYS)}`;
}

/* ---------- Auswertung ---------- */

/** Seiten «Termin gebucht» in allen Sprachen */
const BOOKED = LOCALES.map((l) => `${href(l, "booking")}/ok`);

const n = (v: unknown) => Number(v ?? 0);

export type Count = { key: string; visits: number; visitors: number; bookings?: number };

export type VisitStats = {
  from: string;
  to: string;
  days: number;
  totals: { pageviews: number; visits: number; visitors: number; bookings: number; pagesPerVisit: number };
  previous: { pageviews: number; visits: number; visitors: number; bookings: number };
  today: { pageviews: number; visitors: number };
  daily: { day: string; visitors: number; pageviews: number }[];
  sources: Count[];
  referrers: Count[];
  campaigns: Count[];
  countries: Count[];
  cities: (Count & { country: string })[];
  pages: { key: string; pageviews: number; visitors: number }[];
  landings: Count[];
  devices: Count[];
  locales: Count[];
  hours: number[];
  recent: { at: Date; path: string; source: string; refHost: string; city: string; country: string; device: string; pages: number; booked: boolean }[];
  firstDay: string | null;
};

export async function getVisitStats(days: number): Promise<VisitStats> {
  const sql = await getSql();
  const to = toDateKey(new Date());
  const from = addDays(to, -(days - 1));
  const prevFrom = addDays(from, -days);
  const prevTo = addDays(from, -1);

  const range = (a: string, b: string) => sql`
    SELECT count(*) AS pageviews, count(*) FILTER (WHERE landing) AS visits, count(DISTINCT (day, visitor)) AS visitors,
           count(DISTINCT session) FILTER (WHERE path = ANY(${BOOKED})) AS bookings
    FROM visits WHERE day BETWEEN ${a} AND ${b}`;

  // Besuche (Einstieg) nach Merkmal, mit Buchungen aus derselben Sitzung
  const byLanding = (col: "source" | "ref_host" | "campaign" | "country" | "device" | "locale" | "path", limit: number) =>
    sql.query(
      `SELECT v.${col} AS key, count(*) AS visits, count(DISTINCT (v.day, v.visitor)) AS visitors,
              count(*) FILTER (WHERE b.session IS NOT NULL) AS bookings
       FROM visits v
       LEFT JOIN (SELECT DISTINCT session FROM visits WHERE day BETWEEN $1 AND $2 AND path = ANY($3)) b ON b.session = v.session AND v.session <> ''
       WHERE v.landing AND v.day BETWEEN $1 AND $2 ${col === "path" ? "" : `AND v.${col} <> ''`}
       GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`,
      [from, to, BOOKED],
    );

  const [[tot], [prev], [today], daily, sources, referrers, campaigns, countries, cities, pages, landings, devices, locales, hours, recent, [first]] = await Promise.all([
    range(from, to),
    range(prevFrom, prevTo),
    sql`SELECT count(*) AS pageviews, count(DISTINCT visitor) AS visitors FROM visits WHERE day = ${to}`,
    sql`SELECT day::text AS day, count(DISTINCT visitor) AS visitors, count(*) AS pageviews FROM visits WHERE day BETWEEN ${from} AND ${to} GROUP BY 1 ORDER BY 1`,
    byLanding("source", 20),
    byLanding("ref_host", 15),
    byLanding("campaign", 10),
    byLanding("country", 12),
    sql`SELECT city AS key, country, count(*) AS visits, count(DISTINCT (day, visitor)) AS visitors FROM visits
        WHERE landing AND day BETWEEN ${from} AND ${to} AND city <> '' GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`,
    sql`SELECT path AS key, count(*) AS pageviews, count(DISTINCT (day, visitor)) AS visitors FROM visits
        WHERE day BETWEEN ${from} AND ${to} GROUP BY 1 ORDER BY 2 DESC LIMIT 25`,
    byLanding("path", 10),
    byLanding("device", 5),
    byLanding("locale", 5),
    sql`SELECT extract(hour FROM at AT TIME ZONE 'Europe/Zurich')::int AS h, count(*) AS c FROM visits
        WHERE landing AND day BETWEEN ${from} AND ${to} GROUP BY 1`,
    sql`SELECT v.at, v.path, v.source, v.ref_host, v.city, v.country, v.device,
               (SELECT count(*) FROM visits s WHERE s.session = v.session AND s.day = v.day) AS pages,
               EXISTS (SELECT 1 FROM visits s WHERE s.session = v.session AND s.day = v.day AND s.path = ANY(${BOOKED})) AS booked
        FROM visits v WHERE v.landing AND v.session <> '' ORDER BY v.at DESC LIMIT 30`,
    sql`SELECT min(day)::text AS day FROM visits`,
  ]);

  const count = (r: Row): Count => ({ key: String(r.key ?? ""), visits: n(r.visits), visitors: n(r.visitors), bookings: n(r.bookings) });
  const hourList = Array.from({ length: 24 }, () => 0);
  for (const r of hours) hourList[n(r.h)] = n(r.c);

  // fehlende Tage mit 0 auffüllen, damit das Diagramm lückenlos ist
  const byDay = new Map(daily.map((r) => [String(r.day), r]));
  const filled: VisitStats["daily"] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = byDay.get(d);
    filled.push({ day: d, visitors: n(r?.visitors), pageviews: n(r?.pageviews) });
  }

  const visits = n(tot.visits);
  return {
    from,
    to,
    days,
    totals: { pageviews: n(tot.pageviews), visits, visitors: n(tot.visitors), bookings: n(tot.bookings), pagesPerVisit: visits ? n(tot.pageviews) / visits : 0 },
    previous: { pageviews: n(prev.pageviews), visits: n(prev.visits), visitors: n(prev.visitors), bookings: n(prev.bookings) },
    today: { pageviews: n(today.pageviews), visitors: n(today.visitors) },
    daily: filled,
    sources: sources.map(count),
    referrers: referrers.map(count),
    campaigns: campaigns.map(count),
    countries: countries.map(count),
    cities: cities.map((r) => ({ ...count(r), country: String(r.country ?? "") })),
    pages: pages.map((r) => ({ key: String(r.key), pageviews: n(r.pageviews), visitors: n(r.visitors) })),
    landings: landings.map(count),
    devices: devices.map(count),
    locales: locales.map(count),
    hours: hourList,
    recent: recent.map((r) => ({
      at: new Date(r.at),
      path: String(r.path),
      source: String(r.source),
      refHost: String(r.ref_host ?? ""),
      city: String(r.city ?? ""),
      country: String(r.country ?? ""),
      device: String(r.device ?? ""),
      pages: n(r.pages),
      booked: !!r.booked,
    })),
    firstDay: first?.day ?? null,
  };
}

/* ---------- Ladezeiten, Fehler, 404 ---------- */

export async function recordVitals(v: { day: string; path: string; device: string; lcp: number | null; fcp: number | null; inp: number | null; ttfb: number | null; cls: number | null }) {
  if (v.lcp === null && v.fcp === null && v.ttfb === null) return;
  const sql = await getSql();
  await sql`INSERT INTO vitals (day, path, device, lcp, cls, inp, fcp, ttfb) VALUES (${v.day}, ${clip(v.path, 200)}, ${v.device}, ${v.lcp}, ${v.cls}, ${v.inp}, ${v.fcp}, ${v.ttfb})`;
  if (Math.random() < 0.01) await sql`DELETE FROM vitals WHERE day < ${addDays(toDateKey(new Date()), -KEEP_DAYS)}`;
}

export async function recordEvent(e: { day: string; kind: "error" | "404"; path: string; message: string; detail: string; refHost: string; device: string }) {
  const sql = await getSql();
  // Schutz gegen Fluten: höchstens 300 Meldungen pro Tag
  const [c] = await sql`SELECT count(*) AS n FROM site_events WHERE day = ${e.day}`;
  if (n(c?.n) >= 300) return;
  await sql`INSERT INTO site_events (day, kind, path, message, detail, ref_host, device)
            VALUES (${e.day}, ${e.kind}, ${clip(e.path, 200)}, ${clip(e.message, 300)}, ${clip(e.detail, 300)}, ${clip(e.refHost, 100)}, ${e.device})`;
  if (Math.random() < 0.05) await sql`DELETE FROM site_events WHERE day < ${addDays(toDateKey(new Date()), -120)}`;
}

/** Google-Grenzen für «gut» und «schlecht» (75. Perzentil) */
export const VITAL_LIMITS = { lcp: [2500, 4000], inp: [200, 500], cls: [0.1, 0.25], fcp: [1800, 3000], ttfb: [800, 1800] } as const;
export type VitalKey = keyof typeof VITAL_LIMITS;

export type VitalRow = { key: string; samples: number; lcp: number | null; inp: number | null; cls: number | null; fcp: number | null; ttfb: number | null };

export type TechStats = {
  overall: VitalRow[];
  pages: VitalRow[];
  daily: { day: string; lcp: number | null; samples: number }[];
  errors: { message: string; path: string; detail: string; count: number; last: Date }[];
  notFound: { path: string; refHost: string; count: number; last: Date }[];
};

const vital = (r: Row, key: string): VitalRow => ({
  key,
  samples: n(r.samples),
  lcp: r.lcp === null ? null : n(r.lcp),
  inp: r.inp === null ? null : n(r.inp),
  cls: r.cls === null ? null : n(r.cls),
  fcp: r.fcp === null ? null : n(r.fcp),
  ttfb: r.ttfb === null ? null : n(r.ttfb),
});

export async function getTechStats(days: number): Promise<TechStats> {
  const sql = await getSql();
  const to = toDateKey(new Date());
  const from = addDays(to, -(days - 1));
  const p75 = `count(*) AS samples,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY lcp) AS lcp, percentile_cont(0.75) WITHIN GROUP (ORDER BY inp) AS inp,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY cls) AS cls, percentile_cont(0.75) WITHIN GROUP (ORDER BY fcp) AS fcp,
    percentile_cont(0.75) WITHIN GROUP (ORDER BY ttfb) AS ttfb`;
  const [all, byDevice, pages, daily, errors, notFound] = await Promise.all([
    sql.query(`SELECT ${p75} FROM vitals WHERE day BETWEEN $1 AND $2`, [from, to]),
    sql.query(`SELECT device, ${p75} FROM vitals WHERE day BETWEEN $1 AND $2 GROUP BY device ORDER BY 2 DESC`, [from, to]),
    sql.query(`SELECT path, ${p75} FROM vitals WHERE day BETWEEN $1 AND $2 GROUP BY path HAVING count(*) >= 3 ORDER BY lcp DESC NULLS LAST LIMIT 12`, [from, to]),
    sql`SELECT day::text AS day, percentile_cont(0.75) WITHIN GROUP (ORDER BY lcp) AS lcp, count(*) AS samples FROM vitals WHERE day BETWEEN ${from} AND ${to} GROUP BY 1 ORDER BY 1`,
    sql`SELECT message, min(path) AS path, min(detail) AS detail, count(*) AS c, max(at) AS last FROM site_events
        WHERE kind = 'error' AND day BETWEEN ${from} AND ${to} GROUP BY message ORDER BY 4 DESC LIMIT 15`,
    sql`SELECT path, max(ref_host) AS ref_host, count(*) AS c, max(at) AS last FROM site_events
        WHERE kind = '404' AND day BETWEEN ${from} AND ${to} GROUP BY path ORDER BY 3 DESC LIMIT 15`,
  ]);
  const overall = n(all[0]?.samples) ? [vital(all[0], "all"), ...byDevice.map((r) => vital(r, String(r.device)))] : [];
  return {
    overall,
    pages: pages.map((r) => vital(r, String(r.path))),
    daily: daily.map((r) => ({ day: String(r.day), lcp: r.lcp === null ? null : n(r.lcp), samples: n(r.samples) })),
    errors: errors.map((r) => ({ message: String(r.message), path: String(r.path), detail: String(r.detail ?? ""), count: n(r.c), last: new Date(r.last) })),
    notFound: notFound.map((r) => ({ path: String(r.path), refHost: String(r.ref_host ?? ""), count: n(r.c), last: new Date(r.last) })),
  };
}

/* ---------- Buchungen seit dem Start (aus der Termin-Datenbank, rückwirkend vollständig) ---------- */

export type BookingHistory = {
  first: string | null;
  totals: { online: number; admin: number; cancelled: number; customers: number };
  weeks: { week: string; online: number; admin: number; cancelled: number }[];
  byLocale: { key: string; count: number }[];
  byWeekday: number[];
};

export async function getBookingHistory(): Promise<BookingHistory> {
  const sql = await getSql();
  const [[tot], weeks, locales, weekdays] = await Promise.all([
    sql`SELECT min(created_at AT TIME ZONE 'Europe/Zurich')::date::text AS first,
               count(*) FILTER (WHERE source = 'online') AS online, count(*) FILTER (WHERE source = 'admin') AS admin,
               count(*) FILTER (WHERE status = 'cancelled') AS cancelled,
               count(DISTINCT lower(customer_email)) FILTER (WHERE source = 'online' AND customer_email <> '') AS customers
        FROM bookings`,
    sql`SELECT date_trunc('week', created_at AT TIME ZONE 'Europe/Zurich')::date::text AS week,
               count(*) FILTER (WHERE source = 'online') AS online, count(*) FILTER (WHERE source = 'admin') AS admin,
               count(*) FILTER (WHERE status = 'cancelled') AS cancelled
        FROM bookings GROUP BY 1 ORDER BY 1`,
    sql`SELECT locale AS key, count(*) AS c FROM bookings WHERE source = 'online' GROUP BY 1 ORDER BY 2 DESC`,
    sql`SELECT extract(isodow FROM created_at AT TIME ZONE 'Europe/Zurich')::int AS d, count(*) AS c FROM bookings WHERE source = 'online' GROUP BY 1`,
  ]);
  const byWeekday = Array.from({ length: 7 }, () => 0);
  for (const r of weekdays) byWeekday[n(r.d) - 1] = n(r.c);
  return {
    first: tot?.first ?? null,
    totals: { online: n(tot?.online), admin: n(tot?.admin), cancelled: n(tot?.cancelled), customers: n(tot?.customers) },
    weeks: weeks.map((r) => ({ week: String(r.week), online: n(r.online), admin: n(r.admin), cancelled: n(r.cancelled) })),
    byLocale: locales.map((r) => ({ key: String(r.key), count: n(r.c) })),
    byWeekday,
  };
}
