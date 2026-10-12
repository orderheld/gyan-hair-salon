import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { VoucherNav } from "@/components/admin/VoucherNav";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { formatChf } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { formatShortDate } from "@/lib/time";
import { getVoucherByCode, getVoucherStats, listVouchers, type VoucherFilter } from "@/lib/vouchers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; f?: string; ok?: string; error?: string }>;
const FILTERS: VoucherFilter[] = ["open", "valid", "redeemed", "cancelled", "all"];

/** Gutscheine: Suche/Einlösen per Nummer, offene Bestellungen, alle Gutscheine nach Zustand */
export default async function Vouchers({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { q = "", f, ok, error } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.vouchers;
  const term = q.trim().slice(0, 80);
  // Genaue Nummer eingegeben: direkt zum Gutschein
  if (term) {
    const exact = await getVoucherByCode(term);
    if (exact) redirect(`/admin/gutscheine/${exact.id}`);
  }
  const stats = await getVoucherStats();
  const filter: VoucherFilter = FILTERS.includes(f as VoucherFilter) ? (f as VoucherFilter) : stats.open > 0 ? "open" : "valid";
  const list = await listVouchers(filter, term);
  const counts: Partial<Record<VoucherFilter, number>> = { open: stats.open, valid: stats.valid };

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.title}</h1>
        <VoucherNav active="list" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />

      <section className="lc-stats vc-stats">
        <div className="panel"><strong>{stats.open}</strong><span>{t.stats.open}{stats.open ? ` · ${formatChf(stats.openChf)}` : ""}</span></div>
        <div className="panel"><strong>{formatChf(stats.validChf)}</strong><span>{t.stats.valid} ({stats.valid})</span></div>
        <div className="panel"><strong>{formatChf(stats.soldMonthChf)}</strong><span>{t.stats.soldMonth}</span></div>
        <div className="panel"><strong>{formatChf(stats.redeemedMonthChf)}</strong><span>{t.stats.redeemedMonth}</span></div>
      </section>

      <section className="panel stack">
        <h2 className="h3" style={{ margin: 0 }}>{t.lookupTitle}</h2>
        <form className="cust-search" action="/admin/gutscheine">
          <input name="q" type="search" defaultValue={term} placeholder={t.lookupHint} className="input" aria-label={t.lookupHint} autoCapitalize="characters" />
          <button className="btn btn-dark btn-sm" type="submit">{t.lookupBtn}</button>
        </form>
      </section>

      {term ? (
        <p className="muted">
          {fill(t.results, { q: term })} · <Link className="link" href="/admin/gutscheine">{t.clear}</Link>
        </p>
      ) : (
        <nav className="vc-filters" aria-label={t.title}>
          {FILTERS.map((key) => (
            <Link key={key} href={`/admin/gutscheine?f=${key}`} className={key === filter ? "active" : ""} aria-current={key === filter ? "page" : undefined}>
              {t.filters[key]}
              {counts[key] ? <small>{counts[key]}</small> : null}
            </Link>
          ))}
        </nav>
      )}

      {list.length ? (
        <ul className="lc-list">
          {list.map((v) => (
            <li key={v.id}>
              <Link href={`/admin/gutscheine/${v.id}`} className="lc-row panel">
                <span className="cust-avatar vc-avatar" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="8" width="17" height="12" rx="2" /><path d="M3.5 12h17M12 8v12M12 8c-1.5-3-5-3.5-5-1.5S10 8 12 8Zm0 0c1.5-3 5-3.5 5-1.5S14 8 12 8Z" /></svg>
                </span>
                <span className="lc-row-main">
                  <strong>{v.buyerName || v.recipientName || t.source[v.source]}</strong>
                  <span className="muted small vc-row-code">{v.code}</span>
                  <span className="lc-meta small">
                    <span>{t.source[v.source]} · {formatShortDate(v.createdAt, locale)}</span>
                    {v.recipientName && <span>{t.field.recipient}: {v.recipientName}</span>}
                    {v.payment && <span>{t.payment[v.payment]}</span>}
                  </span>
                </span>
                <span className="vc-row-amount">
                  {v.state === "partial" ? `${formatChf(v.balanceChf)} / ${formatChf(v.amountChf)}` : formatChf(v.amountChf)}
                  <span className={`vc-state vc-state-${v.state}`}>{t.state[v.state]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">{term ? t.noneSearch : t.none}</p>
      )}
    </>
  );
}
