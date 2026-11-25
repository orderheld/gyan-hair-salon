import "server-only";
import { site } from "@/content/site";
import { getSql, type Row } from "./db";
import { accessToken, auth, googleFetch, GoogleError, isFakeMode, readConfig } from "./google-reviews";
import { addDays, toDateKey } from "./time";

/**
 * Google Search Console: wofür die Webseite bei Google erscheint (Suchbegriffe, Klicks, Impressionen, Ø Position).
 * Nutzt denselben Google-Zugang wie die Bewertungen (Admin → Stempelkarte → Bewertungen → «Mit Google verbinden»).
 * Ergebnis wird 6 Stunden in settings.searchConsole zwischengespeichert, damit der Admin schnell bleibt.
 */

const REFRESH_HOURS = 6;
const DAYS = 28;

export type ScRow = { key: string; clicks: number; impressions: number; ctr: number; position: number };

export type SearchConsoleData = {
  state: "ok" | "notConnected" | "noScope" | "noSite" | "error";
  site?: string;
  from?: string;
  to?: string;
  at?: string;
  totals?: { clicks: number; impressions: number; ctr: number; position: number };
  queries?: ScRow[];
  pages?: ScRow[];
  error?: string;
};

const row = (r: Row): ScRow => ({
  key: String(r.keys?.[0] ?? ""),
  clicks: Number(r.clicks ?? 0),
  impressions: Number(r.impressions ?? 0),
  ctr: Number(r.ctr ?? 0),
  position: Number(r.position ?? 0),
});

async function readCache(): Promise<SearchConsoleData | null> {
  const sql = await getSql();
  const [r] = await sql`SELECT value FROM settings WHERE key = 'searchConsole'`;
  return (r?.value as SearchConsoleData) ?? null;
}

async function writeCache(data: SearchConsoleData) {
  const sql = await getSql();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('searchConsole', ${JSON.stringify(data)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

/** Passende Property finden: Domain-Property zuerst, sonst die www-Adresse */
async function findSite(token: string): Promise<string> {
  const r = await googleFetch("https://www.googleapis.com/webmasters/v3/sites", auth(token));
  const host = new URL(site.url).hostname.replace(/^www\./, "");
  const list = ((r.siteEntry ?? []) as Row[]).map((e) => String(e.siteUrl ?? "")).filter((u) => u.includes(host));
  return list.find((u) => u.startsWith("sc-domain:")) ?? list.find((u) => u.includes("://www.")) ?? list[0] ?? "";
}

async function query(token: string, siteUrl: string, from: string, to: string, dimensions: string[], rowLimit: number) {
  const r = await googleFetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { ...auth(token).headers, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate: from, endDate: to, dimensions, rowLimit, dataState: "all" }),
  });
  return ((r.rows ?? []) as Row[]).map(row);
}

async function fetchFresh(): Promise<SearchConsoleData> {
  const c = await readConfig();
  if (!c.refreshToken || isFakeMode()) return { state: "notConnected" };
  try {
    const token = await accessToken(c.refreshToken);
    const siteUrl = await findSite(token);
    if (!siteUrl) return { state: "noSite", at: new Date().toISOString() };
    const to = toDateKey(new Date());
    const from = addDays(to, -(DAYS - 1));
    const [totals, queries, pages] = await Promise.all([
      query(token, siteUrl, from, to, [], 1),
      query(token, siteUrl, from, to, ["query"], 250),
      query(token, siteUrl, from, to, ["page"], 25),
    ]);
    return { state: "ok", site: siteUrl, from, to, at: new Date().toISOString(), totals: totals[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }, queries, pages };
  } catch (e) {
    // fehlende Berechtigung (alte Verbindung ohne Search Console): neu verbinden
    if (e instanceof GoogleError && (e.code === "access" || e.code === "auth")) return { state: "noScope", error: e.message.slice(0, 200), at: new Date().toISOString() };
    return { state: "error", error: String((e as Error)?.message ?? e).slice(0, 200), at: new Date().toISOString() };
  }
}

export async function getSearchConsole(force = false): Promise<SearchConsoleData> {
  const cached = await readCache().catch(() => null);
  const fresh = cached?.at && Date.now() - new Date(cached.at).getTime() < REFRESH_HOURS * 3600_000;
  if (cached && fresh && !force) return cached;
  const data = await fetchFresh();
  if (data.state === "notConnected") return data;
  // bei einem Fehler die letzten guten Zahlen behalten
  if (data.state !== "ok" && cached?.state === "ok") {
    await writeCache({ ...cached, at: data.at });
    return { ...cached, error: data.error };
  }
  await writeCache(data).catch(() => {});
  return data;
}
