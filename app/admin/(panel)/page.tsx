import { DayPick } from "@/components/admin/DayPick";
import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { LOCALES, type Locale } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { CustomerBadges } from "@/components/admin/CustomerBadges";
import { customerKey, getCustomerInfos, getOpenFeeBookings, needsAttention, type CustomerInfo } from "@/lib/customers";
import { getBookingsBetween, getBookingStats, getServices, localize, type Booking } from "@/lib/data";
import { fill, type AdminDict } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { formatChf } from "@/lib/format";
import { addDays, formatLongDate, formatShortDate, formatTime, isDateKey, toDateKey, zurichToDate } from "@/lib/time";
import { getEmailLastError } from "@/lib/email";
import {
  adminCancelBooking,
  adminCreateBooking,
  resendConfirmation,
  settleFee,
  toggleBlock,
  toggleNoShow,
  updateBookingDetails,
} from "../actions";

type Search = Promise<{ datum?: string; ok?: string; error?: string }>;

const keyOf = (b: Booking) => customerKey(b.customerEmail, b.customerPhone);

function BookingRow({ b, c, returnTo, showDate, t, locale }: { b: Booking; c?: CustomerInfo; returnTo: string; showDate?: boolean; t: AdminDict; locale: Locale }) {
  const cancelled = b.status === "cancelled";
  const started = b.startsAt.getTime() <= Date.now();
  const warn = !cancelled && !started && needsAttention(c) && (c!.noShows > 0 || c!.lateCancels > 0 || c!.openCount > 0 || c!.blocked);
  const hidden = (
    <>
      <input type="hidden" name="id" value={b.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
    </>
  );
  return (
    <li className={`bk ${cancelled ? "cancelled" : ""} ${b.noShow ? "noshow" : ""} ${warn ? "bk-attn" : ""}`} id={`b-${b.id.slice(0, 8)}`}>
      <div className="bk-time">
        {showDate && <span className="bk-date">{formatShortDate(b.startsAt, locale)}</span>}
        <strong>{formatTime(b.startsAt, locale)}</strong>
        <span>{formatTime(b.endsAt, locale)}</span>
      </div>
      <div className="bk-body">
        {warn && c && (
          <div className="bk-alert" role="note">
            <strong>⚠ {t.bookings.warnTitle}</strong>
            <span>
              {[
                c.noShows ? fill(t.bookings.noShows, { n: c.noShows }) : "",
                c.lateCancels ? fill(t.bookings.lateCancels, { n: c.lateCancels }) : "",
                c.openCount ? fill(t.bookings.openFee, { amount: formatChf(c.openFees) }) : "",
                c.blocked ? t.bookings.blocked : "",
              ].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
        <div className="bk-title">
          <strong>{b.customerName}</strong>
          {cancelled && <span className="pill pill-muted">{b.lateCancel ? t.bookings.lateCancel : t.bookings.cancelled}</span>}
          {b.noShow && <span className="pill pill-warn">{t.bookings.noShow}</span>}
          {b.source === "admin" && <span className="pill">{t.bookings.manual}</span>}
          <span className="pill pill-lang">{b.locale.toUpperCase()}</span>
        </div>
        <CustomerBadges c={c} t={t} />
        <div className="bk-meta">
          {b.serviceName}{b.priceChf != null && ` · ${formatChf(b.priceChf)}`}
        </div>
        <div className="bk-contact">
          {b.customerPhone && <a href={`tel:${b.customerPhone.replace(/\s/g, "")}`}>{b.customerPhone}</a>}
          {b.customerEmail && <a href={`mailto:${b.customerEmail}`}>{b.customerEmail}</a>}
        </div>
        {b.note && <p className="bk-note">«{b.note}»</p>}
        {c?.note && <p className="bk-cnote">{c.note}</p>}

        <details className="bk-more">
          <summary>{t.bookings.more}</summary>
          <form action={updateBookingDetails} className="bk-edit">
            {hidden}
            <p className="bk-edit-title">{t.bookings.edit}</p>
            <div className="field"><label>{t.bookings.name}</label><input name="name" defaultValue={b.customerName} className="input" required /></div>
            <div className="row2">
              <div className="field"><label>{t.bookings.phone}</label><input name="phone" type="tel" defaultValue={b.customerPhone} className="input" /></div>
              <div className="field"><label>{t.bookings.emailOptional}</label><input name="email" type="email" defaultValue={b.customerEmail} className="input" /></div>
            </div>
            <div className="field"><label>{t.bookings.bookingNote}</label><input name="note" defaultValue={b.note} className="input" /></div>
            <div className="field"><label>{t.bookings.customerNote}</label><textarea name="customerNote" defaultValue={c?.note ?? ""} className="textarea" rows={2} /></div>
            <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark btn-sm">{t.bookings.saveDetails}</SubmitButton>
          </form>
          <div className="bk-more-actions">
            {!cancelled && !started && b.customerEmail && (
              <form action={resendConfirmation}>
                {hidden}
                <ConfirmButton message={fill(t.bookings.resendConfirm, { email: b.customerEmail })}>{t.bookings.resend}</ConfirmButton>
              </form>
            )}
            <form action={toggleBlock}>
              {hidden}
              <input type="hidden" name="email" value={b.customerEmail} />
              <input type="hidden" name="phone" value={b.customerPhone} />
              <input type="hidden" name="key" value={keyOf(b)} />
              <input type="hidden" name="value" value={c?.blocked ? "0" : "1"} />
              {c?.blocked ? (
                <SubmitButton className="btn btn-light btn-sm">{t.bookings.unblock}</SubmitButton>
              ) : (
                <ConfirmButton message={fill(t.bookings.blockConfirm, { name: b.customerName })} className="btn btn-light btn-sm btn-danger-text">{t.bookings.block}</ConfirmButton>
              )}
            </form>
          </div>
        </details>
      </div>
      {!cancelled && (
        <div className="bk-actions">
          {started ? (
            <form action={toggleNoShow}>
              {hidden}
              <input type="hidden" name="value" value={b.noShow ? "0" : "1"} />
              <SubmitButton className={`btn btn-sm ${b.noShow ? "btn-light" : "btn-light btn-danger-text"}`}>{b.noShow ? t.bookings.noShowUndo : t.bookings.noShow}</SubmitButton>
            </form>
          ) : (
            <form action={adminCancelBooking}>
              {hidden}
              <input type="hidden" name="notify" value="on" />
              <ConfirmButton message={fill(t.bookings.cancelConfirm, { name: b.customerName, time: formatTime(b.startsAt, locale) })}>
                {t.common.cancel}
              </ConfirmButton>
            </form>
          )}
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

  const [dayBookings, upcoming, stats, services, fees, mailError] = await Promise.all([
    getBookingsBetween(dayStart, dayEnd, { includeCancelled: true }),
    getBookingsBetween(new Date(Math.max(Date.now(), upcomingStart.getTime())), upcomingEnd),
    getBookingStats(),
    getServices({ includeInactive: true }),
    getOpenFeeBookings(),
    getEmailLastError().catch(() => null),
  ]);
  // Versandfehler der letzten 3 Tage oben anzeigen
  const showMailError = !!mailError && Date.now() - new Date(mailError.at).getTime() < 3 * 24 * 3600 * 1000;
  const infos = await getCustomerInfos([...dayBookings, ...upcoming, ...fees].map(keyOf));
  const info = (b: Booking) => infos.get(keyOf(b));
  const returnTo = `/admin?datum=${day}`;
  // Kommende Termine von Kunden mit Vorgeschichte: oben gross anzeigen
  const attention = upcoming.filter((b) => {
    const c = info(b);
    return !!c && (c.noShows > 0 || c.lateCancels > 0 || c.openCount > 0 || c.blocked);
  });

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.bookings.title}</h1>
      </div>
      <Flash ok={ok} error={error} />

      {showMailError && mailError && (
        <section className="panel attn" role="alert">
          <h2 className="h3">⚠ {t.bookings.mailErrorTitle}</h2>
          <p className="small" style={{ margin: "8px 0 0", overflowWrap: "anywhere" }}>
            {fill(t.bookings.mailErrorText, {
              when: `${formatShortDate(new Date(mailError.at), locale)} ${formatTime(new Date(mailError.at), locale)}`,
              to: mailError.to,
              message: mailError.message,
            })}
          </p>
        </section>
      )}

      {attention.length > 0 && (
        <section className="panel attn">
          <h2 className="h3">⚠ {t.bookings.attentionTitle}</h2>
          <ul className="attn-list">
            {attention.map((b) => {
              const c = info(b)!;
              return (
                <li key={b.id}>
                  <Link href={`/admin?datum=${toDateKey(b.startsAt)}#b-${b.id.slice(0, 8)}`}>
                    <span className="attn-when">{formatShortDate(b.startsAt, locale)} · {formatTime(b.startsAt, locale)}</span>
                    <strong>{b.customerName}</strong>
                    <span className="attn-why">
                      {[
                        c.noShows ? fill(t.bookings.noShows, { n: c.noShows }) : "",
                        c.lateCancels ? fill(t.bookings.lateCancels, { n: c.lateCancels }) : "",
                        c.openCount ? fill(t.bookings.openFee, { amount: formatChf(c.openFees) }) : "",
                        c.blocked ? t.bookings.blocked : "",
                      ].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
              {dayBookings.map((b) => <BookingRow key={b.id} b={b} c={info(b)} returnTo={returnTo} t={t} locale={locale} />)}
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
            {upcoming.map((b) => <BookingRow key={b.id} b={b} c={info(b)} returnTo={returnTo} showDate t={t} locale={locale} />)}
          </ul>
        ) : (
          <p className="empty-state">{t.bookings.noneUpcoming}</p>
        )}
      </section>

      <section className="panel" id="kosten">
        <h2 className="h3">{t.bookings.feesTitle}</h2>
        <p className="muted small" style={{ margin: "4px 0 0" }}>{t.bookings.feesHint}</p>
        {fees.length ? (
          <ul className="fee-list">
            {fees.map((b) => (
              <li key={b.id}>
                <div className="fee-main">
                  <strong>{b.customerName}</strong>
                  <span className="muted small">
                    {formatShortDate(b.startsAt, locale)} · {formatTime(b.startsAt, locale)} · {b.serviceName}
                  </span>
                  <span className={`pill ${b.noShow ? "pill-warn" : "pill-muted"}`}>{b.noShow ? t.bookings.noShow : t.bookings.lateCancel}</span>
                </div>
                <strong className="fee-amount">{b.priceChf != null ? formatChf(b.priceChf) : "–"}</strong>
                <form action={settleFee}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="returnTo" value={`${returnTo}#kosten`} />
                  <SubmitButton className="btn btn-light btn-sm">✓ {t.bookings.settle}</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{t.bookings.feesNone}</p>
        )}
      </section>
    </>
  );
}
