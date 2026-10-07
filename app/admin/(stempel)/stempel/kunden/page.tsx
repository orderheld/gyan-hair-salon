import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { StempelNav } from "@/components/admin/StempelNav";
import { getAdminText } from "@/lib/admin";
import { getLoyaltySettings, listCards } from "@/lib/loyalty";
import { formatShortDate } from "@/lib/time";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; ok?: string; error?: string }>;

/** Übersicht: alle Karten mit Stempeln, Prämien und Einladungen */
export default async function StempelCustomers({ searchParams }: { searchParams: Search }) {
  const { q = "", ok, error } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.loyalty;
  const [cards, settings] = await Promise.all([listCards(q.slice(0, 80)), getLoyaltySettings()]);
  const needed = settings.stampsNeeded;
  const ready = cards.filter((c) => c.balance >= needed).length;
  const redeemed = cards.reduce((n, c) => n + c.redeemed + c.birthdays, 0);
  const referrals = cards.reduce((n, c) => n + c.referralsRewarded, 0);

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.cardsTitle}</h1>
        <StempelNav active="cards" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />

      <section className="lc-stats">
        <div className="panel"><strong>{cards.length}</strong><span>{t.stats.cards}</span></div>
        <div className="panel"><strong>{ready}</strong><span>{t.stats.ready}</span></div>
        <div className="panel"><strong>{redeemed}</strong><span>{t.stats.redeemed}</span></div>
        <div className="panel"><strong>{referrals}</strong><span>{t.stats.referrals}</span></div>
      </section>

      <section className="panel">
        <form className="cust-search" action="/admin/stempel/kunden">
          <input name="q" type="search" defaultValue={q} placeholder={t.search} className="input" aria-label={t.search} />
          <button className="btn btn-dark btn-sm" type="submit">{t.searchBtn}</button>
        </form>
      </section>

      {cards.length ? (
        <ul className="lc-list lc-cards">
          {cards.map((c) => {
            const onCard = c.balance >= needed ? needed : Math.max(0, c.balance);
            return (
              <li key={c.id}>
                <Link href={`/admin/stempel/karte/${encodeURIComponent(c.token)}`} className="lc-row panel">
                  <span className="cust-avatar" aria-hidden>{(c.name.trim()[0] ?? c.customerKey[0] ?? "?").toUpperCase()}</span>
                  <span className="lc-row-main">
                    <strong>{c.name || c.customerKey}</strong>
                    <span className="muted small">{c.customerKey}{c.referredBy ? ` · ← ${c.referredBy}` : ""}</span>
                    <span className="lc-meta small">
                      <span>{t.col.visits}: {c.visits}</span>
                      <span>{t.col.redeemed}: {c.redeemed + c.birthdays}</span>
                      <span>{t.col.referrals}: {c.referralsMade}</span>
                      {c.lastAt && <span>{t.col.last}: {formatShortDate(c.lastAt, locale)}</span>}
                    </span>
                  </span>
                  <span className={`lc-row-count${c.balance >= needed ? " is-ready" : ""}`} title={t.col.stamps}>
                    {onCard}/{needed}
                    {c.balance >= needed && <small>✂</small>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-state">{t.none}</p>
      )}
    </>
  );
}
