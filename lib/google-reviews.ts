import "server-only";
import { site } from "@/content/site";
import { getSql, type Row } from "./db";
import type { CardCandidate } from "./review-match";

/**
 * Google-Bewertungen für den einmaligen Bewertungs-Stempel.
 * Google sagt nicht, welcher Kunde eine Bewertung geschrieben hat. Darum: Bewertungen regelmässig abrufen,
 * im Admin mit passenden Stempelkarten (Namensähnlichkeit) vorschlagen, der Admin gibt den Stempel mit einem Tipp.
 * Die Sternzahl spielt nirgends eine Rolle: keine Auswahl, kein Filter, keine Sortierung danach.
 *
 * Zugang: Google Business Profile API mit OAuth 2.0. Der Refresh-Token liegt nur in settings.googleReviews
 * und geht nie an eine Seite (siehe PRIVATE_KEYS in lib/settings.ts).
 */

export const GOOGLE_SCOPE = "https://www.googleapis.com/auth/business.manage";
export const STATE_COOKIE = "gyan_google_state";
/** Höchstens so viele Bewertungen pro Abruf (die neusten) */
const MAX_REVIEWS = 200;
/** Automatischer Abruf mit den Cron-Jobs höchstens alle 6 Stunden */
const SYNC_EVERY_HOURS = 6;
/** Beim allerersten Abruf: ältere Bewertungen gleich unter «Erledigt» ablegen (rückgängig machbar) */
const FIRST_SYNC_KEEP_DAYS = 90;

type StoredLocation = { account: string; location: string; title: string; address: string };

type StoredConfig = {
  refreshToken?: string;
  connectedAt?: string;
  accountId?: string;
  locationId?: string;
  locationTitle?: string;
  /** mehrere Standorte gefunden: Auswahl im Admin */
  locations?: StoredLocation[];
  lastSyncAt?: string;
  lastError?: string;
  lastErrorDetail?: string;
};

export type GoogleErrorCode = "auth" | "access" | "api" | "network" | "noLocation";

export type GoogleStatus = {
  /** Client-ID und Secret gesetzt (oder Testmodus) */
  configured: boolean;
  fake: boolean;
  connected: boolean;
  locationTitle: string;
  /** mehrere Standorte, noch keiner gewählt */
  locations: { id: string; title: string; address: string }[];
  lastSyncAt: Date | null;
  lastError: GoogleErrorCode | "";
  lastErrorDetail: string;
};

export class GoogleError extends Error {
  constructor(public code: GoogleErrorCode, detail = "") {
    super(detail || code);
  }
}

/** Nur lokal (GYAN_LOCAL_DB=1) mit GOOGLE_BP_FAKE=1: Test-Bewertungen statt Google */
export const isFakeMode = () => process.env.GYAN_LOCAL_DB === "1" && process.env.GOOGLE_BP_FAKE === "1" && !process.env.DATABASE_URL;

export const isGoogleConfigured = () => isFakeMode() || (!!process.env.GOOGLE_BP_CLIENT_ID && !!process.env.GOOGLE_BP_CLIENT_SECRET);

/** Rücksprung-Adresse: die öffentliche Adresse, lokal (localhost) die Adresse der Anfrage */
export function redirectUri(requestOrigin: string) {
  let host = "";
  try {
    host = new URL(requestOrigin).hostname;
  } catch {
    // ungültig: öffentliche Adresse
  }
  const local = host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  const sameAsSite = requestOrigin.replace(/\/$/, "") === site.url;
  return `${local || sameAsSite ? requestOrigin.replace(/\/$/, "") : site.url}/admin/google/callback`;
}

