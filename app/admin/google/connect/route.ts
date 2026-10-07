import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminText } from "@/lib/admin";
import { isAdmin, signValue } from "@/lib/auth";
import { authUrl, connectFake, isFakeMode, isGoogleConfigured, redirectUri, STATE_COOKIE, syncGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

const PAGE = "/admin/stempel/bewertungen";

/** «Mit Google verbinden»: zur Google-Anmeldung weiterleiten, mit signiertem Zufallswert gegen fremde Rücksprünge */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", request.url));
  const { t } = await getAdminText();
  const g = t.loyalty.google;
  const back = (params: Record<string, string>) => NextResponse.redirect(new URL(`${PAGE}?${new URLSearchParams(params)}`, request.url));
  if (!isGoogleConfigured()) return back({ error: g.errors.notConfigured });

  if (isFakeMode()) {
    await connectFake();
    await syncGoogleReviews().catch(() => {});
    return back({ ok: g.connectedOk });
  }

  const nonce = randomBytes(18).toString("base64url");
  const res = NextResponse.redirect(authUrl(redirectUri(request.nextUrl.origin), `${nonce}.${signValue("google-oauth", nonce)}`));
  res.cookies.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/admin/google",
    maxAge: 600,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
