import { DayPick } from "@/components/admin/DayPick";
import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { LOCALES, type Locale } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { getBookingsBetween, getBookingStats, getServices, localize, type Booking } from "@/lib/data";
import { fill, type AdminDict } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { formatChf } from "@/lib/format";
import { addDays, formatLongDate, formatShortDate, formatTime, isDateKey, toDateKey, zurichToDate } from "@/lib/time";
import { adminCancelBooking, adminCreateBooking, resendConfirmation } from "../actions";

type Search = Promise<{ datum?: string; ok?: string; error?: string }>;

function BookingRow({ b, returnTo, showDate, t, locale }: { b: Booking; returnTo: string; showDate?: boolean; t: AdminDict; locale: Locale }) {
  const cancelled = b.status === "cancelled";
  return (
    <li className={`bk ${cancelled ? "cancelled" : ""}`}>
      <div className="bk-time">
        {showDate && <span className="bk-date">{formatShortDate(b.startsAt, locale)}</span>}
        <strong>{formatTime(b.startsAt, locale)}</strong>
        <span>{formatTime(b.endsAt, locale)}</span>
      </div>
      <div className="bk-body">
        <div className="bk-title">
          <strong>{b.customerName}</strong>
          {cancelled && <span className="pill pill-muted">{t.bookings.cancelled}</span>}
          {b.source === "admin" && <span className="pill">{t.bookings.manual}</span>}
          <span className="pill pill-lang">{b.locale.toUpperCase()}</span>
        </div>
        <div className="bk-meta">
          {b.serviceName}{b.priceChf != null && ` · ${formatChf(b.priceChf)}`}
        </div>
        <div className="bk-contact">
          {b.customerPhone && <a href={`tel:${b.customerPhone.replace(/\s/g, "")}`}>{b.customerPhone}</a>}
          {b.customerEmail && <a href={`mailto:${b.customerEmail}`}>{b.customerEmail}</a>}
        </div>
        {b.note && <p className="bk-note">«{b.note}»</p>}
      </div>
      {!cancelled && (
        <div className="bk-actions">
          {b.customerEmail && (
            <form action={resendConfirmation}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button className="btn btn-light btn-sm" type="submit">{t.bookings.resend}</button>
            </form>
          )}
          <form action={adminCancelBooking}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="notify" value="on" />
            <ConfirmButton message={fill(t.bookings.cancelConfirm, { name: b.customerName, time: formatTime(b.startsAt, locale) })}>
              {t.common.cancel}
            </ConfirmButton>
          </form>
        </div>
      )}
    </li>
  );
}

export default async function AdminBookings({ searchParams }: { searchParams: Search }) {
  const { datum, ok, error } = await searchParams;
  const { locale, t } = await getAdminText();
  const todayKey = toDateKey(new Date());
  const day = datum && isDateKey(datum) ? datum : todayKey;
  const dayStart = zurichToDate(day, "00:00");
  const dayEnd = zurichToDate(addDays(day, 1), "00:00");
  const upcomingStart = zurichToDate(addDays(todayKey, 0), "00:00");
  const upcomingEnd = zurichToDate(addDays(todayKey, 15), "00:00");

  const [dayBookings, upcoming, stats, services] = await Promise.all([
    getBookingsBetween(dayStart, dayEnd, { includeCancelled: true }),
    getBookingsBetween(new Date(Math.max(Date.now(), upcomingStart.getTime())), upcomingEnd),
    getBookingStats(),
    getServices({ includeInactive: true }),
  ]);
  const returnTo = `/admin?datum=${day}`;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.bookings.title}</h1>
      </div>
      <Flash ok={ok} error={error} />

      <div className="stats">
        <div className="stat"><span>{t.bookings.statToday}</span><strong>{stats.today}</strong></div>
        <div className="stat"><span>{t.bookings.statWeek}</span><strong>{stats.week}</strong></div>
        <div className="stat"><span>{t.bookings.statUpcoming}</span><strong>{stats.upcoming}</strong></div>
        <div className="stat"><span>{t.bookings.statRevenue}</span><strong>{formatChf(stats.weekRevenue)}</strong></div>
      </div>

      <div className="admin-cols">
        <section className="panel">
          <div className="day-nav">
            <Link className="btn btn-light btn-sm" href={`/admin?datum=${addDays(day, -1)}`} aria-label={t.bookings.prevDay}>‹</Link>
            <DayPick day={day} label={t.bookings.show} />
            <Link className="btn btn-light btn-sm" href={`/admin?datum=${addDays(day, 1)}`} aria-label={t.bookings.nextDay}>›</Link>
            {day !== todayKey && <Link className="btn btn-light btn-sm" href="/admin">{t.bookings.today}</Link>}
          </div>
          <h2 className="h3" style={{ margin: "20px 0 4px" }}>{formatLongDate(dayStart, locale)}</h2>
          <p className="muted small" style={{ margin: 0 }}>
            {(() => { const n = dayBookings.filter((b) => b.status === "confirmed").length; return n === 1 ? t.bookings.countOne : fill(t.bookings.count, { n }); })()}
          </p>
          {dayBookings.length ? (
            <ul className="bk-list">
              {dayBookings.map((b) => <BookingRow key={b.id} b={b} returnTo={returnTo} t={t} locale={locale} />)}
            </ul>
          ) : (
            <p className="empty-state">{t.bookings.none}</p>
          )}
        </section>

        <aside className="panel">
          <h2 className="h3">{t.bookings.createTitle}</h2>
          <p className="muted small">{t.bookings.createHint}</p>
          <form action={adminCreateBooking} className="stack">
            <div className="field">
              <label>{t.bookings.service}</label>
              <select name="serviceId" className="select" required>
                {services.map((s) => <option key={s.id} value={s.id}>{localize(s, locale).name} ({s.durationMin} min)</option>)}
              </select>
            </div>
            <div className="row2">
              <div className="field"><label>{t.bookings.date}</label><input type="date" name="date" defaultValue={day} className="input" required /></div>
              <div className="field"><label>{t.bookings.time}</label><input type="time" name="time" step={300} className="input" required /></div>
            </div>
            <div className="field"><label>{t.bookings.name}</label><input name="name" className="input" required /></div>
            <div className="field"><label>{t.bookings.phone}</label><input name="phone" type="tel" className="input" /></div>
            <div className="field"><label>{t.bookings.emailOptional}</label><input name="email" type="email" className="input" /></div>
            <div className="field"><label>{t.bookings.note}</label><input name="note" className="input" /></div>
            <div className="field">
              <label>{t.bookings.language}</label>
              <select name="locale" className="select" defaultValue="de">
                {LOCALES.map((l) => <option key={l} value={l}>{LOCALE_NAMES[l]}</option>)}
              </select>
            </div>
            <label className="check-row"><input type="checkbox" name="notify" defaultChecked /> {t.bookings.notify}</label>
            <SubmitButton className="btn btn-dark">{t.bookings.create}</SubmitButton>
          </form>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="h3">{t.bookings.upcoming}</h2>
        {upcoming.length ? (
          <ul className="bk-list">
            {upcoming.map((b) => <BookingRow key={b.id} b={b} returnTo={returnTo} showDate t={t} locale={locale} />)}
          </ul>
        ) : (
          <p className="empty-state">{t.bookings.noneUpcoming}</p>
        )}
      </section>
    </>
  );
}