export function authUrl(redirect: string, state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_BP_CLIENT_ID ?? "",
    redirect_uri: redirect,
    response_type: "code",
    scope: GOOGLE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

/* ---------- gespeicherte Verbindung ---------- */

async function readConfig(): Promise<StoredConfig> {
  const sql = await getSql();
  const [r] = await sql`SELECT value FROM settings WHERE key = 'googleReviews'`;
  return (r?.value ?? {}) as StoredConfig;
}

/** Felder zusammenführen (jsonb ||), damit gleichzeitige Schreibvorgänge nichts anderes überschreiben */
async function mergeConfig(values: Partial<StoredConfig>) {
  const sql = await getSql();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('googleReviews', ${JSON.stringify(values)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = settings.value || EXCLUDED.value, updated_at = now()`;
}

export async function getGoogleStatus(): Promise<GoogleStatus> {
  const c = await readConfig();
  return {
    configured: isGoogleConfigured(),
    fake: isFakeMode(),
    connected: !!c.refreshToken && !!c.locationId,
    locationTitle: c.locationTitle ?? "",
    locations: c.refreshToken && !c.locationId ? (c.locations ?? []).map((l) => ({ id: `${l.account}|${l.location}`, title: l.title, address: l.address })) : [],
    lastSyncAt: c.lastSyncAt ? new Date(c.lastSyncAt) : null,
    lastError: (c.lastError as GoogleErrorCode) ?? "",
    lastErrorDetail: c.lastErrorDetail ?? "",
  };
}

/** Trennen: Zugang und alle gespeicherten Bewertungen löschen. Vergebene Stempel bleiben. */
export async function disconnectGoogle() {
  const c = await readConfig();
  const sql = await getSql();
  await sql`DELETE FROM settings WHERE key IN ('googleReviews', 'googleReviewsSyncedAt')`;
  await sql`DELETE FROM google_reviews`;
  // Zugang auch bei Google widerrufen (wenn es nicht klappt, läuft er ohnehin ins Leere)
  if (c.refreshToken && !isFakeMode()) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(c.refreshToken)}`, { method: "POST", signal: AbortSignal.timeout(8000) }).catch(() => {});
  }
}

/* ---------- Google-Aufrufe ---------- */

async function googleFetch(url: string, init: RequestInit = {}): Promise<Row> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) });
  } catch (e) {
    throw new GoogleError("network", String((e as Error)?.message ?? e).slice(0, 200));
  }
  const text = await res.text();
  let body: Row = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    // kein JSON
  }
  if (!res.ok) {
    const detail = String(body?.error?.message ?? body?.error_description ?? body?.error ?? text).slice(0, 300);
    if (res.status === 400 && body?.error === "invalid_grant") throw new GoogleError("auth", detail);
    if (res.status === 401) throw new GoogleError("auth", detail);
    if (res.status === 403 || res.status === 429) throw new GoogleError("access", `${res.status}: ${detail}`);
    throw new GoogleError("api", `${res.status}: ${detail}`);
  }
  return body;
}

const tokenRequest = (params: Record<string, string>) =>
  googleFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_BP_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_BP_CLIENT_SECRET ?? "", ...params }),
  });

/** Code aus dem Rücksprung gegen Tokens tauschen und den Refresh-Token speichern */
export async function connectWithCode(code: string, redirect: string): Promise<string> {
  const t = await tokenRequest({ code, redirect_uri: redirect, grant_type: "authorization_code" });
  const refreshToken = String(t.refresh_token ?? "");
  if (!refreshToken) throw new GoogleError("auth", "Kein Refresh-Token erhalten");
  // neue Verbindung: alter Standort und alte Bewertungen gelten nicht mehr
  const sql = await getSql();
  await sql`DELETE FROM settings WHERE key IN ('googleReviews', 'googleReviewsSyncedAt')`;
  await sql`DELETE FROM google_reviews`;
  await mergeConfig({ refreshToken, connectedAt: new Date().toISOString() });
  return String(t.access_token ?? "");
}

async function accessToken(refreshToken: string) {
  const t = await tokenRequest({ refresh_token: refreshToken, grant_type: "refresh_token" });
  const token = String(t.access_token ?? "");
  if (!token) throw new GoogleError("auth", "Kein Access-Token erhalten");
  return token;
}

const auth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

