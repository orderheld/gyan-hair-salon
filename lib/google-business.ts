import "server-only";
import { createHash } from "node:crypto";
import { posts } from "@/content/blog";
import { site } from "@/content/site";
import { getSql } from "./db";
import { postPath } from "./i18n/paths";
import { accessToken, auth, googleFetch, GoogleError, isFakeMode, isGoogleConfigured, readConfig, type StoredConfig } from "./google-reviews";
import { toDateKey } from "./time";

/**
 * Google-Unternehmensprofil von der Webseite aus aktuell halten (gleicher Google-Zugang wie die Bewertungen):
 * - Öffnungszeiten und Webseite aus content/site.ts, nur wenn sich etwas geändert hat.
 * - Journal: jeder neue Beitrag wird einmal als Google-Beitrag gepostet (Text, Foto, Link «Mehr erfahren»).
 * Läuft mit den Cron-Jobs höchstens alle 6 Stunden. Fasst keine Kundendaten an.
 */

const SYNC_EVERY_HOURS = 6;
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

type BusinessState = {
  profileHash?: string;
  profileAt?: string;
  /** deutsche Slugs (post.key) der schon geposteten Beiträge */
  postedKeys?: string[];
  lastPostAt?: string;
  lastPostTitle?: string;
  lastError?: string;
};

async function readState(): Promise<BusinessState> {
  const sql = await getSql();
  const [r] = await sql`SELECT value FROM settings WHERE key = 'googleBusiness'`;
  return (r?.value ?? {}) as BusinessState;
}

async function mergeState(values: Partial<BusinessState>) {
  const sql = await getSql();
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('googleBusiness', ${JSON.stringify(values)}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = settings.value || EXCLUDED.value, updated_at = now()`;
}

const time = (hhmm: string) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return minutes ? { hours, minutes } : { hours };
};

/** Was Google über Öffnungszeiten und Webseite wissen soll */
function profileBody() {
  const periods = site.salonHours
    .filter((h) => h.open && h.close)
    .sort((a, b) => ((a.weekday + 6) % 7) - ((b.weekday + 6) % 7))
    .map((h) => ({ openDay: DAYS[h.weekday], openTime: time(h.open!), closeDay: DAYS[h.weekday], closeTime: time(h.close!) }));
  return { websiteUri: `${site.url}/`, regularHours: { periods } };
}

async function syncProfile(c: StoredConfig, token: string, state: BusinessState) {
  const body = profileBody();
  const hash = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16);
  if (hash === state.profileHash) return;
  await googleFetch(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${encodeURIComponent(c.locationId!)}?updateMask=websiteUri,regularHours`, {
    method: "PATCH",
    headers: { ...auth(token).headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await mergeState({ profileHash: hash, profileAt: new Date().toISOString() });
}

/** Höchstens einen neuen Journal-Beitrag pro Lauf posten. Beim allerersten Lauf nur den neusten, ältere gelten als erledigt. */
async function syncPosts(c: StoredConfig, token: string, state: BusinessState) {
  const today = toDateKey(new Date());
  const live = posts.filter((p) => p.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  const done = new Set(state.postedKeys ?? []);
  const next = live.find((p) => !done.has(p.key));
  if (!next) return;
  await googleFetch(`https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(c.accountId!)}/locations/${encodeURIComponent(c.locationId!)}/localPosts`, {
    method: "POST",
    headers: { ...auth(token).headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      languageCode: "de",
      topicType: "STANDARD",
      summary: `${next.title.de}\n\n${next.description.de}`.slice(0, 1450),
      callToAction: { actionType: "LEARN_MORE", url: `${site.url}${postPath("de", next)}` },
      media: [{ mediaFormat: "PHOTO", sourceUrl: `${site.url}${next.image.replace("/images/", "/og/")}` }],
    }),
  });
  const posted = state.postedKeys ? [...done, next.key] : live.map((p) => p.key);
  await mergeState({ postedKeys: posted, lastPostAt: new Date().toISOString(), lastPostTitle: next.title.de });
}

export async function syncBusinessProfile() {
  if (!isGoogleConfigured() || isFakeMode()) return;
  const c = await readConfig();
  if (!c.refreshToken || !c.accountId || !c.locationId) return;
  const state = await readState();
  try {
    const token = await accessToken(c.refreshToken);
    await syncProfile(c, token, state);
    await syncPosts(c, token, state);
    if (state.lastError) await mergeState({ lastError: "" });
  } catch (e) {
    const detail = e instanceof GoogleError ? `${e.code}: ${e.message}` : String((e as Error)?.message ?? e);
    await mergeState({ lastError: detail.slice(0, 300) });
    throw e;
  }
}

/** Mit den Cron-Jobs: höchstens alle 6 Stunden (atomar reserviert, nie doppelt) */
export async function syncBusinessProfileThrottled() {
  if (!isGoogleConfigured() || isFakeMode()) return;
  const c = await readConfig();
  if (!c.refreshToken || !c.locationId) return;
  const sql = await getSql();
  const claimed = await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('googleBusinessSyncedAt', ${JSON.stringify(new Date().toISOString())}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      WHERE settings.updated_at < now() - make_interval(hours => ${SYNC_EVERY_HOURS}::int)
    RETURNING key`;
  if (!claimed.length) return;
  await syncBusinessProfile();
}

export async function getBusinessSyncStatus() {
  const s = await readState();
  return {
    profileAt: s.profileAt ? new Date(s.profileAt) : null,
    lastPostAt: s.lastPostAt ? new Date(s.lastPostAt) : null,
    lastPostTitle: s.lastPostTitle ?? "",
    lastError: s.lastError ?? "",
  };
}
