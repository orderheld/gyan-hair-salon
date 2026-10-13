import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { VoucherNav } from "@/components/admin/VoucherNav";
import { getAdminText } from "@/lib/admin";
import { isKasseUnlocked, requireAdmin } from "@/lib/auth";
import { TIMEZONE } from "@/lib/config";
import { formatChf } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { INTL_LOCALE } from "@/lib/i18n/config";
import { getVoucher, VOUCHER_PAYMENTS } from "@/lib/vouchers";
import {
  voucherCancel,
  voucherNotPickedUp,
  voucherPickUp,
  voucherRedeem,
  voucherRemind,
  voucherRestore,
  voucherSaveNote,
  voucherUndoRedemption,
} from "@/app/admin/voucher-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> };

/** Ein Gutschein: abholen und bezahlen, einlösen (auch in Teilen), Erinnerung, Storno, Notiz */
export default async function VoucherDetail({ params, searchParams }: Props) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const { locale, t: all } = await getAdminText();
  const t = all.vouchers;
  const v = await getVoucher(Number(id));
  if (!v) notFound();
  // Kasse mit diesem Gutschein öffnen (gesperrt: zuerst PIN, danach direkt dorthin)
  const kasse = `/admin/kasse?gutschein=${encodeURIComponent(v.code)}`;
  const kasseHref = (await isKasseUnlocked()) ? kasse : `/admin/pin?next=${encodeURIComponent(kasse)}`;
  const when = (d: Date) =>
    new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE }).format(d);
  const hidden = <input type="hidden" name="id" value={v.id} />;
  const facts: [string, React.ReactNode][] = [
    [t.field.buyer, v.buyerName || "–"],
    ...(v.buyerEmail ? [[t.field.email, <a key="e" className="link" href={`mailto:${v.buyerEmail}`}>{v.buyerEmail}</a>] as [string, React.ReactNode]] : []),
    ...(v.buyerPhone ? [[t.field.phone, <a key="p" className="link" href={`tel:${v.buyerPhone.replace(/[^\d+]/g, "")}`}>{v.buyerPhone}</a>] as [string, React.ReactNode]] : []),
    ...(v.recipientName ? [[t.field.recipient, v.recipientName] as [string, React.ReactNode]] : []),
    ...(v.message ? [[t.field.message, v.message] as [string, React.ReactNode]] : []),
    [v.source === "online" ? t.field.created : t.field.sold, `${when(v.createdAt)} · ${t.source[v.source]}`],
    ...(v.pickedUpAt && v.source === "online" ? [[t.field.pickedUp, when(v.pickedUpAt)] as [string, React.ReactNode]] : []),
    ...(v.payment ? [[t.field.payment, t.payment[v.payment]] as [string, React.ReactNode]] : []),
    ...(v.remindedAt && v.status === "ordered" ? [[t.field.reminded, when(v.remindedAt)] as [string, React.ReactNode]] : []),
    ...(v.cancelledAt && v.status === "cancelled" ? [[t.field.cancelled, when(v.cancelledAt)] as [string, React.ReactNode]] : []),
    ...(v.saleNo ? [[t.receipt, <Link key="r" className="link" href={`/admin/kasse/beleg/${v.saleNo}`}>{fill(t.receiptNo, { no: String(v.saleNo).padStart(6, "0") })}</Link>] as [string, React.ReactNode]] : []),
    [t.field.language, v.locale.toUpperCase()],
  ];

  return (
    <div className="vc-detail">
      <div className="admin-title">
        <h1 className="h2">{t.detailTitle}</h1>
        <VoucherNav active={null} t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />
      <p style={{ margin: 0 }}><Link className="link small" href="/admin/gutscheine">← {t.back}</Link></p>

      <section className="panel vc-head vc-print">
        <span className={`vc-state vc-state-${v.state}`} style={{ width: "fit-content" }}>{t.state[v.state]}</span>
        <p className="vc-head-code">{v.code}</p>
        <div className="vc-head-amounts">
          <strong>{formatChf(v.amountChf)}</strong>
          {v.status === "active" && v.usedChf > 0 && <span className="muted">{t.field.balance}: {formatChf(v.balanceChf)}</span>}
        </div>
        <dl className="vc-facts">
          {facts.map(([k, val]) => (
            <div key={k}><dt>{k}</dt><dd>{val}</dd></div>
          ))}
        </dl>
      </section>

      {v.status === "ordered" && (
        <section className="panel stack">
          <h2 className="h3" style={{ margin: 0 }}>{t.pickupTitle}</h2>
          <p className="muted small" style={{ margin: 0 }}>{t.kasseHint}</p>
          <Link className="btn btn-dark" href={kasseHref}>{t.kasseBtn} · {formatChf(v.amountChf)}</Link>
          <details className="vc-alt">
            <summary>{t.withoutKasse}</summary>
        <form action={voucherPickUp} className="stack">
          {hidden}
          <p className="muted small" style={{ margin: 0 }}>{t.pickupHint}</p>
          <div className="vc-pay" role="radiogroup" aria-label={t.field.payment}>
            {VOUCHER_PAYMENTS.map((p) => (
              <label key={p}><input type="radio" name="payment" value={p} required />{t.payment[p]}</label>
            ))}
          </div>
          {v.buyerEmail && (
            <label className="vc-check"><input type="checkbox" name="sendMail" defaultChecked /> {t.sendMail}</label>
          )}
          <SubmitButton pendingLabel={all.common.saving} className="btn btn-light">{t.pickupBtn} · {formatChf(v.amountChf)}</SubmitButton>
        </form>
          </details>
        </section>
      )}

      {v.status === "active" && (
        <section className="panel stack">
          <h2 className="h3" style={{ margin: 0 }}>{t.redeemTitle}</h2>
          {v.balanceChf > 0 ? (
            <>
            <p className="muted small" style={{ margin: 0 }}>{fill(t.redeemHint, { balance: formatChf(v.balanceChf) })}</p>
            <Link className="btn btn-dark" href={kasseHref}>{t.kasseRedeem}</Link>
            <details className="vc-alt">
              <summary>{t.withoutKasseRedeem}</summary>
            <form action={voucherRedeem} className="stack">
              {hidden}
              <div className="vc-redeem-row">
                <div className="field">
                  <label htmlFor="vc-amount">{t.redeemAmount}</label>
                  <input id="vc-amount" name="amount" className="input" type="number" inputMode="decimal" min={0.05} step={0.05} max={v.balanceChf} defaultValue={v.balanceChf} required />
                </div>
                <ConfirmButton message={t.redeemConfirm} className="btn btn-dark">{t.redeemBtn}</ConfirmButton>
              </div>
              <div className="field">
                <label htmlFor="vc-rnote">{t.redeemNote}</label>
                <input id="vc-rnote" name="note" className="input" maxLength={120} />
              </div>
            </form>
            </details>
            </>
          ) : (
            <p className="muted" style={{ margin: 0 }}>{t.fullyRedeemed}</p>
          )}
          {v.redemptions.length > 0 && (
            <>
              <h3 className="small muted" style={{ margin: "8px 0 0" }}>{t.history}</h3>
              <ul className="vc-history">
                {v.redemptions.map((r) => (
                  <li key={r.id}>
                    <span>
                      {when(r.createdAt)}
                      {r.note && <span className="muted small"> · {r.note}</span>}
                    </span>
                    <strong>{formatChf(r.amountChf)}</strong>
                    {r.saleNo ? (
                      <Link className="link small" href={`/admin/kasse/beleg/${r.saleNo}`}>{fill(t.receiptNo, { no: String(r.saleNo).padStart(6, "0") })}</Link>
                    ) : (
                      <form action={voucherUndoRedemption}>
                        {hidden}
                        <input type="hidden" name="redemption" value={r.id} />
                        <ConfirmButton message={t.undoConfirm}>{t.undo}</ConfirmButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {v.status === "ordered" && <p className="muted small" style={{ margin: 0 }}>{t.notPaidYet}</p>}

      <form action={voucherSaveNote} className="panel stack">
        {hidden}
        <div className="field">
          <label htmlFor="vc-recipient">{t.field.recipient}</label>
          <input id="vc-recipient" name="recipientName" className="input" maxLength={60} defaultValue={v.recipientName} />
        </div>
        <div className="field">
          <label htmlFor="vc-note">{t.field.note}</label>
          <textarea id="vc-note" name="note" className="textarea" rows={2} maxLength={500} defaultValue={v.note} />
        </div>
        <SubmitButton pendingLabel={all.common.saving} className="btn btn-light btn-sm">{t.noteSave}</SubmitButton>
      </form>

      <section className="panel stack">
        <h2 className="h3" style={{ margin: 0 }}>{t.more}</h2>
        <div className="vc-more">
          {v.status === "ordered" && v.buyerEmail && (
            <form action={voucherRemind}>
              {hidden}
              <ConfirmButton message={t.remindConfirm}>{t.remindBtn}</ConfirmButton>
            </form>
          )}
          {v.status === "active" && v.source === "online" && v.usedChf === 0 && !v.saleNo && (
            <form action={voucherNotPickedUp}>
              {hidden}
              <ConfirmButton message={t.notPickedConfirm}>{t.notPickedBtn}</ConfirmButton>
            </form>
          )}
          {v.status !== "cancelled" && v.usedChf === 0 && !v.saleNo && (
            <form action={voucherCancel}>
              {hidden}
              {v.buyerEmail && v.status === "ordered" && (
                <label className="vc-check"><input type="checkbox" name="sendMail" defaultChecked /> {t.cancelMail}</label>
              )}
              <ConfirmButton message={t.cancelConfirm}>{t.cancelBtn}</ConfirmButton>
            </form>
          )}
          {v.saleNo && v.status !== "cancelled" && <p className="muted small" style={{ margin: 0 }}>{t.viaKasse}</p>}
          {v.status === "cancelled" && !(v.source === "salon" && v.saleNo) && (
            <form action={voucherRestore}>
              {hidden}
              <ConfirmButton message={t.restoreBtn + "?"}>{t.restoreBtn}</ConfirmButton>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
