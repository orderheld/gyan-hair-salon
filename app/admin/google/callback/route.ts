import { NextResponse, type NextRequest } from "next/server";
import { getAdminText } from "@/lib/admin";
import { checkSignedValue, isAdmin } from "@/lib/auth";
import { connectWithCode, GoogleError, isGoogleConfigured, redirectUri, setupLocations, STATE_COOKIE, syncGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

const PAGE = "/admin/stempel/bewertungen";

/** Rücksprung von Google: State prüfen, Code tauschen, Standort wählen, erster Abruf */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", request.url));
  const { t } = await getAdminText();
  const g = t.loyalty.google;
  const back = (params: Record<string, string>) => {
    const res = NextResponse.redirect(new URL(`${PAGE}?${new URLSearchParams(params)}`, request.url));
    res.cookies.set(STATE_COOKIE, "", { path: "/admin/google", maxAge: 0 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  };
  if (!isGoogleConfigured()) return back({ error: g.errors.notConfigured });

  const p = request.nextUrl.searchParams;
  const [nonce = "", signature = ""] = (p.get("state") ?? "").split(".");
  const expected = request.cookies.get(STATE_COOKIE)?.value ?? "";
  if (!nonce || nonce !== expected || !checkSignedValue("google-oauth", nonce, signature)) return back({ error: g.errors.state });
  if (p.get("error")) return back({ error: g.errors.denied });
  const code = p.get("code") ?? "";
  if (!code) return back({ error: g.errors.denied });

  try {
    const token = await connectWithCode(code, redirectUri(request.nextUrl.origin));
    if ((await setupLocations(token)) === "choose") return back({});
  } catch (e) {
    console.error("[GYAN] Google verbinden:", e);
    return back({ error: g.errors[e instanceof GoogleError ? e.code : "api"] });
  }
  // erster Abruf; schlägt er fehl, steht der Fehler auf der Seite
  await syncGoogleReviews().catch((e) => console.error("[GYAN] Google-Bewertungen abrufen:", e));
  return back({ ok: g.connectedOk });
}
