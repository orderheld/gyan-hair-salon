import Link from "next/link";
import { KasseNav } from "@/components/admin/KasseNav";
import { getAdminText } from "@/lib/admin";
import { requireKasse } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getSalesBetween, getStaff, summarize, verifyChain } from "@/lib/pos";
import { PERIODS, periodRange, rangeDates } from "@/lib/pos-period";
import { formatShortDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

const chf = (n: number) => n.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function Report({ searchParams }: { searchParams: Promise<{ zeit?: string; von?: string; bis?: string }> }) {
  await requireKasse();
  const { locale, t } = await getAdminText();
  const k = t.kasse;
  const range = periodRange(await searchParams);
  const { start, end } = rangeDates(range.from, range.to);
  const [sales, staff, chain] = await Promise.all([getSalesBetween(start, end), getStaff({ includeInactive: true }), verifyChain()]);
  const sum = summarize(sales, staff);
  const stornoed = new Set(sales.filter((s) => s.stornoOf !== null).map((s) => s.stornoOf));
  const exportHref = `/admin/kasse-export?von=${range.from}&bis=${range.to}`;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.nav.pos}</h1>
      </div>
      <KasseNav active="report" t={k} />

      <div className="report-bar">
        <div className="pos-seg" role="group">
          {PERIODS.map((p) => (
            <Link key={p} href={`/admin/kasse/auswertung?zeit=${p}`} className={range.period === p ? "on" : ""}>{k.period[p]}</Link>
          ))}
        </div>
        <form className="report-range">
          <label><span className="sr-only">{k.from}</span><input type="date" name="von" defaultValue={range.from} className="input" /></label>
          <span aria-hidden>–</span>
          <label><span className="sr-only">{k.to}</span><input type="date" name="bis" defaultValue={range.to} className="input" /></label>
          <button className="btn btn-light btn-sm" type="submit">{k.show}</button>
        </form>
      </div>

      <div className="stats">
        <div className="stat"><span>{k.revenue}</span><strong>{chf(sum.total)}</strong></div>
        <div className="stat"><span>{k.receipts}</span><strong>{sum.count}</strong></div>
        <div className="stat"><span>{k.servicesSum}</span><strong>{chf(sum.services)}</strong></div>
        <div className="stat"><span>{k.productsSum}</span><strong>{chf(sum.products)}</strong></div>
      </div>

      <div className="admin-cols">
        <section className="panel">
          <h2 className="pos-h">{k.perStaff}</h2>
          <table className="report-table">
            <thead><tr><th></th><th>{k.receipts}</th><th>{k.servicesSum}</th><th>{k.productsSum}</th><th>{k.total}</th></tr></thead>
            <tbody>
              {sum.byStaff.map((r) => (
                <tr key={r.id}><th>{r.name}</th><td>{r.count}</td><td>{chf(r.services)}</td><td>{chf(r.products)}</td><td><strong>{chf(r.total)}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2 className="pos-h">{k.perPayment}</h2>
          <table className="report-table">
            <tbody>
              {(["cash", "card", "twint"] as const).map((p) => <tr key={p}><th>{k.pay[p]}</th><td><strong>{chf(sum.byPayment[p])}</strong></td></tr>)}
              {sum.vat !== 0 && <tr><th>{k.vatSum}</th><td>{chf(sum.vat)}</td></tr>}
            </tbody>
          </table>
        </section>
      </div>

      <section className="panel">
        <div className="pos-h-row">
          <h2 className="pos-h">{k.list}</h2>
          <a className="btn btn-light btn-sm" href={exportHref}>{k.export}</a>
        </div>
        {sales.length === 0 ? <p className="empty-state">{k.none}</p> : (
          <ul className="receipt-list">
            {[...sales].reverse().map((s) => (
              <li key={s.no} className={s.stornoOf !== null || stornoed.has(s.no) ? "is-void" : ""}>
                <Link href={`/admin/kasse/beleg/${s.no}`}>
                  <span className="rl-no">{String(s.no).padStart(6, "0")}</span>
                  <span className="rl-when">{formatShortDate(s.createdAt, locale)} {formatTime(s.createdAt, locale)}</span>
                  <span className="rl-what">{s.staffName} · {k.pay[s.payment]}{s.stornoOf !== null ? ` · ${fill(k.stornoOf, { no: String(s.stornoOf).padStart(6, "0") })}` : ""}</span>
                  <strong className="rl-sum">{chf(s.totalChf)}</strong>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className={`small report-chain${chain.ok ? "" : " bad"}`}>
          {chain.ok ? fill(k.chainOk, { count: String(chain.count) }) : fill(k.chainBroken, { no: String(chain.brokenAt) })}
        </p>
        <p className="muted small">{k.legal}</p>
      </section>
    </>
  );
}
