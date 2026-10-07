import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { PrintButton } from "@/components/admin/PrintButton";
import { site } from "@/content/site";
import { getAdminText } from "@/lib/admin";
import { requireKasse } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getSale, getStornoFor } from "@/lib/pos";
import { getSettings } from "@/lib/settings";
import { formatTime } from "@/lib/time";
import { posStorno } from "@/app/admin/kasse-actions";

export const dynamic = "force-dynamic";

const chf = (n: number) => n.toFixed(2);
/** Mit dem Kassen-Login nur der eben erstellte Beleg (zum Drucken), keine alten Belege */
const KASSE_WINDOW_MS = 15 * 60 * 1000;

export default async function Receipt({ params, searchParams }: { params: Promise<{ no: string }>; searchParams: Promise<{ ok?: string; error?: string; neu?: string }> }) {
  const role = await requireKasse();
  const [{ no }, { ok, error, neu }] = await Promise.all([params, searchParams]);
  const { locale, t } = await getAdminText();
  const k = t.kasse;
  const sale = await getSale(Number(no));
  if (!sale || (role !== "admin" && Date.now() - sale.createdAt.getTime() > KASSE_WINDOW_MS)) notFound();
  const [storno, settings] = await Promise.all([sale.stornoOf === null ? getStornoFor(sale.no) : null, getSettings()]);
  const date = new Intl.DateTimeFormat("de-CH", { timeZone: "Europe/Zurich", day: "2-digit", month: "2-digit", year: "numeric" }).format(sale.createdAt);

  return (
    <>
      <Flash ok={ok} error={error} />
      <div className="receipt-actions no-print">
        <Link href="/admin/kasse" className="btn btn-dark">{k.newSale}</Link>
        <PrintButton label={k.print} />
        {role === "admin" && <Link href="/admin/kasse/auswertung" className="btn btn-light">{k.report}</Link>}
      </div>

      <article className={`receipt${neu ? " is-new" : ""}`}>
        <header className="receipt-head">
          <strong>{site.name}</strong>
          <span>{site.legalName}</span>
          <span>{site.address.street}, {site.address.zip} {site.address.city}</span>
          <span>{site.phone}</span>
          {settings.vatNumber && <span>{k.vatNo} {settings.vatNumber}</span>}
        </header>
        <dl className="receipt-meta">
          <div><dt>{k.receiptNo}</dt><dd>{String(sale.no).padStart(6, "0")}</dd></div>
          <div><dt>{date}</dt><dd>{formatTime(sale.createdAt, locale)}</dd></div>
          <div><dt>{k.servedBy}</dt><dd>{sale.staffName}</dd></div>
        </dl>
        {sale.stornoOf !== null && <p className="receipt-storno">{fill(k.stornoOf, { no: String(sale.stornoOf).padStart(6, "0") })}{sale.note && ` · ${sale.note}`}</p>}
        <ul className="receipt-lines">
          {sale.items.map((i, idx) => (
            <li key={idx}>
              <span>{i.qty > 1 ? `${i.qty} × ` : ""}{i.name}{i.walkin ? ` (${k.walkin})` : ""}</span>
              <span>{chf(i.totalChf)}</span>
            </li>
          ))}
        </ul>
        <div className="receipt-total"><span>{k.total} CHF</span><strong>{chf(sale.totalChf)}</strong></div>
        <dl className="receipt-meta">
          <div><dt>{k.payment}</dt><dd>{k.pay[sale.payment]}</dd></div>
          {sale.givenChf !== null && <div><dt>{k.given}</dt><dd>{chf(sale.givenChf)}</dd></div>}
          {sale.givenChf !== null && <div><dt>{k.change}</dt><dd>{chf(sale.givenChf - sale.totalChf)}</dd></div>}
          {sale.vatRate > 0 && <div><dt>{fill(k.vatIncl, { rate: String(sale.vatRate) })}</dt><dd>{chf(sale.vatChf)}</dd></div>}
        </dl>
        {sale.stornoOf === null && sale.note && <p className="receipt-note">{sale.note}</p>}
        {sale.stornoOf === null && <p className="receipt-thanks">{k.thanks}</p>}
        <p className="receipt-hash">{sale.hash.slice(0, 16)}</p>
      </article>

      {role === "admin" && sale.stornoOf === null && (
        storno ? (
          <p className="muted small no-print"><Link className="link" href={`/admin/kasse/beleg/${storno.no}`}>{fill(k.stornoed, { no: String(storno.no).padStart(6, "0") })}</Link></p>
        ) : (
          <details className="panel receipt-void no-print">
            <summary>{k.storno}</summary>
            <form action={posStorno} className="stack">
              <input type="hidden" name="no" value={sale.no} />
              <label className="field"><span>{k.stornoReason}</span><input className="input" name="reason" required minLength={2} maxLength={200} /></label>
              <ConfirmButton className="btn btn-light" message={k.stornoConfirm}>{k.storno}</ConfirmButton>
            </form>
          </details>
        )
      )}
    </>
  );
}
