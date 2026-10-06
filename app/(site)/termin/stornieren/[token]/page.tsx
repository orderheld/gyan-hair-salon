import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { site } from "@/content/site";
import { cancelBooking } from "@/lib/booking";
import { CANCEL_NOTICE_HOURS } from "@/lib/config";
import { getBookingByToken } from "@/lib/data";
import { sendCancellation } from "@/lib/email";
import { formatLongDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Termin stornieren", robots: { index: false } };

async function cancel(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const booking = await getBookingByToken(token);
  if (!booking || booking.status !== "confirmed") redirect(`/termin/stornieren/${token}`);
  if (booking.startsAt.getTime() - Date.now() < CANCEL_NOTICE_HOURS * 3600_000) redirect(`/termin/stornieren/${token}`);
  const cancelled = await cancelBooking(booking.id);
  if (cancelled) await sendCancellation(cancelled, "customer");
  redirect(`/termin/stornieren/${token}?ok=1`);
}

export default async function Stornieren({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { token } = await params;
  const { ok } = await searchParams;
  const booking = await getBookingByToken(token);
  if (!booking) notFound();

  const tooLate = booking.startsAt.getTime() - Date.now() < CANCEL_NOTICE_HOURS * 3600_000;
  const cancelled = booking.status === "cancelled";

  return (
    <section className="booking-page">
      <div className="container">
        <div className="confirm-card">
          <p className="eyebrow">Termin</p>
          <h1 className="h2">
            {cancelled ? (ok ? "Dein Termin ist storniert." : "Dieser Termin wurde storniert.") : "Termin stornieren?"}
          </h1>
          <dl>
            <div><dt>Leistung</dt><dd>{booking.serviceName}</dd></div>
            <div><dt>Datum</dt><dd>{formatLongDate(booking.startsAt)}</dd></div>
            <div><dt>Uhrzeit</dt><dd>{formatTime(booking.startsAt)}</dd></div>
          </dl>
          {cancelled ? (
            <Link className="btn btn-dark" href="/termin">Neuen Termin buchen</Link>
          ) : tooLate ? (
            <p className="muted">
              Online stornieren ist bis {CANCEL_NOTICE_HOURS} Stunden vor dem Termin möglich. Bitte ruf uns an:{" "}
              <a className="link" href={site.phoneHref}>{site.phone}</a>
            </p>
          ) : (
            <form action={cancel}>
              <input type="hidden" name="token" value={token} />
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="btn btn-light" href="/">Termin behalten</Link>
                <button className="btn btn-dark" type="submit">Ja, stornieren</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
