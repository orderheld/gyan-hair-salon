import { NextResponse } from "next/server";
import type { Locale } from "@/content/types";
import { isAdmin } from "@/lib/auth";
import { customerKey } from "@/lib/customers";
import { getBookingById } from "@/lib/data";
import { getSql } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { pushEnabled, pushToCustomer, removePushSubscription, savePushSubscription, vapidPublicKey, type PushSubscriptionJSON } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Öffentlicher Schlüssel für den Browser */
export function GET() {
  return NextResponse.json({ enabled: pushEnabled, publicKey: vapidPublicKey }, { headers: { "Cache-Control": "no-store" } });
}

function validSub(v: unknown): v is PushSubscriptionJSON {
  const s = v as PushSubscriptionJSON;
  return !!s && typeof s.endpoint === "string" && /^https:\/\//.test(s.endpoint) && s.endpoint.length < 1000 &&
    typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string" && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
}

/** Gerät anmelden: Admin (neue Buchungen) oder Kunde (zu einer Buchung) */
export async function POST(request: Request) {
  if (!pushEnabled) return NextResponse.json({ error: "Push not configured" }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!validSub(body.subscription)) return NextResponse.json({ error: "Bad subscription" }, { status: 400 });
  const sub = body.subscription;

  if (body.role === "admin") {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await savePushSubscription(sub, "admin");
    return NextResponse.json({ ok: true });
  }

  const booking = typeof body.bookingId === "string" ? await getBookingById(body.bookingId) : null;
  if (!booking) return NextResponse.json({ error: "Unknown booking" }, { status: 404 });
  const key = customerKey(booking.customerEmail, booking.customerPhone);
  const locale: Locale = isLocale(String(body.locale)) ? (body.locale as Locale) : booking.locale;
  const sql = await getSql();
  const known = await sql`SELECT customer_key FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
  await savePushSubscription(sub, "customer", key, locale);
  // Erste Anmeldung zu diesem Kunden: kurze Bestätigung, damit man sieht, dass es klappt
  if (known[0]?.customer_key !== key && booking.status === "confirmed" && booking.startsAt.getTime() > Date.now()) {
    await pushToCustomer("confirmed", booking).catch(() => 0);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (typeof body.endpoint === "string") await removePushSubscription(body.endpoint);
  return NextResponse.json({ ok: true });
}
