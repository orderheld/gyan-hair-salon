import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { getBookingById, getService, localize } from "@/lib/data";
import { formatChf, formatDuration } from "@/lib/format";
import { fill, getDict } from "@/lib/i18n";
import { href, INTL_LOCALE } from "@/lib/i18n/config";
import { TIMEZONE } from "@/lib/config";
import { PushOptIn } from "@/components/site/PushOptIn";
import { privateMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return privateMetadata(getDict((await params).lang as Locale).booking.confirmed.eyebrow);
}


// Immer frisch (Buchungsstatus, Auswahl aus der Adresse)
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ id?: string }> };

export default async function Confirmed({ params, searchParams }: Props) {
  const locale = (await params).lang as Locale;
  const { id } = await searchParams;
  const d = getDict(locale);
  const booking = id && /^[0-9a-f-]{36}$/i.test(id) ? await getBookingById(id) : null;
  if (!booking) notFound();
  const service = booking.serviceId ? await getService(booking.serviceId) : null;
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIMEZONE, ...o });
  const time = fmt({ hour: "2-digit", minute: "2-digit" });

  return (
    <section className="booking-page">
      <div className="container">
        <div className="confirm-card">
          <div className="check" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </div>
          <p className="eyebrow">{d.booking.confirmed.eyebrow}</p>
          <h1 className="h2">{fill(d.booking.confirmed.title, { name: booking.customerName.split(" ")[0] })}</h1>
          <p className="lead">{fill(d.booking.confirmed.text, { email: booking.customerEmail })}</p>
          <dl>
            <div><dt>{d.booking.service}</dt><dd>{service ? localize(service, locale).name : booking.serviceName}</dd></div>
            <div><dt>{d.booking.date}</dt><dd>{fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(booking.startsAt)}</dd></div>
            <div><dt>{d.booking.time}</dt><dd>{time.format(booking.startsAt)} – {time.format(booking.endsAt)}</dd></div>
            <div><dt>{d.booking.with}</dt><dd>{site.owner}</dd></div>
            <div><dt>{d.common.address}</dt><dd>{site.address.street}, {site.address.city}</dd></div>
            {booking.priceChf != null && <div><dt>{d.common.price}</dt><dd>{formatChf(booking.priceChf)}</dd></div>}
            <div><dt>{d.booking.duration}</dt><dd>{formatDuration(booking.durationMin, locale)}</dd></div>
            <div><dt>{d.booking.payment}</dt><dd>{d.booking.paymentText}</dd></div>
          </dl>
          <p className="note pay-note">{d.booking.confirmed.payNote}</p>
          {booking.status === "confirmed" && <PushOptIn bookingId={booking.id} locale={locale} t={d.booking.push} />}
          <div className="btn-row center">
            <a className="btn btn-dark" href={site.address.mapsUrl} target="_blank" rel="noopener">{d.common.route}</a>
            <Link className="btn btn-light" href={href(locale, "account")}>{d.account.nav}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
