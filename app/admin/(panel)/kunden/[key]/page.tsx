import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { CustomerBadges } from "@/components/admin/CustomerBadges";
import { Flash } from "@/components/admin/Flash";
import { getAdminText } from "@/lib/admin";
import { getCustomer, getCustomerBookings } from "@/lib/customers";
import { formatChf } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { formatShortDate, formatTime, toDateKey } from "@/lib/time";
import { adminDeleteCustomer, adminSaveCustomerContact, toggleBlock } from "../../../actions";

type Props = { params: Promise<{ key: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

export default async function CustomerDetail({ params, searchParams }: Props) {
  const [{ key: raw }, { ok, error }] = await Promise.all([params, searchParams]);
  let key = raw;
  try {
    key = decodeURIComponent(raw);
  } catch {}
  const { locale, t } = await getAdminText();
  const c = t.customers;
  const [x, bookings] = await Promise.all([getCustomer(key), getCustomerBookings(key)]);
  if (!x) {
    return (
      <>
        <div className="admin-title"><h1 className="h2">{c.title}</h1></div>
        <Flash ok={ok} error={error} />
        <p className="empty-state">{c.notFound}</p>
        <Link className="btn btn-light" href="/admin/kunden">← {c.back}</Link>
      </>
    );
  }
  const page = `/admin/kunden/${encodeURIComponent(key)}`;
  const spent = bookings
    .filter((b) => b.status === "confirmed" && !b.noShow && b.startsAt.getTime() < Date.now())
    .reduce((sum, b) => sum + (b.priceChf ?? 0), 0);
  const newHref = `/admin?${new URLSearchParams({ name: x.name, tel: x.phone, mail: x.email }).toString()}#neu`;

  return (
    <>
      <div className="admin-title bd-title">
        <Link href="/admin/kunden" className="small muted bd-back">← {c.back}</Link>
        <h1 className="h2">{x.name || "–"}</h1>
        <CustomerBadges c={x} t={t} />
      </div>
      <Flash ok={ok} error={error} />

      <div className="stats">
        <div className="stat"><span>{c.visits}</span><strong>{x.visits}</strong></div>
        <div className="stat"><span>{c.upcomingLbl}</span><strong>{x.upcoming}</strong></div>
        <div className="stat"><span>{c.noShowsLbl}</span><strong>{x.noShows}</strong></div>
        <div className="stat"><span>{c.spent}</span><strong>{formatChf(spent)}</strong></div>
      </div>

      <div className="admin-cols bd-cols">
        <section className="panel">
          <h2 className="h3">{c.bookingsTitle}</h2>
          <Link className="btn btn-dark btn-sm" href={newHref} style={{ marginTop: 8 }}>+ {c.newBooking}</Link>
          {bookings.length ? (
            <ul className="cust-hist">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/termin/${b.id}`} className={b.status === "cancelled" ? "is-cancelled" : ""}>
                    <span className="cust-hist-when">{formatShortDate(b.startsAt, locale)} · {formatTime(b.startsAt, locale)}</span>
                    <strong>{b.serviceName}</strong>
                    <span className="cust-hist-meta">
                      {b.status === "cancelled" ? (b.lateCancel ? t.bookings.lateCancel : t.bookings.cancelled) : b.noShow ? t.bookings.noShow : b.priceChf != null ? formatChf(b.priceChf) : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">{c.noBookings}</p>
          )}
        </section>

        <aside className="stack bd-side">
          <section className="panel">
            <h2 className="h3">{c.contactTitle}</h2>
            <p className="muted small">{c.contactHint}</p>
            <form action={adminSaveCustomerContact} className="stack">
              <input type="hidden" name="key" value={x.key} />
              <div className="field"><label htmlFor="cd-name">{t.bookings.name}</label><input id="cd-name" name="name" defaultValue={x.name} className="input" required /></div>
              <div className="field"><label htmlFor="cd-phone">{t.bookings.phone}</label><input id="cd-phone" name="phone" type="tel" defaultValue={x.phone} className="input" /></div>
              <div className="field"><label htmlFor="cd-birth">{t.bookings.birthDate}</label><input id="cd-birth" name="birthDate" type="date" min="1900-01-01" defaultValue={x.birthDate} className="input" /></div>
              <div className="field"><label htmlFor="cd-mail">{t.bookings.emailOptional}</label><input id="cd-mail" name="email" type="email" defaultValue={x.email} className="input" /></div>
              <div className="field"><label htmlFor="cd-note">{c.note}</label><textarea id="cd-note" name="note" defaultValue={x.note} className="textarea" rows={3} /></div>
              <label className="switch-row">
                <span>{c.noMarketing}</span>
                <input type="checkbox" name="noMarketing" defaultChecked={x.noMarketing} className="tgl" />
              </label>
              <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark">{c.save}</SubmitButton>
            </form>
            <form action={toggleBlock} style={{ marginTop: 12 }}>
              <input type="hidden" name="key" value={x.key} />
              <input type="hidden" name="email" value={x.email} />
              <input type="hidden" name="phone" value={x.phone} />
              <input type="hidden" name="returnTo" value={page} />
              <input type="hidden" name="value" value={x.blocked ? "0" : "1"} />
              {x.blocked ? (
                <SubmitButton className="btn btn-light btn-sm">{t.bookings.unblock}</SubmitButton>
              ) : (
                <ConfirmButton message={fill(t.bookings.blockConfirm, { name: x.name })} className="btn btn-light btn-sm btn-danger-text">{t.bookings.block}</ConfirmButton>
              )}
            </form>
          </section>

          <section className="panel bd-danger">
            <h2 className="h3">{c.deleteTitle}</h2>
            <p className="muted small">{c.deleteHint}</p>
            <form action={adminDeleteCustomer}>
              <input type="hidden" name="key" value={x.key} />
              <ConfirmButton message={fill(c.deleteConfirm, { name: x.name })} className="btn btn-light btn-sm btn-danger-text">{c.delete}</ConfirmButton>
            </form>
          </section>
          <p className="muted small">{x.firstAt ? `${c.firstBooking} ${toDateKey(x.firstAt).split("-").reverse().join(".")}` : ""}</p>
        </aside>
      </div>
    </>
  );
}
