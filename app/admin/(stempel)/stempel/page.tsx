import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { QrScanner } from "@/components/admin/QrScanner";
import { LoyaltyLiveSwitch } from "@/components/admin/LoyaltyLiveSwitch";
import { StempelNav } from "@/components/admin/StempelNav";
import { getAdminText } from "@/lib/admin";
import { fill } from "@/lib/i18n";
import { getCardByKey, getCardByRef, getCardByToken, getLoyaltySettings, listCards, recentStamps } from "@/lib/loyalty";
import { parseCardPayload } from "@/lib/loyalty-qr";
import { formatShortDate, formatTime } from "@/lib/time";
import { loyaltyCreate } from "@/app/admin/loyalty-actions";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; ok?: string; error?: string }>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Scanner: Kamera, Suche von Hand, zuletzt gestempelt */
export default async function StempelScanner({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { q = "", ok, error } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.loyalty;
  const query = q.trim().slice(0, 120);

  // Eindeutige Treffer direkt öffnen: Karten-Code, E-Mail, Einladungscode
  let results: Awaited<ReturnType<typeof listCards>> = [];
  if (query) {
    const token = parseCardPayload(query);
    const direct = (token && (await getCardByToken(token))) || (EMAIL.test(query) && (await getCardByKey(query))) || (await getCardByRef(query));
    if (direct) redirect(`/admin/stempel/karte/${encodeURIComponent(direct.token)}`);
    results = await listCards(query);
  }
  const [recent, settings] = await Promise.all([query ? [] : recentStamps(8), getLoyaltySettings()]);
  const newEmail = EMAIL.test(query) ? query.toLowerCase() : "";

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.title}</h1>
        <StempelNav active="scan" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />
      <LoyaltyLiveSwitch on={settings.loyaltyPublic} back="/admin/stempel" t={t} pending={all.common.saving} />

      <section className="panel lc-scan-panel">
        <h2 className="h3">{t.scanTitle}</h2>
        <p className="muted small">{t.scanHint}</p>
        <QrScanner t={{ startCamera: t.startCamera, stopCamera: t.stopCamera, cameraDenied: t.cameraDenied, cameraMissing: t.cameraMissing, cameraInsecure: t.cameraInsecure, scanning: t.scanning, found: t.found, notCard: t.notCard }} />
      </section>

      <section className="panel">
        <h2 className="h3">{t.lookupTitle}</h2>
        <form className="cust-search lc-lookup" action="/admin/stempel">
          <input name="q" type="search" defaultValue={query} placeholder={t.lookupHint} className="input" aria-label={t.lookupHint} autoComplete="off" />
          <button className="btn btn-dark btn-sm" type="submit">{t.lookup}</button>
        </form>
        {query && (
          <div className="lc-results">
            {results.length ? (
              <>
                <p className="muted small">{t.results}</p>
                <ul className="lc-list">
                  {results.slice(0, 20).map((c) => (
                    <li key={c.id}>
                      <Link href={`/admin/stempel/karte/${encodeURIComponent(c.token)}`} className="lc-row">
                        <span className="cust-avatar" aria-hidden>{(c.name.trim()[0] ?? c.customerKey[0] ?? "?").toUpperCase()}</span>
                        <span className="lc-row-main"><strong>{c.name || c.customerKey}</strong><span className="muted small">{c.customerKey}</span></span>
                        <span className="lc-row-count">{c.balance}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted">{t.notFound}</p>
            )}
            <form action={loyaltyCreate} className="lc-create">
              {newEmail ? (
                <>
                  <input type="hidden" name="email" value={newEmail} />
                  <div className="field"><label htmlFor="lc-name">{t.createName}</label><input id="lc-name" name="name" className="input" maxLength={80} /></div>
                  <SubmitButton className="btn btn-light btn-sm">{fill(t.createFor, { email: newEmail })}</SubmitButton>
                </>
              ) : (
                <p className="muted small">{t.noEmail}</p>
              )}
            </form>
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section className="panel">
          <h2 className="h3">{t.recent}</h2>
          <ul className="lc-list">
            {recent.map((r, i) => (
              <li key={i}>
                <Link href={`/admin/stempel/karte/${encodeURIComponent(r.token)}`} className="lc-row">
                  <span className={`lc-kind lc-kind-${r.kind}`} aria-hidden>{r.delta > 0 ? `+${r.delta}` : r.delta < 0 ? r.delta : "✓"}</span>
                  <span className="lc-row-main"><strong>{r.name}</strong><span className="muted small">{t.kinds[r.kind]} · {r.actor}</span></span>
                  <span className="muted small">{formatShortDate(r.createdAt, locale)} {formatTime(r.createdAt, locale)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
