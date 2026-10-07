import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { siteLocked } from "@/lib/auth";
import { isBlocked } from "@/lib/customers";
import { sendVerifyCode } from "@/lib/email";
import { fill, getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { cookieMatches, createCode, RESEND_SECONDS, VERIFIED_COOKIE } from "@/lib/verify";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Schickt einen 6-stelligen Code an die E-Mail-Adresse (oder meldet: schon bestätigt) */
export async function POST(request: Request) {
  if (await siteLocked()) return NextResponse.json({ error: "Coming soon" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const locale = isLocale(String(body.locale)) ? (body.locale as "de" | "fr" | "en") : DEFAULT_LOCALE;
  const e = getDict(locale).booking.errors;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 120) : "";
  const phone = typeof body.phone === "string" ? body.phone.slice(0, 30) : "";
  if (!EMAIL.test(email)) return NextResponse.json({ error: e.email }, { status: 400 });
  if (await isBlocked(email, phone)) return NextResponse.json({ error: e.blocked }, { status: 403 });

  if (cookieMatches((await cookies()).get(VERIFIED_COOKIE)?.value, email)) return NextResponse.json({ verified: true });

  const result = await createCode(email);
  if (!result.ok) {
    return result.reason === "wait"
      ? NextResponse.json({ error: fill(e.wait, { s: result.seconds ?? RESEND_SECONDS }), seconds: result.seconds }, { status: 429 })
      : NextResponse.json({ error: e.tooMany }, { status: 429 });
  }
  if (await sendVerifyCode(email, result.code, locale)) return NextResponse.json({ error: e.codeSend }, { status: 502 });
  return NextResponse.json({ sent: true, resendIn: RESEND_SECONDS });
}
