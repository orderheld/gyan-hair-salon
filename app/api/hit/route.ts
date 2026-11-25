import { after, NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, hasAdminCookie } from "@/lib/coming-soon";
import { isLocale } from "@/lib/i18n/config";
import { toDateKey } from "@/lib/time";
import { classifySource, deviceOf, isBot, recordEvent, recordHit, recordVitals, visitorHash } from "@/lib/visits";

export const dynamic = "force-dynamic";

const ok = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });

function hostOf(url: string) {
  try {
    const u = new URL(url);
    if (u.protocol === "android-app:") return u.hostname;
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Besucherstatistik: der Browser meldet jeden Seitenaufruf (navigator.sendBeacon).
 * Keine IP und kein Cookie wird gespeichert. Admins, Bots und Vorschauen zählen nicht.
 */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return ok();
  if (await hasAdminCookie(request.cookies.get(ADMIN_COOKIE)?.value)) return ok();
  // nur die echte Webseite zählen, keine Vercel-Vorschauen
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return ok();

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse((await request.text()).slice(0, 2000));
  } catch {
    return ok();
  }
  // «/» zeigt die deutsche Startseite ohne Umleitung
  const raw = String(body.p ?? "").split(/[?#]/)[0];
  const path = raw === "/" ? "/de" : raw.replace(/(.)\/$/, "$1");
  const [, locale] = path.split("/");
  if (!isLocale(locale) || path.length > 200 || !/^[\w\-/.%]+$/.test(path)) return ok();
  const day = toDateKey(new Date());

  // Ladezeiten, Fehler und fehlende Seiten
  if (body.k === "v" || body.k === "e" || body.k === "404") {
    const kind = body.k;
    const ms = (v: unknown) => (typeof v === "number" && v >= 0 && v < 120_000 ? Math.round(v) : null);
    after(() =>
      (kind === "v"
        ? recordVitals({ day, path, device: deviceOf(ua), lcp: ms(body.lcp), fcp: ms(body.fcp), inp: ms(body.inp), ttfb: ms(body.ttfb), cls: typeof body.cls === "number" && body.cls >= 0 && body.cls < 50 ? body.cls : null })
        : recordEvent({ day, kind: kind === "e" ? "error" : "404", path, message: String(body.m ?? ""), detail: String(body.d ?? ""), refHost: hostOf(String(body.r ?? "")), device: deviceOf(ua) })
      ).catch((e) => console.error("[GYAN] Messwert speichern:", e)),
    );
    return ok();
  }

  const session = String(body.s ?? "");
  if (!/^[a-z0-9]{8,32}$/.test(session)) return ok();

  const landing = body.l === 1;
  const query = new URLSearchParams(String(body.q ?? "").slice(0, 500));
  const site = request.nextUrl.hostname.replace(/^www\./, "");
  let refHost = landing ? hostOf(String(body.r ?? "")) : "";
  if (refHost === site || refHost.endsWith(`.${site}`)) refHost = "";

  const h = request.headers;
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
  const city = (() => {
    try {
      return decodeURIComponent(h.get("x-vercel-ip-city") ?? "");
    } catch {
      return "";
    }
  })();

  const source = landing
    ? classifySource({
        refHost,
        utmSource: query.get("utm_source") ?? "",
        utmMedium: query.get("utm_medium") ?? "",
        gclid: query.has("gclid") || query.has("gbraid") || query.has("wbraid"),
        fbclid: query.has("fbclid"),
        app: body.a === 1,
      })
    : "direct";

  after(() =>
    recordHit({
      day,
      path,
      locale,
      landing,
      source,
      refHost,
      campaign: landing ? (query.get("utm_campaign") ?? "") : "",
      country: (h.get("x-vercel-ip-country") ?? "").toUpperCase(),
      region: h.get("x-vercel-ip-country-region") ?? "",
      city,
      device: deviceOf(ua),
      visitor: visitorHash(day, ip, ua),
      session,
    }).catch((e) => console.error("[GYAN] Besuch speichern:", e)),
  );
  return ok();
}
