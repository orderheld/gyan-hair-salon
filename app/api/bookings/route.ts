import { cookies } from "next/headers";
import { after, NextResponse } from "next/server";
import { siteLocked } from "@/lib/auth";
import { isBlocked } from "@/lib/customers";
import { checkCode, cookieMatches, CUSTOMER_COOKIE, readCustomerCookie, rememberCustomer, VERIFIED_COOKIE } from "@/lib/verify";
import { isSlotAvailable } from "@/lib/availability";
import { createBooking, SlotTakenError } from "@/lib/booking";
import { getService } from "@/lib/data";
import { sendBookingConfirmation } from "@/lib/email";
import { getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { runEmailJobsThrottled } from "@/lib/jobs";
import { isBirthDate, isDateKey, isTimeKey, zurichToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

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

  // Honeypot gegen Spam-Bots
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const serviceId = Number(body.serviceId);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const note = clean(body.note, 500);
  const code = clean(body.code, 6);
  const birthDate = clean(body.birthDate, 10);

  let error = "";
  if (!isDateKey(date) || !isTimeKey(time)) error = e.dateTime;
  else if (name.length < 2) error = e.name;
  else if (!EMAIL.test(email)) error = e.email;
  else if (phone.replace(/\D/g, "").length < 9) error = e.phone;
  else if (!isBirthDate(birthDate)) error = e.birthDate;
  else if (body.consent !== true) error = e.consent;
  if (error) return NextResponse.json({ error }, { status: 400 });

  // Sperre und Leistung parallel prüfen (spart eine Runde zur Datenbank)
  const [blocked, service] = await Promise.all([
    isBlocked(email, phone),
    Number.isInteger(serviceId) ? getService(serviceId) : null,
  ]);
  if (blocked) return NextResponse.json({ error: e.blocked }, { status: 403 });

  // E-Mail muss bestätigt sein: per Code oder weil dieser Browser sie schon bestätigt hat
  const jar = await cookies();
  if (!cookieMatches(jar.get(VERIFIED_COOKIE)?.value, email)) {
    if (!code) return NextResponse.json({ error: e.codeExpired, needCode: true }, { status: 400 });
    const check = await checkCode(email, code);
    if (check !== "ok") {
      const msg = check === "wrong" ? e.codeWrong : check === "tooMany" ? e.tooMany : e.codeExpired;
      return NextResponse.json({ error: msg, codeError: check }, { status: 400 });
    }
    // Ab jetzt merkt sich dieser Browser die bestätigte Adresse (auch falls die Zeit gleich vergeben ist)
    rememberCustomer(jar, email);
  } else if (!readCustomerCookie(jar.get(CUSTOMER_COOKIE)?.value)) {
    // Schon bestätigt, aber noch nicht für «Meine Termine» gemerkt
    rememberCustomer(jar, email);
  }

  if (!service || !service.active) return NextResponse.json({ error: e.service }, { status: 400 });

  if (!(await isSlotAvailable(date, time, service.durationMin))) {
    return NextResponse.json({ error: e.taken }, { status: 409 });
  }

  try {
    const booking = await createBooking({
      service,
      startsAt: zurichToDate(date, time),
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      note,
      locale,
      source: "online",
      marketingConsent: true, // Pflicht beim Online-Buchen (oben geprüft)
      birthDate,
      emailVerified: true,
    });
    // Mails und Push erst nach der Antwort senden: der Kunde sieht sofort die Bestätigung
    after(async () => {
      await sendBookingConfirmation(booking).catch((err) => console.error("[GYAN] Bestätigung:", err));
      await runEmailJobsThrottled();
    });
    return NextResponse.json({ ok: true, id: booking.id });
  } catch (err) {
    if (err instanceof SlotTakenError) return NextResponse.json({ error: e.taken }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: e.generic }, { status: 500 });
  }
}
