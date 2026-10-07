import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { CustomerBadges } from "@/components/admin/CustomerBadges";
import { Flash } from "@/components/admin/Flash";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { customerKey, getCustomer } from "@/lib/customers";
import { getBookingById, getServices, localize } from "@/lib/data";
import { formatChf } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { formatLongDate, formatShortDate, formatTime, toDateKey, toTimeKey } from "@/lib/time";
import {
  adminCancelBooking,
  adminDeleteBooking,
  adminUpdateBooking,
  resendConfirmation,
  settleFee,
  toggleNoShow,
} from "../../../actions";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function BookingDetail({ params, searchParams }: Props) {
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const { locale, t } = await getAdminText();
  const b = await getBookingById(id);
  if (!b) {
    return (
      <>
        <div className="admin-title"><h1 className="h2">{t.booking.title}</h1></div>
        <p className="empty-state">{t.booking.notFound}</p>
        <Link className="btn btn-light" href="/admin/kalender">← {t.booking.back}</Link>
      </>
    );
  }
  const key = customerKey(b.customerEmail, b.customerPhone);
  const [services, customer] = await Promise.all([getServices({ includeInactive: true }), getCustomer(key)]);
  const cancelled = b.status === "cancelled";
  const started = b.startsAt.getTime() <= Date.now();
  const day = toDateKey(b.startsAt);
  const page = `/admin/termin/${b.id}`;
  const phoneDigits = b.customerPhone.replace(/[^\d+]/g, "");
  const waDigits = phoneDigits.replace(/^\+/, "").replace(/^0(?=7)/, "41");
  const hidden = (
    <>
      <input type="hidden" name="id" value={b.id} />
      <input type="hidden" name="returnTo" value={page} />
    </>
  );

  return (
    <>
      <div className="admin-title bd-title">
        <Link href={`/admin/kalender?ansicht=week&datum=${day}`} className="small muted bd-back">← {t.booking.back}</Link>
        <h1 className="h2">{b.customerName}</h1>
        <p className="bd-when">
          {formatLongDate(b.startsAt, locale)} · {formatTime(b.startsAt, locale)}–{formatTime(b.endsAt, locale)}
        </p>
        <div className="bd-pills">
          <span className={`pill ${cancelled ? "pill-muted" : ""}`}>{cancelled ? (b.lateCancel ? t.bookings.lateCancel : t.bookings.cancelled) : t.booking.confirmed}</span>
          {b.noShow && <span className="pill pill-warn">{t.bookings.noShow}</span>}
          <span className="pill">{b.source === "admin" ? t.booking.manual : t.booking.online}</span>
          <span className="pill pill-lang">{b.locale.toUpperCase()}</span>
          {b.reminderSentAt && <span className="pill pill-muted">{t.booking.reminderSent}</span>}
        </div>
      </div>
      <Flash ok={ok} error={error} />

      <div className="admin-cols bd-cols">
        <section className="panel">
          <form action={adminUpdateBooking} className="stack">
            <input type="hidden" name="id" value={b.id} />
            <h2 className="h3">{t.booking.whenTitle}</h2>
            <div className="field">
              <label htmlFor="bd-svc">{t.bookings.service}</label>
              <select id="bd-svc" name="serviceId" className="select" defaultValue={b.serviceId ?? undefined} required>
                {b.serviceId == null && <option value="">{b.serviceName}</option>}
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{localize(s, locale).name} · {s.durationMin} min · {formatChf(s.priceChf)}</option>
                ))}
              </select>
            </div>
            <div className="row2">
              <div className="field"><label htmlFor="bd-date">{t.bookings.date}</label><input id="bd-date" type="date" name="date" defaultValue={day} className="input" required /></div>
              <div className="field"><label htmlFor="bd-time">{t.bookings.time}</label><input id="bd-time" type="time" name="time" step={300} defaultValue={toTimeKey(b.startsAt)} className="input" required /></div>
            </div>
            <div className="field">
              <label htmlFor="bd-price">{t.booking.price}</label>
              <input id="bd-price" name="price" inputMode="decimal" defaultValue={b.priceChf ?? ""} className="input" />
              <span className="muted small">{t.booking.priceHint}</span>
            </div>
            {!cancelled && b.customerEmail && (
              <label className="check-row"><input type="checkbox" name="notify" defaultChecked={!started} /> {t.booking.notifyChange}</label>
            )}

            <h2 className="h3 bd-h">{t.booking.contactTitle}</h2>
            <div className="field"><label htmlFor="bd-name">{t.bookings.name}</label><input id="bd-name" name="name" defaultValue={b.customerName} className="input" required /></div>
            <div className="row2">
              <div className="field"><label htmlFor="bd-phone">{t.bookings.phone}</label><input id="bd-phone" name="phone" type="tel" defaultValue={b.customerPhone} className="input" /></div>
              <div className="field"><label htmlFor="bd-mail">{t.bookings.emailOptional}</label><input id="bd-mail" name="email" type="email" defaultValue={b.customerEmail} className="input" /></div>
            </div>
            <div className="field">
              <label htmlFor="bd-lang">{t.bookings.language}</label>
              <select id="bd-lang" name="locale" className="select" defaultValue={b.locale}>
                {LOCALES.map((l) => <option key={l} value={l}>{LOCALE_NAMES[l]}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="bd-note">{t.bookings.bookingNote}</label><textarea id="bd-note" name="note" defaultValue={b.note} className="textarea" rows={2} /></div>
            {key && (
              <div className="field"><label htmlFor="bd-cnote">{t.bookings.customerNote}</label><textarea id="bd-cnote" name="customerNote" defaultValue={customer?.note ?? ""} className="textarea" rows={2} /></div>
            )}
            <div className="sticky-save">
              <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark">{t.booking.save}</SubmitButton>
            </div>
          </form>
        </section>

        <aside className="stack bd-side">
          <section className="panel">
            <h2 className="h3">{t.booking.contactTitle}</h2>
            {customer && <CustomerBadges c={customer} t={t} />}
            <div className="bd-links">
              {phoneDigits && <a className="btn btn-light btn-sm" href={`tel:${phoneDigits}`}>📞 {t.booking.call}</a>}
              {waDigits.length > 8 && <a className="btn btn-light btn-sm" href={`https://wa.me/${waDigits}`} target="_blank" rel="noreferrer">💬 {t.booking.whatsapp}</a>}
              {b.customerEmail && <a className="btn btn-light btn-sm" href={`mailto:${b.customerEmail}`}>✉ {t.booking.mail}</a>}
            </div>
            {key && <Link className="btn btn-light btn-sm bd-card" href={`/admin/kunden/${encodeURIComponent(key)}`}>{t.booking.customerCard} →</Link>}
            <p className="muted small" style={{ margin: "12px 0 0" }}>{fill(t.booking.bookedAt, { date: `${formatShortDate(b.createdAt, locale)} ${formatTime(b.createdAt, locale)}` })}</p>
          </section>

          <section className="panel">
            <h2 className="h3">{t.booking.actions}</h2>
            <div className="bd-actions">
              {!cancelled && b.customerEmail && (
                <form action={resendConfirmation}>
                  {hidden}
                  <ConfirmButton message={fill(t.bookings.resendConfirm, { email: b.customerEmail })}>{t.bookings.resend}</ConfirmButton>
                </form>
              )}
              {!cancelled && started && (
                <form action={toggleNoShow}>
                  {hidden}
                  <input type="hidden" name="value" value={b.noShow ? "0" : "1"} />
                  <SubmitButton className="btn btn-light btn-sm">{b.noShow ? t.bookings.noShowUndo : t.bookings.noShow}</SubmitButton>
                </form>
              )}
              {b.feeOpen && (
                <form action={settleFee}>
                  {hidden}
                  <SubmitButton className="btn btn-light btn-sm">✓ {t.bookings.settle} ({b.priceChf != null ? formatChf(b.priceChf) : "–"})</SubmitButton>
                </form>
              )}
              {!cancelled && !started && (
                <form action={adminCancelBooking}>
                  {hidden}
                  <input type="hidden" name="notify" value="on" />
                  <ConfirmButton message={fill(t.bookings.cancelConfirm, { name: b.customerName, time: formatTime(b.startsAt, locale) })}>{t.common.cancel}</ConfirmButton>
                </form>
              )}
            </div>
          </section>

          <section className="panel bd-danger">
            <h2 className="h3">{t.booking.deleteTitle}</h2>
            <p className="muted small">{t.booking.deleteHint}</p>
            <form action={adminDeleteBooking} className="stack" style={{ marginTop: 8 }}>
              <input type="hidden" name="id" value={b.id} />
              {!cancelled && !started && b.customerEmail && (
                <label className="check-row"><input type="checkbox" name="notify" defaultChecked /> {t.booking.deleteNotify}</label>
              )}
              <ConfirmButton message={fill(t.booking.deleteConfirm, { name: b.customerName })} className="btn btn-light btn-sm btn-danger-text">{t.booking.delete}</ConfirmButton>
            </form>
          </section>
        </aside>
      </div>
    </>
  );
}
