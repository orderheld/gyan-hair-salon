import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { cancelBooking } from "@/lib/booking";
import { TIMEZONE } from "@/lib/config";
import { getBookingByToken, getService, localize } from "@/lib/data";
import { sendCancellation } from "@/lib/email";
import { formatChf } from "@/lib/format";
import { fill, getDict } from "@/lib/i18n";
import { href, INTL_LOCALE, isLocale } from "@/lib/i18n/config";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { robots: { index: false } };

async function cancel(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  const lang = String(formData.get("lang") ?? "de");
  const locale: Locale = isLocale(lang) ? lang : "de";
  const back = href(locale, "booking", "storno", token);
  const booking = await getBookingByToken(token);
  const { cancelNoticeHours } = await getSettings();
  if (!booking || booking.status !== "confirmed") redirect(back);
  if (booking.startsAt.getTime() <= Date.now()) redirect(back);
  // Kurzfristig storniert: geht, aber die Kosten werden beim nächsten Besuch verrechnet
  const late = booking.startsAt.getTime() - Date.now() < cancelNoticeHours * 3600_000;
  const cancelled = await cancelBooking(booking.id, { late });
  if (cancelled) await sendCancellation(cancelled, "customer");
  redirect(`${back}?ok=1`);
}


// Immer frisch (Buchungsstatus, Auswahl aus der Adresse)
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string; token: string }>; searchParams: Promise<{ ok?: string }> };

export default async function Storno({ params, searchParams }: Props) {
  const { lang, token } = await params;
  const locale = lang as Locale;
  const { ok } = await searchParams;
  const d = getDict(locale);
  const c = d.booking.cancel;
  const booking = await getBookingByToken(token);
  if (!booking) notFound();
  const { cancelNoticeHours } = await getSettings();
  const service = booking.serviceId ? await getService(booking.serviceId) : null;
  const started = booking.startsAt.getTime() <= Date.now();
  const late = booking.startsAt.getTime() - Date.now() < cancelNoticeHours * 3600_000;
  const price = booking.priceChf != null ? formatChf(booking.priceChf) : "";
  const cancelled = booking.status === "cancelled";
  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIMEZONE, ...o }).format(booking.startsAt);

  return (
    <section className="booking-page">
      <div className="container">
        <div className="confirm-card">
          <p className="eyebrow">GYAN Hair Salon</p>
          <h1 className="h2">{cancelled ? (ok ? c.done : c.already) : c.title}</h1>
          <dl>
            <div><dt>{d.booking.service}</dt><dd>{service ? localize(service, locale).name : booking.serviceName}</dd></div>
            <div><dt>{d.booking.date}</dt><dd>{fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" })}</dd></div>
            <div><dt>{d.booking.time}</dt><dd>{fmt({ hour: "2-digit", minute: "2-digit" })}</dd></div>
          </dl>
          {cancelled ? (
            <>
              {booking.lateCancel && price && <p className="late-note">{fill(c.doneLate, { price })}</p>}
              <Link className="btn btn-dark" href={href(locale, "booking")}>{c.rebook}</Link>
            </>
          ) : started ? (
            <p className="muted">
              {c.past} <a className="link" href={site.phoneHref}>{site.phone}</a>
            </p>
          ) : (
            <form action={cancel}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="lang" value={locale} />
              {late && <p className="late-note">{fill(c.lateWarning, { hours: cancelNoticeHours, price: price || "–" })}</p>}
              <div className="btn-row center">
                <Link className="btn btn-light" href={href(locale, "home")}>{c.keep}</Link>
                <button className="btn btn-dark" type="submit">{late ? c.confirmLate : c.confirm}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
