import Link from "next/link";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { StempelNav } from "@/components/admin/StempelNav";
import { site } from "@/content/site";
import { getAdminText } from "@/lib/admin";
import { getBusinessSyncStatus } from "@/lib/google-business";
import { getGoogleStatus, listCardCandidates, listGoogleReviews, type StoredReview } from "@/lib/google-reviews";
import { maskEmail, searchCards, suggestCards, type Suggestion } from "@/lib/review-match";
import { fill } from "@/lib/i18n";
import { getLoyaltySettings } from "@/lib/loyalty";
import {
  googleChooseLocation,
  googleDisconnect,
  googleReviewDismiss,
  googleReviewStamp,
  googleReviewUndo,
  googleSyncNow,
} from "@/app/admin/google-actions";

export const dynamic = "force-dynamic";

type Search = Promise<{ ok?: string; error?: string; pick?: string; q?: string }>;

const intl = (locale: string) => (locale === "de" ? "de-CH" : locale === "fr" ? "fr-CH" : "en-GB");
const fmtDate = (d: Date, locale: string) => new Intl.DateTimeFormat(intl(locale), { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Zurich" }).format(d);
const fmtDateTime = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(intl(locale), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }).format(d);
const short = (text: string, max = 220) => (text.length > max ? `${text.slice(0, max).trimEnd()} …` : text);
const anchor = (id: string) => `r-${id.replace(/[^A-Za-z0-9_-]/g, "")}`;

/* Linien-Symbole */
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.01" /></svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" /></svg>
);
const IconLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/** Google-Bewertungen: neue Bewertungen einer Stempelkarte zuordnen und den Bewertungs-Stempel geben */
export default async function StempelReviews({ searchParams }: { searchParams: Search }) {
  const { ok, error, pick = "", q = "" } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.loyalty;
  const g = t.google;
  const [status, settings, profile] = await Promise.all([getGoogleStatus(), getLoyaltySettings(), getBusinessSyncStatus()]);
  const reviewOff = !settings.reviewEnabled;
  const { fresh, done } = status.connected ? await listGoogleReviews() : { fresh: [], done: [] };
  const cards = fresh.length ? await listCardCandidates() : [];
  const query = q.trim().slice(0, 80);

  const candidate = (review: StoredReview, c: Suggestion) => (
    <li key={c.id} className="gr-cand">
      <div className="gr-cand-main">
        <Link href={`/admin/stempel/karte/${encodeURIComponent(c.token)}`} className="gr-cand-name">{c.name || maskEmail(c.email)}</Link>
        <span className="muted small">{maskEmail(c.email)}</span>
        {c.reviewGiven && <span className="gr-tag"><IconCheck />{g.alreadyGiven}</span>}
      </div>
      <form action={googleReviewStamp}>
        <input type="hidden" name="review" value={review.id} />
        <input type="hidden" name="card" value={c.id} />
        <SubmitButton className={c.reviewGiven ? "btn btn-light btn-sm" : "btn btn-dark btn-sm"} pendingLabel="…" disabled={reviewOff}>
          {c.reviewGiven ? g.linkOnly : g.give}
        </SubmitButton>
      </form>
    </li>
  );

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{g.title}</h1>
        <StempelNav active="reviews" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />
      <p className="muted gr-intro">{g.intro}</p>

      <section className={`panel gr-status${status.connected ? " is-on" : ""}`}>
        {!status.configured ? (
          <>
            <strong className="gr-state"><i aria-hidden />{g.notConfigured}</strong>
            <p className="muted small">{g.notConfiguredHint}</p>
            <ol className="gr-guide small">
              {g.guide.map((step, i) => (
                <li key={i}>{fill(step, { uri: `${site.url}/admin/google/callback` })}</li>
              ))}
            </ol>
          </>
        ) : status.locations.length ? (
          <>
            <strong className="gr-state"><i aria-hidden />{g.chooseLocation}</strong>
            <p className="muted small">{g.chooseLocationHint}</p>
            <ul className="gr-locations">
              {status.locations.map((l) => (
                <li key={l.id}>
                  <form action={googleChooseLocation} className="gr-location">
                    <input type="hidden" name="location" value={l.id} />
                    <span><strong>{l.title}</strong><span className="muted small">{l.address}</span></span>
                    <SubmitButton className="btn btn-dark btn-sm" pendingLabel={all.common.saving}>{g.choose}</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          </>
        ) : status.connected ? (
          <>
            <div className="gr-status-head">
              <div className="gr-status-text">
                <strong className="gr-state"><i aria-hidden />{g.connected}</strong>
                <span className="muted small">{fill(g.location, { title: status.locationTitle })}</span>
                <span className="muted small">{fill(g.lastSync, { date: status.lastSyncAt ? fmtDateTime(status.lastSyncAt, locale) : g.never })}</span>
              </div>
              <form action={googleSyncNow}>
                <SubmitButton className="btn btn-dark btn-sm gr-sync" pendingLabel={g.syncing}><IconRefresh />{g.syncNow}</SubmitButton>
              </form>
            </div>
            {status.lastError && (
              <p className="gr-error small">{g.lastError} {g.errors[status.lastError]}{status.lastErrorDetail ? <span className="muted"> ({status.lastErrorDetail})</span> : null}</p>
            )}
            <p className="muted small">
              {g.profileSync} {fill(g.profileAt, { date: profile.profileAt ? fmtDateTime(profile.profileAt, locale) : g.never })}
              {profile.lastPostAt ? ` · ${fill(g.profilePost, { title: profile.lastPostTitle, date: fmtDateTime(profile.lastPostAt, locale) })}` : ""}
            </p>
            {profile.lastError && <p className="gr-error small">{g.lastError} <span className="muted">{profile.lastError}</span></p>}
            {status.fake && <p className="muted small">{g.fakeHint}</p>}
          </>
        ) : (
          <>
            <strong className="gr-state"><i aria-hidden />{g.notConnected}</strong>
            <p className="muted small">{g.notConnectedHint}</p>
            {status.fake && <p className="muted small">{g.fakeHint}</p>}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Weiterleitung zu Google, keine Seite */}
            <a href="/admin/google/connect" className="btn btn-dark gr-connect"><IconLink />{g.connect}</a>
            <p className="muted small">{g.firstSyncNote}</p>
          </>
        )}
      </section>

      <p className="gr-note small"><IconInfo /><span>{g.starsNote}</span></p>

      {status.connected && (
        <>
          {reviewOff && <div className="lc-warn"><p>{g.reviewOff}</p></div>}

          <section className="gr-section">
            <h2 className="h3">{g.newTitle} <span className="muted">({fresh.length})</span></h2>
            {fresh.length ? (
              <ul className="gr-list">
                {fresh.map((r) => {
                  const suggestions = suggestCards(r.reviewerName, cards);
                  const picked = pick === r.id;
                  const found = picked && query ? searchCards(query, cards).filter((c) => !suggestions.some((s) => s.id === c.id)) : [];
                  return (
                    <li key={r.id} id={anchor(r.id)} className="panel gr-item">
                      <div className="gr-head">
                        <span className="cust-avatar" aria-hidden>{(r.reviewerName.trim()[0] ?? "?").toUpperCase()}</span>
                        <div className="gr-head-text">
                          <strong>{r.reviewerName || "?"}</strong>
                          <span className="muted small">
                            {r.createdAt ? fmtDate(r.createdAt, locale) : ""}
                            {r.stars ? ` · ${fill(g.stars, { n: r.stars })}` : ""}
                          </span>
                        </div>
                      </div>
                      {r.comment && <p className="gr-comment">{short(r.comment)}</p>}

                      <div className="gr-sugg">
                        <p className="gr-label">{g.suggestions}</p>
                        {suggestions.length ? <ul className="gr-cands">{suggestions.map((c) => candidate(r, c))}</ul> : <p className="muted small">{g.noSuggestions}</p>}
                      </div>

                      <details className="gr-find" open={picked}>
                        <summary>{g.findOther}</summary>
                        <form className="cust-search gr-find-form" action={`/admin/stempel/bewertungen#${anchor(r.id)}`}>
                          <input type="hidden" name="pick" value={r.id} />
                          <input name="q" type="search" defaultValue={picked ? query : ""} placeholder={g.findHint} aria-label={g.findHint} className="input" autoComplete="off" />
                          <button className="btn btn-light btn-sm" type="submit">{g.find}</button>
                        </form>
                        {picked && query && (found.length ? <ul className="gr-cands">{found.map((c) => candidate(r, c))}</ul> : <p className="muted small">{g.noResults}</p>)}
                      </details>

                      <form action={googleReviewDismiss} className="gr-dismiss">
                        <input type="hidden" name="review" value={r.id} />
                        <SubmitButton className="btn btn-light btn-sm">{g.dismiss}</SubmitButton>
                      </form>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty-state">{g.newEmpty}</p>
            )}
          </section>

          <details className="panel gr-done">
            <summary>{fill(g.doneTitle, { n: done.length })}</summary>
            {done.length ? (
              <ul className="gr-done-list">
                {done.map((r) => (
                  <li key={r.id}>
                    <div className="gr-head-text">
                      <strong>{r.reviewerName || "?"}</strong>
                      <span className="muted small">
                        {r.createdAt ? fmtDate(r.createdAt, locale) : ""}
                        {r.stars ? ` · ${fill(g.stars, { n: r.stars })}` : ""}
                      </span>
                      {r.status === "stamped" ? (
                        r.card ? (
                          <Link className="gr-done-card small" href={`/admin/stempel/karte/${encodeURIComponent(r.card.token)}`}><IconCheck />{fill(g.stampedFor, { name: r.card.name })}</Link>
                        ) : (
                          <span className="gr-done-card small"><IconCheck />{g.stampedNoCard}</span>
                        )
                      ) : (
                        <span className="muted small">{g.dismissed}</span>
                      )}
                    </div>
                    {r.status === "dismissed" && (
                      <form action={googleReviewUndo}>
                        <input type="hidden" name="review" value={r.id} />
                        <SubmitButton className="btn btn-light btn-sm">{g.undo}</SubmitButton>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">{g.doneEmpty}</p>
            )}
          </details>

          <section className="panel gr-foot">
            <p className="muted small">{g.privacy}</p>
            <form action={googleDisconnect}>
              <ConfirmButton message={g.disconnectConfirm} className="btn btn-light btn-sm">{g.disconnect}</ConfirmButton>
            </form>
          </section>
        </>
      )}
    </>
  );
}
