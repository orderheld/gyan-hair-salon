import { siteLocked } from "@/lib/auth";
import { after, NextResponse } from "next/server";
import { isSlotAvailable } from "@/lib/availability";
import { createBooking, SlotTakenError } from "@/lib/booking";
import { getService } from "@/lib/data";
import { sendBookingConfirmation } from "@/lib/email";
import { getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { runEmailJobsThrottled } from "@/lib/jobs";
import { isDateKey, isTimeKey, zurichToDate } from "@/lib/time";

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

  let error = "";
  if (!isDateKey(date) || !isTimeKey(time)) error = e.dateTime;
  else if (name.length < 2) error = e.name;
  else if (!EMAIL.test(email)) error = e.email;
  else if (phone.replace(/\D/g, "").length < 9) error = e.phone;
  if (error) return NextResponse.json({ error }, { status: 400 });

  const service = Number.isInteger(serviceId) ? await getService(serviceId) : null;
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
    });
    await sendBookingConfirmation(booking);
    after(runEmailJobsThrottled);
    return NextResponse.json({ ok: true, id: booking.id });
  } catch (err) {
    if (err instanceof SlotTakenError) return NextResponse.json({ error: e.taken }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: e.generic }, { status: 500 });
  }
}
