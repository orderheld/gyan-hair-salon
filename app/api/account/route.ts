import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { siteLocked } from "@/lib/auth";
import { sendVerifyCode } from "@/lib/email";
import { fill, getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { getCustomer, updateCustomerContact } from "@/lib/customers";
import { isBirthDate } from "@/lib/time";
import { checkCode, cookieMatches, createCode, CUSTOMER_COOKIE, readCustomerCookie, RESEND_SECONDS, rememberCustomer, VERIFIED_COOKIE } from "@/lib/verify";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * «Meine Termine» ohne Passwort:
 * { step: "code", email } schickt einen 6-stelligen Code,
 * { step: "login", email, code } prüft ihn und merkt sich den Kunden 180 Tage.
 */
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
  if (!EMAIL.test(email)) return NextResponse.json({ error: e.email }, { status: 400 });
  const jar = await cookies();

  if (body.step === "login") {
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const check = await checkCode(email, code);
    if (check !== "ok") {
      const msg = check === "wrong" ? e.codeWrong : check === "tooMany" ? e.tooMany : e.codeExpired;
      return NextResponse.json({ error: msg, codeError: check }, { status: 400 });
    }
    rememberCustomer(jar, email);
    return NextResponse.json({ ok: true });
  }

  // Dieser Browser hat die Adresse schon beim Buchen bestätigt: direkt anmelden
  if (cookieMatches(jar.get(VERIFIED_COOKIE)?.value, email)) {
    rememberCustomer(jar, email);
    return NextResponse.json({ ok: true });
  }

  const result = await createCode(email);
  if (!result.ok) {
    return result.reason === "wait"
      ? NextResponse.json({ error: fill(e.wait, { s: result.seconds ?? RESEND_SECONDS }), seconds: result.seconds }, { status: 429 })
      : NextResponse.json({ error: e.tooMany }, { status: 429 });
  }
  if (await sendVerifyCode(email, result.code, locale, "login")) return NextResponse.json({ error: e.codeSend }, { status: 502 });
  return NextResponse.json({ sent: true, resendIn: RESEND_SECONDS });
}

/** Abmelden: dieser Browser vergisst den Kunden (auch fürs Buchen ohne Code) */
export async function DELETE() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
  jar.delete(VERIFIED_COOKIE);
  return NextResponse.json({ ok: true });
}

/**
 * Angemeldete Kunden ändern ihre Angaben (Name, Telefon, Geburtsdatum) für ihr ganzes Konto.
 * Die E-Mail ist das Konto und bleibt fix.
 */
export async function PATCH(request: Request) {
  if (await siteLocked()) return NextResponse.json({ error: "Coming soon" }, { status: 403 });
  const email = readCustomerCookie((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const locale = isLocale(String(body.locale)) ? (body.locale as "de" | "fr" | "en") : DEFAULT_LOCALE;
  const e = getDict(locale).booking.errors;
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = text(body.name, 80);
  const phone = text(body.phone, 30);
  const birthDate = text(body.birthDate, 10);
  if (name.length < 2) return NextResponse.json({ error: e.name }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 9) return NextResponse.json({ error: e.phone }, { status: 400 });
  if (!isBirthDate(birthDate)) return NextResponse.json({ error: e.birthDate }, { status: 400 });
  if (!(await getCustomer(email))) return NextResponse.json({ error: e.generic }, { status: 404 });
  await updateCustomerContact(email, { name, email, phone, birthDate });
  return NextResponse.json({ ok: true });
}
