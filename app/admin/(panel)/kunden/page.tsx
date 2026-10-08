import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { CustomerBadges } from "@/components/admin/CustomerBadges";
import { Flash } from "@/components/admin/Flash";
import { getAdminText } from "@/lib/admin";
import { listCustomers } from "@/lib/customers";
import { fill } from "@/lib/i18n";
import { formatShortDate } from "@/lib/time";
import { saveCustomer, toggleBlock } from "../../actions";

type Search = Promise<{ q?: string; ok?: string; error?: string }>;

export default async function Customers({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { q = "", ok, error } = await searchParams;
  const { locale, t } = await getAdminText();
  const c = t.customers;
  const customers = await listCustomers(q.slice(0, 80));
  const withConsent = customers.filter((x) => x.consent && !x.noMarketing && !x.blocked && x.email).length;
  const returnTo = q ? `/admin/kunden?q=${encodeURIComponent(q)}` : "/admin/kunden";

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{c.title}</h1>
        <p className="muted">{c.hint}</p>
      </div>
      <Flash ok={ok} error={error} />

      <section className="panel cust-head">
        <form className="cust-search" action="/admin/kunden">
          <input name="q" type="search" defaultValue={q} placeholder={c.search} className="input" aria-label={c.search} />
          <button className="btn btn-dark btn-sm" type="submit">{c.searchBtn}</button>
        </form>
        <div className="cust-stats">
          <span>{fill(c.total, { n: customers.length })}</span>
          <span>{fill(c.withConsent, { n: withConsent })}</span>
          <a className="btn btn-light btn-sm" href="/admin/kunden-export">↓ {c.export}</a>
        </div>
      </section>

      {customers.length ? (
        <div className="svc-list">
          {customers.map((x) => (
            <details key={x.key} className={`panel cust ${x.blocked ? "is-blocked" : ""}`}>
              <summary className="cust-sum">
                <span className="cust-avatar" aria-hidden>{(x.name.trim()[0] ?? "?").toUpperCase()}</span>
                <span className="cust-main">
                  <strong>{x.name || "–"}</strong>
                  <span className="muted small cust-contact">{[x.phone, x.email].filter(Boolean).join(" · ")}</span>
                  <CustomerBadges c={x} t={t} />
                </span>
                <span className="cust-last">
                  <span className="muted small">{c.lastVisit}</span>
                  <strong>{x.lastVisitAt ? formatShortDate(x.lastVisitAt, locale) : c.never}</strong>
                  {x.upcoming > 0 && <span className="small">{fill(c.upcoming, { n: x.upcoming })}</span>}
                </span>
              </summary>
              <div className="cust-body">
                <div className="cust-links">
                  {x.phone && <a className="btn btn-light btn-sm" href={`tel:${x.phone.replace(/\s/g, "")}`}>{x.phone}</a>}
                  {x.email && <a className="btn btn-light btn-sm" href={`mailto:${x.email}`}>{x.email}</a>}
                  {x.firstAt && <span className="muted small">{c.firstBooking} {formatShortDate(x.firstAt, locale)}</span>}
                </div>
                <Link className="btn btn-dark btn-sm cust-open" href={`/admin/kunden/${encodeURIComponent(x.key)}`}>{c.open} →</Link>
                <form action={saveCustomer} className="stack" style={{ marginTop: 0 }}>
                  <input type="hidden" name="key" value={x.key} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <div className="field"><label>{c.note}</label><textarea name="note" defaultValue={x.note} className="textarea" rows={2} /></div>
                  <label className="switch-row">
                    <span>{c.noMarketing}</span>
                    <input type="checkbox" name="noMarketing" defaultChecked={x.noMarketing} className="tgl" />
                  </label>
                  <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark btn-sm">{c.save}</SubmitButton>
                </form>
                <form action={toggleBlock} className="cust-block">
                  <input type="hidden" name="key" value={x.key} />
                  <input type="hidden" name="email" value={x.email} />
                  <input type="hidden" name="phone" value={x.phone} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input type="hidden" name="value" value={x.blocked ? "0" : "1"} />
                  {x.blocked ? (
                    <SubmitButton className="btn btn-light btn-sm">{t.bookings.unblock}</SubmitButton>
                  ) : (
                    <ConfirmButton message={fill(t.bookings.blockConfirm, { name: x.name })} className="btn btn-light btn-sm btn-danger-text">{t.bookings.block}</ConfirmButton>
                  )}
                </form>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="empty-state">{c.none}</p>
      )}
    </>
  );
}