/** Alle Standorte aller Konten, auf die der verbundene Google-Zugang Zugriff hat */
async function fetchLocations(token: string): Promise<StoredLocation[]> {
  const out: StoredLocation[] = [];
  let pageToken = "";
  const accounts: string[] = [];
  do {
    const r = await googleFetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=20${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`, auth(token));
    for (const a of (r.accounts ?? []) as Row[]) if (a.name) accounts.push(String(a.name));
    pageToken = String(r.nextPageToken ?? "");
  } while (pageToken && accounts.length < 100);
  for (const account of accounts.slice(0, 20)) {
    let locToken = "";
    do {
      const r = await googleFetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?readMask=name,title,storefrontAddress&pageSize=100${locToken ? `&pageToken=${encodeURIComponent(locToken)}` : ""}`,
        auth(token),
      );
      for (const l of (r.locations ?? []) as Row[]) {
        const a = (l.storefrontAddress ?? {}) as Row;
        out.push({
          account: String(account).replace(/^accounts\//, ""),
          location: String(l.name ?? "").replace(/^locations\//, ""),
          title: String(l.title ?? "").slice(0, 120),
          address: [...((a.addressLines ?? []) as string[]), [a.postalCode, a.locality].filter(Boolean).join(" ")].filter(Boolean).join(", ").slice(0, 160),
        });
      }
      locToken = String(r.nextPageToken ?? "");
    } while (locToken && out.length < 200);
  }
  return out.filter((l) => l.account && l.location);
}

/**
 * Nach dem Verbinden: Standorte holen. Genau einer: gleich wählen und abrufen.
 * Mehrere: zur Auswahl speichern. Gibt zurück, ob noch eine Auswahl nötig ist.
 */
export async function setupLocations(token?: string): Promise<"ready" | "choose"> {
  const c = await readConfig();
  if (!c.refreshToken) throw new GoogleError("auth");
  const list = await fetchLocations(token || (await accessToken(c.refreshToken)));
  if (!list.length) throw new GoogleError("noLocation");
  if (list.length === 1) {
    await chooseLocation(`${list[0].account}|${list[0].location}`, list);
    return "ready";
  }
  await mergeConfig({ locations: list });
  return "choose";
}

export async function chooseLocation(id: string, list?: StoredLocation[]) {
  const options = list ?? (await readConfig()).locations ?? [];
  const pick = options.find((l) => `${l.account}|${l.location}` === id);
  if (!pick) return false;
  await mergeConfig({ accountId: pick.account, locationId: pick.location, locationTitle: pick.title, locations: [] });
  return true;
}

/** Testmodus: Verbindung ohne Google vortäuschen */
export async function connectFake() {
  if (!isFakeMode()) return;
  await mergeConfig({ refreshToken: "fake", connectedAt: new Date().toISOString(), accountId: "fake", locationId: "fake", locationTitle: "GYAN Hair Salon (Test)", locations: [] });
}

/* ---------- Abrufen ---------- */

type FetchedReview = { id: string; name: string; stars: string; comment: string; createTime: string; updateTime: string };

async function fetchReviews(c: StoredConfig): Promise<FetchedReview[]> {
  const token = await accessToken(c.refreshToken!);
  const out: FetchedReview[] = [];
  let pageToken = "";
  do {
    const r = await googleFetch(
      `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(c.accountId!)}/locations/${encodeURIComponent(c.locationId!)}/reviews?pageSize=50${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
      auth(token),
    );
    for (const v of (r.reviews ?? []) as Row[]) {
      const id = String(v.reviewId ?? String(v.name ?? "").split("/").pop() ?? "");
      if (!id) continue;
      out.push({
        id,
        name: String(v.reviewer?.displayName ?? ""),
        stars: String(v.starRating ?? ""),
        comment: String(v.comment ?? ""),
        createTime: String(v.createTime ?? ""),
        updateTime: String(v.updateTime ?? v.createTime ?? ""),
      });
    }
    pageToken = String(r.nextPageToken ?? "");
  } while (pageToken && out.length < MAX_REVIEWS);
  return out.slice(0, MAX_REVIEWS);
}

/** Test-Bewertungen (nur lokal): Namen wie bei vorhandenen Karten, damit Vorschläge sichtbar werden */
async function fakeReviews(): Promise<FetchedReview[]> {
  const sql = await getSql();
  const cards = await sql`SELECT name FROM loyalty_cards WHERE name <> '' ORDER BY id LIMIT 3`;
  const names = cards.map((r) => String(r.name));
  const day = (n: number) => new Date(Date.now() - n * 86400_000).toISOString();
  const first = (n: string) => n.split(" ")[0];
  const lastInitial = (n: string) => {
    const parts = n.split(" ");
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : n;
  };
  return [
    { id: "fake-1", name: names[0] ? names[0].toUpperCase() : "Lukas Meier", stars: "FIVE", comment: "Super Haarschnitt, sehr freundlich. Komme gerne wieder!", createTime: day(0.2), updateTime: day(0.2) },
    { id: "fake-2", name: names[1] ? lastInitial(names[1]) : "Sarah K.", stars: "TWO", comment: "Musste etwas warten, Schnitt war aber in Ordnung.", createTime: day(1), updateTime: day(1) },
    { id: "fake-3", name: names[2] ? first(names[2]) : "Nora", stars: "FOUR", comment: "", createTime: day(3), updateTime: day(3) },
    { id: "fake-4", name: "Maximilian Unbekannt", stars: "THREE", comment: "Très bon service, merci !", createTime: day(5), updateTime: day(5) },
    { id: "fake-5", name: "Ältere Bewertung", stars: "FIVE", comment: "Vor langer Zeit geschrieben.", createTime: day(200), updateTime: day(200) },
  ];
}

const toTs = (v: string) => (v && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);

/** Bewertungen abrufen und speichern. Bekannte Bewertungen behalten ihren Status (neu, gestempelt, keine Zuordnung). */
export async function syncGoogleReviews(): Promise<{ fetched: number; added: number }> {
  const c = await readConfig();
  if (!isGoogleConfigured() || !c.refreshToken || !c.accountId || !c.locationId) return { fetched: 0, added: 0 };
  const sql = await getSql();
  try {
    const list = isFakeMode() ? await fakeReviews() : await fetchReviews(c);
    const [{ n: before }] = await sql`SELECT count(*)::int AS n FROM google_reviews`;
    const firstSync = Number(before) === 0 && !c.lastSyncAt;
    const cutoff = Date.now() - FIRST_SYNC_KEEP_DAYS * 86400_000;
    let added = 0;
    for (const r of list) {
      const created = toTs(r.createTime);
      const old = firstSync && created && Date.parse(created) < cutoff;
      const rows = await sql`
        INSERT INTO google_reviews (review_id, reviewer_name, star_rating, comment, create_time, update_time, status, handled_at)
        VALUES (${r.id.slice(0, 200)}, ${r.name.slice(0, 120)}, ${r.stars.slice(0, 20)}, ${r.comment.slice(0, 600)}, ${created}::timestamptz, ${toTs(r.updateTime)}::timestamptz,
                ${old ? "dismissed" : "new"}, ${old ? new Date().toISOString() : null}::timestamptz)
        ON CONFLICT (review_id) DO UPDATE SET reviewer_name = EXCLUDED.reviewer_name, star_rating = EXCLUDED.star_rating,
          comment = EXCLUDED.comment, update_time = EXCLUDED.update_time, fetched_at = now()
        RETURNING (xmax = 0) AS inserted`;
      if (rows[0]?.inserted && !old) added++;
    }
    await mergeConfig({ lastSyncAt: new Date().toISOString(), lastError: "", lastErrorDetail: "" });
    return { fetched: list.length, added };
  } catch (e) {
    const code: GoogleErrorCode = e instanceof GoogleError ? e.code : "api";
    await mergeConfig({ lastError: code, lastErrorDetail: String((e as Error)?.message ?? "").slice(0, 300) });
    throw e instanceof GoogleError ? e : new GoogleError("api", String((e as Error)?.message ?? e));
  }
}

/** Mit den Cron-Jobs: nur wenn verbunden und höchstens alle 6 Stunden (atomar reserviert, nie doppelt) */
export async function syncGoogleReviewsThrottled() {
  if (!isGoogleConfigured()) return;
  const c = await readConfig();
  if (!c.refreshToken || !c.locationId) return;
  const sql = await getSql();
  const claimed = await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('googleReviewsSyncedAt', ${JSON.stringify(new Date().toISOString())}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      WHERE settings.updated_at < now() - make_interval(hours => ${SYNC_EVERY_HOURS}::int)
    RETURNING key`;
  if (!claimed.length) return;
  await syncGoogleReviews();
}

/* ---------- Liste und Zuordnung ---------- */

export type ReviewStatus = "new" | "stamped" | "dismissed";

export type StoredReview = {
  id: string;
  reviewerName: string;
  /** Sternzahl nur zur Anzeige (1 bis 5, 0 unbekannt), beeinflusst nichts */
  stars: number;
  comment: string;
  createdAt: Date | null;
  status: ReviewStatus;
  handledAt: Date | null;
  card: { id: number; name: string; token: string } | null;
};

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const toDate = (v: unknown) => (v == null ? null : v instanceof Date ? v : new Date(String(v)));

const mapReview = (r: Row): StoredReview => ({
  id: String(r.review_id),
  reviewerName: String(r.reviewer_name ?? ""),
  stars: STARS[String(r.star_rating)] ?? 0,
  comment: String(r.comment ?? ""),
  createdAt: toDate(r.create_time),
  status: r.status as ReviewStatus,
  handledAt: toDate(r.handled_at),
  card: r.card_id ? { id: Number(r.card_id), name: String(r.card_name || r.card_key || ""), token: String(r.card_token ?? "") } : null,
});

/** Neue Bewertungen (neueste zuerst) und erledigte (zuletzt erledigt zuerst) */
export async function listGoogleReviews(): Promise<{ fresh: StoredReview[]; done: StoredReview[] }> {
  const sql = await getSql();
  const [fresh, done] = await Promise.all([
    sql`SELECT g.* FROM google_reviews g WHERE g.status = 'new' ORDER BY g.create_time DESC NULLS LAST LIMIT 100`,
    sql`SELECT g.*, c.name AS card_name, c.customer_key AS card_key, c.token AS card_token
        FROM google_reviews g LEFT JOIN loyalty_cards c ON c.id = g.card_id
        WHERE g.status <> 'new' ORDER BY g.handled_at DESC NULLS LAST, g.create_time DESC LIMIT 100`,
  ]);
  return { fresh: fresh.map(mapReview), done: done.map(mapReview) };
}

export async function getGoogleReview(id: string): Promise<StoredReview | null> {
  const sql = await getSql();
  const [r] = await sql`SELECT * FROM google_reviews WHERE review_id = ${id}`;
  return r ? mapReview(r) : null;
}

/** Bewertung für eine Karte reservieren (nur wenn noch neu). false = schon erledigt. */
export async function claimReview(id: string, cardId: number) {
  const sql = await getSql();
  const rows = await sql`UPDATE google_reviews SET status = 'stamped', card_id = ${cardId}, handled_at = now()
                         WHERE review_id = ${id} AND status = 'new' RETURNING review_id`;
  return rows.length > 0;
}

/** Reservierung zurücknehmen, wenn der Stempel nicht gebucht werden konnte */
export async function releaseReview(id: string) {
  const sql = await getSql();
  await sql`UPDATE google_reviews SET status = 'new', card_id = NULL, handled_at = NULL WHERE review_id = ${id} AND status = 'stamped'`;
}

export async function dismissReview(id: string) {
  const sql = await getSql();
  const rows = await sql`UPDATE google_reviews SET status = 'dismissed', card_id = NULL, handled_at = now() WHERE review_id = ${id} AND status = 'new' RETURNING review_id`;
  return rows.length > 0;
}

export async function undoDismiss(id: string) {
  const sql = await getSql();
  const rows = await sql`UPDATE google_reviews SET status = 'new', handled_at = NULL WHERE review_id = ${id} AND status = 'dismissed' RETURNING review_id`;
  return rows.length > 0;
}

/* ---------- Karten für die Vorschläge ---------- */

/** Alle Karten mit Name, E-Mail und ob der Bewertungs-Stempel schon vergeben ist */
export async function listCardCandidates(): Promise<CardCandidate[]> {
  const sql = await getSql();
  const rows = await sql`
    SELECT c.id, c.name, c.customer_key, c.token,
           EXISTS (SELECT 1 FROM loyalty_stamps s WHERE s.card_id = c.id AND s.kind = 'review') AS review_given
    FROM loyalty_cards c`;
  return rows.map((r) => ({ id: Number(r.id), name: String(r.name ?? ""), email: String(r.customer_key), token: String(r.token), reviewGiven: !!r.review_given }));
}
