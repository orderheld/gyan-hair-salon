import { requireAdmin } from "@/lib/auth";
import { DayPick } from "@/components/admin/DayPick";
import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { LOCALES, type Locale } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { CustomerBadges } from "@/components/admin/CustomerBadges";
import { customerKey, getCustomerInfos, getOpenFeeBookings, needsAttention, type CustomerInfo } from "@/lib/customers";
import { StaffSwitch } from "@/components/admin/StaffSwitch";
import { BOOKING_STAFF, getBookingCounts, getBookingsBetween, getServices, isBookingStaff, localize, type Booking, type BookingStaff } from "@/lib/data";
import { currentPeriods } from "@/lib/pos-period";
import { fill, type AdminDict } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { formatChf } from "@/lib/format";
import { addDays, formatLongDate, formatShortDate, formatTime, isDateKey, toDateKey, zurichToDate } from "@/lib/time";
import { getEmailLastError } from "@/lib/email";
import {
  adminCancelBooking,
  adminCreateBooking,
  settleFee,
  toggleNoShow,
} from "../actions";

type Search = Promise<{ wer?: string; datum?: string; zeit?: string; name?: string; tel?: string; mail?: string; ok?: string; error?: string }>;

const keyOf = (b: Booking) => customerKey(b.customerEmail, b.customerPhone);
const STAFF_NAMES: Record<BookingStaff, string> = { zana: "Zana", hikmet: "Hikmet" };

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>;
const ICON_TEL = "M6.6 3.5h2.6l1.4 4.2-2 1.4a12 12 0 0 0 6.3 6.3l1.4-2 4.2 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z";
const ICON_MAIL = "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm-1.5 1.5 8.5 6.5 8.5-6.5";

