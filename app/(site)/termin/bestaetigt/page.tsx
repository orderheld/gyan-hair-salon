import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getBookingById } from "@/lib/data";
import { formatChf } from "@/lib/format";
import { formatLongDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Termin bestätigt", robots: { index: false } };

export default async function Bestaetigt({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const booking = id ? await getBookingById(id) : null;
  if (!booking) notFound();

  return (
    <section className="booking-page">
      <div className="container">
        <div className="confirm-card">
          <div className="check" aria-hidden>✓</div>
          <p className="eyebrow">Bestätigt</p>
          <h1 className="h2">Bis bald, {booking.customerName.split(" ")[0]}.</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            Dein Termin bei {site.owner} ist reserviert. Die Bestätigung ist unterwegs an {booking.customerEmail}.
          </p>
          <dl>
            <div><dt>Leistung</dt><dd>{booking.serviceName}</dd></div>
            <div><dt>Datum</dt><dd>{formatLongDate(booking.startsAt)}</dd></div>
            <div><dt>Uhrzeit</dt><dd>{formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}</dd></div>
            <div><dt>Adresse</dt><dd>{site.address.street}, {site.address.city}</dd></div>
            {booking.priceChf != null && <div><dt>Preis</dt><dd>{formatChf(booking.priceChf)}</dd></div>}
          </dl>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-dark" href={site.address.mapsUrl} target="_blank" rel="noreferrer">Route planen</a>
            <Link className="btn btn-light" href="/">Zur Startseite</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
