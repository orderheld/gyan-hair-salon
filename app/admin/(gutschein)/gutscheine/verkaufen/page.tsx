import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { VoucherNav } from "@/components/admin/VoucherNav";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { VOUCHER_PAYMENTS } from "@/lib/vouchers";
import { voucherSell } from "@/app/admin/voucher-actions";

export const dynamic = "force-dynamic";

type Search = Promise<{ ok?: string; error?: string }>;

/** Gutschein direkt im Salon verkaufen: bezahlt und sofort gültig */
export default async function VoucherSell({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { ok, error } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.vouchers;
  const s = t.sell;
  const opt = <span className="muted"> ({s.optional})</span>;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.sellTitle}</h1>
        <VoucherNav active="sell" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />

      <form action={voucherSell} className="panel stack">
        <p className="muted small" style={{ margin: 0 }}>{s.hint}</p>
        <div className="field">
          <label htmlFor="vs-amount">{s.amount}</label>
          <input id="vs-amount" name="amount" className="input" type="number" inputMode="decimal" min={1} max={2000} step={0.05} required style={{ maxWidth: 200 }} />
        </div>
        <div className="field">
          <span className="small" style={{ fontWeight: 500, color: "var(--taupe)" }}>{s.payment}</span>
          <div className="vc-pay" role="radiogroup" aria-label={s.payment}>
            {VOUCHER_PAYMENTS.map((p) => (
              <label key={p}><input type="radio" name="payment" value={p} required />{t.payment[p]}</label>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="vs-recipient">{s.recipient}{opt}</label>
          <input id="vs-recipient" name="recipientName" className="input" maxLength={60} />
        </div>
        <div className="field">
          <label htmlFor="vs-buyer">{s.buyer}{opt}</label>
          <input id="vs-buyer" name="buyerName" className="input" maxLength={80} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="vs-email">{s.email}{opt}</label>
          <input id="vs-email" name="email" type="email" className="input" maxLength={120} autoComplete="off" inputMode="email" />
        </div>
        <div className="field">
          <label htmlFor="vs-phone">{s.phone}{opt}</label>
          <input id="vs-phone" name="buyerPhone" type="tel" className="input" maxLength={30} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="vs-locale">{t.field.language}</label>
          <select id="vs-locale" name="locale" className="select" defaultValue={locale} style={{ maxWidth: 200 }}>
            {LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vs-note">{s.note}{opt}</label>
          <textarea id="vs-note" name="note" className="textarea" rows={2} maxLength={500} />
        </div>
        <SubmitButton pendingLabel={all.common.saving} className="btn btn-dark">{s.submit}</SubmitButton>
      </form>
    </>
  );
}