function BookingRow({ b, c, returnTo, showStaff, t, locale }: { b: Booking; c?: CustomerInfo; returnTo: string; showStaff?: boolean; t: AdminDict; locale: Locale }) {
  const cancelled = b.status === "cancelled";
  const started = b.startsAt.getTime() <= Date.now();
  const warn = !cancelled && !started && needsAttention(c) && (c!.noShows > 0 || c!.lateCancels > 0 || c!.openCount > 0 || c!.blocked);
  const tel = b.customerPhone.replace(/[^\d+]/g, "");
  const hidden = (
    <>
      <input type="hidden" name="id" value={b.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
    </>
  );
  return (
    <li className={`bk ${cancelled ? "cancelled" : ""} ${b.noShow ? "noshow" : ""} ${warn ? "bk-attn" : ""}`} id={`b-${b.id.slice(0, 8)}`}>
      <div className="bk-time">
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
          <Link href={`/admin/termin/${b.id}`} className="bk-name">{b.customerName}</Link>
          {showStaff && <span className={`pill pill-staff pill-${b.staffId}`}>{STAFF_NAMES[b.staffId]}</span>}
          {cancelled && <span className="pill pill-muted">{b.lateCancel ? t.bookings.lateCancel : t.bookings.cancelled}</span>}
          {b.noShow && <span className="pill pill-warn">{t.bookings.noShow}</span>}
          {b.source === "admin" && <span className="pill">{t.bookings.manual}</span>}
          {b.locale !== "de" && <span className="pill pill-lang">{b.locale.toUpperCase()}</span>}
        </div>
        <div className="bk-meta">
          {b.serviceName}{b.priceChf != null && ` · ${formatChf(b.priceChf)}`}
        </div>
        <CustomerBadges c={c} t={t} />
        <div className="bk-facts">
          {tel && <a href={`tel:${tel}`} aria-label={`${t.booking.call}: ${b.customerPhone}`}><Icon d={ICON_TEL} />{b.customerPhone}</a>}
          {b.customerEmail && <a href={`mailto:${b.customerEmail}`} className="bk-mail" aria-label={`${t.booking.mail}: ${b.customerEmail}`}><Icon d={ICON_MAIL} /><span>{b.customerEmail}</span></a>}
        </div>
        {b.note && <p className="bk-note">«{b.note}»</p>}
        {c?.note && <p className="bk-cnote">{c.note}</p>}
      </div>
      <div className="bk-actions">
        <Link href={`/admin/termin/${b.id}`} className="btn btn-light btn-sm">{t.common.edit}</Link>
        {!cancelled && (started ? (
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
        ))}
      </div>
    </li>
  );
}

export default async function AdminBookings({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { wer, datum, zeit, name: preName, tel: preTel, mail: preMail, ok, error } = await searchParams;
  // Zana, Hikmet oder beide
  const staff: BookingStaff | undefined = isBookingStaff(wer) ? wer : undefined;
  const werQ = staff ? `&wer=${staff}` : "";
  const preTime = zeit && /^([01]\d|2[0-3]):[0-5]\d$/.test(zeit) ? zeit : undefined;
  const { locale, t } = await getAdminText();
  const todayKey = toDateKey(new Date());
  const day = datum && isDateKey(datum) ? datum : todayKey;
  const dayStart = zurichToDate(day, "00:00");
  const dayEnd = zurichToDate(addDays(day, 1), "00:00");
  const upcomingStart = zurichToDate(addDays(todayKey, 0), "00:00");
  const upcomingEnd = zurichToDate(addDays(todayKey, 15), "00:00");

  const periods = currentPeriods();
  const [dayBookings, upcoming, counts, services, fees, mailError] = await Promise.all([
    getBookingsBetween(dayStart, dayEnd, { includeCancelled: true, staffId: staff }),
    getBookingsBetween(new Date(Math.max(Date.now(), upcomingStart.getTime())), upcomingEnd, { staffId: staff }),
    getBookingCounts(periods, staff),
    getServices({ includeInactive: true }),
    getOpenFeeBookings(),
    getEmailLastError().catch(() => null),
  ]);
  // Versandfehler der letzten 3 Tage oben anzeigen
  const showMailError = !!mailError && Date.now() - new Date(mailError.at).getTime() < 3 * 24 * 3600 * 1000;
  const infos = await getCustomerInfos([...dayBookings, ...upcoming, ...fees].map(keyOf));
  const info = (b: Booking) => infos.get(keyOf(b));
  const returnTo = `/admin?datum=${day}${werQ}`;
  const chf = (n: number) => n.toLocaleString("de-CH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  // Kommende Termine von Kunden mit Vorgeschichte: oben gross anzeigen
  const attention = upcoming.filter((b) => {
    const c = info(b);
    return !!c && (c.noShows > 0 || c.lateCancels > 0 || c.openCount > 0 || c.blocked);
  });

  // Nächste 14 Tage nach Tag gruppiert, ohne den oben gezeigten Tag (sonst doppelt)
  const later = [...upcoming.reduce((m, b) => {
    const k = toDateKey(b.startsAt);
    if (k !== day) m.set(k, [...(m.get(k) ?? []), b]);
    return m;
  }, new Map<string, Booking[]>())];

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
                  <Link href={`/admin?datum=${toDateKey(b.startsAt)}${werQ}#b-${b.id.slice(0, 8)}`}>
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

      <StaffSwitch
        current={staff ?? "alle"}
        label={t.bookings.who}
        options={[{ key: "alle", label: t.bookings.both }, ...BOOKING_STAFF.map((k) => ({ key: k, label: STAFF_NAMES[k] }))]}
        href={(k) => `/admin?${day !== todayKey ? `datum=${day}&` : ""}${k === "alle" ? "" : `wer=${k}`}`.replace(/[?&]$/, "")}
      />

      {/* Kompakt: eine Zeile Termine, eine Zeile Umsatz */}
      <table className="kpi">
        <thead>
          <tr><th scope="col"><span className="sr-only">{t.bookings.title}</span></th><th scope="col">{t.bookings.periodToday}</th><th scope="col">{t.bookings.periodWeek}</th><th scope="col">{t.bookings.periodMonth}</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">{t.bookings.statBookings}</th><td>{counts.today}</td><td>{counts.week}</td><td>{counts.month}</td></tr>
          <tr><th scope="row">{t.bookings.revenueShort} <small>CHF</small></th><td>{chf(counts.revenue.today)}</td><td>{chf(counts.revenue.week)}</td><td>{chf(counts.revenue.month)}</td></tr>
        </tbody>
      </table>

      <div className="admin-cols">
        <section className="panel">
          <div className="day-nav">
            <Link className="btn btn-light btn-sm" href={`/admin?datum=${addDays(day, -1)}${werQ}`} aria-label={t.bookings.prevDay}>‹</Link>
            <DayPick day={day} label={t.bookings.show} keep={staff ? { wer: staff } : {}} />
            <Link className="btn btn-light btn-sm" href={`/admin?datum=${addDays(day, 1)}${werQ}`} aria-label={t.bookings.nextDay}>›</Link>
            {day !== todayKey && <Link className="btn btn-light btn-sm" href={staff ? `/admin?wer=${staff}` : "/admin"}>{t.bookings.today}</Link>}
          </div>
          <h2 className="day-head">
            {formatLongDate(dayStart, locale)}
            <span>{(() => { const n = dayBookings.filter((b) => b.status === "confirmed").length; return n === 1 ? t.bookings.countOne : fill(t.bookings.count, { n }); })()}</span>
          </h2>
          {dayBookings.length ? (
            <ul className="bk-list">
              {dayBookings.map((b) => <BookingRow key={b.id} b={b} c={info(b)} returnTo={returnTo} showStaff={!staff} t={t} locale={locale} />)}
            </ul>
          ) : (
            <p className="empty-state">{t.bookings.none}</p>
          )}
        </section>

        {/* Zugeklappt, damit die Termine auf dem Handy gleich oben stehen; offen, wenn der Kalender eine Zeit mitgibt */}
        <details className="panel bk-new" id="neu" open={!!(preTime || preName || preTel || preMail)}>
          <summary><span className="h3">+ {t.bookings.createTitle}</span></summary>
          <p className="muted small">{t.bookings.createHint}</p>
          <form action={adminCreateBooking} className="stack">
            <div className="field">
              <label>{t.bookings.staffLabel}</label>
              <div className="seg-radio">
                {BOOKING_STAFF.map((k) => (
                  <label key={k}><input type="radio" name="staff" value={k} defaultChecked={(staff ?? "zana") === k} /><span>{STAFF_NAMES[k]}</span></label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>{t.bookings.service}</label>
              <select name="serviceId" className="select" required>
                {services.map((s) => <option key={s.id} value={s.id}>{localize(s, locale).name} ({s.durationMin} min)</option>)}
              </select>
            </div>
            <div className="row2">
              <div className="field"><label>{t.bookings.date}</label><input type="date" name="date" defaultValue={day} className="input" required /></div>
              <div className="field"><label>{t.bookings.time}</label><input type="time" name="time" step={300} defaultValue={preTime} className="input" required autoFocus={!!preTime} /></div>
            </div>
            <div className="field"><label>{t.bookings.name}</label><input name="name" defaultValue={preName?.slice(0, 80)} className="input" required /></div>
            <div className="field"><label>{t.bookings.phone}</label><input name="phone" type="tel" defaultValue={preTel?.slice(0, 30)} className="input" /></div>
            <div className="field"><label>{t.bookings.emailOptional}</label><input name="email" type="email" defaultValue={preMail?.slice(0, 120)} className="input" /></div>
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
        </details>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="h3">{t.bookings.upcoming}</h2>
        {later.length ? (
          later.map(([key, list]) => (
            <div key={key} className="bk-day">
              <h3 className="day-head day-head-sm">
                <Link href={`/admin?datum=${key}${werQ}`}>{formatLongDate(zurichToDate(key, "12:00"), locale)}</Link>
                <span>{list.length === 1 ? t.bookings.countOne : fill(t.bookings.count, { n: list.length })}</span>
              </h3>
              <ul className="bk-list">
                {list.map((b) => <BookingRow key={b.id} b={b} c={info(b)} returnTo={returnTo} showStaff={!staff} t={t} locale={locale} />)}
              </ul>
            </div>
          ))
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
