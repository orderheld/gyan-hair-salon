import { cookies } from "next/headers";
import Link from "next/link";
import { ActionButton } from "@/components/admin/ActionButton";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { StempelNav } from "@/components/admin/StempelNav";
import { Stamps } from "@/components/loyalty/Stamps";
import { getAdminText } from "@/lib/admin";
import { fill } from "@/lib/i18n";
import { ensureCard, getCardByToken, getCardState, listStaffNames, STAFF_COOKIE } from "@/lib/loyalty";
import { freeNth } from "@/lib/loyalty-text";
import { formatShortDate, formatTime, toDateKey } from "@/lib/time";
import {
  loyaltyBirthDate,
  loyaltyBirthday,
  loyaltyCorrection,
  loyaltyDelete,
  loyaltyRedeem,
  loyaltyReferral,
  loyaltyReview,
  loyaltyVisit,
} from "@/app/admin/loyalty-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ ok?: string; error?: string; confirm?: string }> };

/** Eine Karte: Stand, Stempeln, Prämien einlösen, Protokoll */
export default async function StempelCard({ params, searchParams }: Props) {
  const { token } = await params;
  const { ok, error, confirm } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.loyalty;
  const found = await getCardByToken(decodeURIComponent(token));
  if (!found) {
    return (
      <>
        <div className="admin-title"><h1 className="h2">{t.title}</h1><StempelNav active="scan" t={t.nav} /></div>
        <div className="alert alert-error" role="alert">{t.notFound}</div>
        <Link className="btn btn-dark" href="/admin/stempel">{t.back}</Link>
      </>
    );
  }
  // Name aus den Buchungen aktuell halten
  const card = found.customerKey.includes("@") ? await ensureCard(found.customerKey, found.name) : found;
  const [s, staff] = await Promise.all([getCardState(card), listStaffNames()]);
  const chosen = (await cookies()).get(STAFF_COOKIE)?.value ?? "";
  const needed = s.settings.stampsNeeded;
  const name = card.name || card.customerKey;
  const minutesAgo = s.lastVisitAt ? Math.max(1, Math.round((Date.now() - s.lastVisitAt.getTime()) / 60000)) : 0;
  const year = Number(toDateKey(new Date()).slice(0, 4));
  const bday = s.birthDate ? new Intl.DateTimeFormat(locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "en-GB", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${s.birthDate}T12:00:00Z`)) : "";

  const hidden = (
    <>
      <input type="hidden" name="token" value={card.token} />
      <input type="hidden" name="seq" value={s.seq} />
    </>
  );
  const actorField = staff.length ? (
    <div className="field lc-who">
      <label htmlFor="lc-actor">{t.who}</label>
      <select id="lc-actor" name="actor" className="select" defaultValue={staff.includes(chosen) ? chosen : staff[0]}>
        {staff.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  ) : (
    <input type="hidden" name="actor" value="Admin" />
  );
  const actorHidden = <input type="hidden" name="actor" value={staff.includes(chosen) ? chosen : staff[0] ?? "Admin"} />;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.title}</h1>
        <StempelNav active="scan" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />

      <section className="panel lc-card">
        <div className="lc-card-head">
          <span className="cust-avatar" aria-hidden>{(name.trim()[0] ?? "?").toUpperCase()}</span>
          <div className="lc-card-name">
            <strong>{name}</strong>
            <span className="muted small">{card.customerKey}</span>
          </div>
        </div>
        <Stamps onCard={s.onCard} kinds={s.onCardKinds} needed={needed} freeLabel="Gratis" label={fill(t.stampsOf, { n: s.onCard, total: needed })} compact />
        <p className="lc-count">
          <strong>{fill(t.stampsOf, { n: s.onCard, total: needed })}</strong>
          <span className={s.rewardsAvailable ? "lc-ready" : "muted"}>{s.rewardsAvailable ? fill(t.rewardsReady, { n: s.rewardsAvailable }) : fill(t.noReward, { n: needed - s.onCard })}</span>
        </p>

        {confirm === "visit" && s.recentVisit && (
          <form className="lc-warn" action={loyaltyVisit}>
            {hidden}
            {actorHidden}
            <input type="hidden" name="force" value="1" />
            <p>{fill(t.recentWarn, { min: minutesAgo })}</p>
            <SubmitButton className="btn btn-dark btn-sm">{t.recentForce}</SubmitButton>
          </form>
        )}

        <form className="lc-actions">
          {hidden}
          {actorField}
          <ActionButton action={loyaltyVisit} className="btn btn-dark lc-big">{t.addVisit}</ActionButton>
          <p className="muted small lc-note">{t.addVisitHint}</p>
          {s.rewardsAvailable > 0 && (
            <ActionButton action={loyaltyRedeem} className="btn btn-dark lc-big lc-reward" confirm={fill(t.redeemConfirm, { name, n: needed })}>
              {t.redeem}
            </ActionButton>
          )}
          {s.birthdayAvailable && (
            <ActionButton action={loyaltyBirthday} className="btn btn-light lc-big" confirm={fill(t.birthdayConfirm, { name })}>
              🎂 {t.birthday}
            </ActionButton>
          )}
          {s.settings.reviewEnabled && !s.reviewGiven && (
            <>
              <ActionButton action={loyaltyReview} className="btn btn-light">{t.review}</ActionButton>
              <p className="muted small lc-note">{t.reviewHint}</p>
            </>
          )}
        </form>

        <ul className="lc-facts small">
          {s.settings.birthdayEnabled && (
            <li>
              {s.birthDate ? fill(t.birthdayInfo, { date: bday }) : t.birthdayUnknown}
              {s.birthdayAvailable ? ` · ${t.birthdayAvailable}` : s.birthdayRedeemed ? ` · ${fill(t.birthdayUsed, { year })}` : ""}
            </li>
          )}
          {s.settings.reviewEnabled && s.reviewGiven && <li>{t.reviewGiven}</li>}
          {s.referredBy && <li>{fill(t.referredBy, { name: s.referredBy.name || s.referredBy.refCode })} · {s.referredBy.rewarded ? t.referredRewarded : t.referredPending}</li>}
          <li>{fill(t.referrals, { n: s.referrals.count, m: s.referrals.rewarded })}</li>
          <li>{t.refCode}: <code>{card.refCode}</code> · {fill(t.since, { date: formatShortDate(card.createdAt, locale) })}</li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="h3">{t.log}</h2>
        {s.log.length ? (
          <ul className="lc-log">
            {s.log.map((e) => (
              <li key={e.seq}>
                <span className={`lc-kind lc-kind-${e.kind}`} aria-hidden>{e.delta > 0 ? `+${e.delta}` : e.delta < 0 ? e.delta : "✓"}</span>
                <span className="lc-row-main">
                  <strong>{t.kinds[e.kind]}{e.kind === "birthday" && e.year ? ` ${e.year}` : ""}</strong>
                  <span className="muted small">
                    {formatShortDate(e.createdAt, locale)} {formatTime(e.createdAt, locale)} · {e.actor}
                    {e.refName ? ` · ${fill(t.refFor, { name: e.refName })}` : ""}
                    {e.reason ? ` · ${e.reason}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">–</p>
        )}
      </section>

      <details className="panel lc-tools" key={`tools-${s.seq}`}>
        <summary className="lc-tools-sum"><strong>{t.correction}</strong><span aria-hidden>›</span></summary>
        <form action={loyaltyCorrection} className="stack">
          {hidden}
          {actorHidden}
          <p className="muted small">{t.correctionHint}</p>
          <div className="lc-pm">
            <ConfirmButton name="dir" value="minus" className="lc-pm-btn" disabled={s.balance < 1} message={t.corrConfirmMinus} ariaLabel={t.corrMinus}>
              <span aria-hidden>−</span><small>1</small>
            </ConfirmButton>
            <ConfirmButton name="dir" value="plus" className="lc-pm-btn" message={t.corrConfirmPlus} ariaLabel={t.corrPlus}>
              <span aria-hidden>+</span><small>1</small>
            </ConfirmButton>
          </div>
          <div className="field"><label htmlFor="lc-reason">{t.reason}</label><input id="lc-reason" name="reason" className="input" maxLength={300} placeholder={t.reasonPlaceholder} /></div>
        </form>
        {s.settings.referralEnabled && !s.referredBy && s.isNew && (
          <form action={loyaltyReferral} className="stack lc-sep">
            {hidden}
            <div className="field"><label htmlFor="lc-ref">{t.referralLink}</label><input id="lc-ref" name="code" className="input" maxLength={20} autoCapitalize="characters" required /></div>
            <p className="muted small">{t.referralLinkHint}</p>
            <SubmitButton className="btn btn-light btn-sm">{t.referralSave}</SubmitButton>
          </form>
        )}
        {s.settings.birthdayEnabled && !s.birthDate && (
          <form action={loyaltyBirthDate} className="stack lc-sep">
            {hidden}
            <div className="field"><label htmlFor="lc-bd">{t.birthDate}</label><input id="lc-bd" name="birthDate" type="date" className="input" required /></div>
            <SubmitButton className="btn btn-light btn-sm">{t.birthdaySet}</SubmitButton>
          </form>
        )}
        <form action={loyaltyDelete} className="lc-sep">
          {hidden}
          <ConfirmButton message={fill(t.deleteConfirm, { name })} className="btn btn-light btn-sm">{t.deleteCard}</ConfirmButton>
        </form>
      </details>

      <p className="muted small">{fill(all.loyalty.stampsNeededHint, { n: needed, nth: freeNth(needed, locale) })}</p>
    </>
  );
}
