import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { site } from "@/content/site";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { AccountLogin } from "@/components/site/AccountLogin";
import { RefCapture } from "@/components/loyalty/RefCapture";
import { ShareInvite } from "@/components/loyalty/ShareInvite";
import { Stamps } from "@/components/loyalty/Stamps";
import { fill, getDict, type Dict } from "@/lib/i18n";
import { href, INTL_LOCALE } from "@/lib/i18n/config";
import { ensureCard, getCardState, getLoyaltySettings, linkReferral, normalizeRefCode, type LoyaltySettings } from "@/lib/loyalty";
import { cardQrSvg } from "@/lib/loyalty-qr-svg";
import { freeNth } from "@/lib/loyalty-text";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { CUSTOMER_COOKIE, readCustomerCookie } from "@/lib/verify";
import { appleWalletEnabled, googleWalletEnabled } from "@/lib/wallet";
import { TIMEZONE } from "@/lib/config";

// Persönlich, sobald die Karte für Kunden sichtbar ist (Cookie): nie zwischenspeichern
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ ref?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const s = await getLoyaltySettings();
  const nth = freeNth(s.stampsNeeded, locale);
  return pageMetadata({ locale, title: fill(d.loyalty.metaTitle, { nth }), description: fill(d.loyalty.metaDescription, { nth }), path: (l) => href(l, "loyalty") });
}

/** Vorteile der Karte (Haarschnitt, Geburtstag, Einladen, Bewertung), je nach Einstellungen */
async function Perks({ d, s, locale }: { d: Dict; s: LoyaltySettings; locale: Locale }) {
  const t = d.loyalty;
  const nth = freeNth(s.stampsNeeded, locale);
  const reviewUrl = s.reviewEnabled ? (await getSettings()).reviewUrl : "";
  const perks = [
    { icon: "✂", title: fill(t.perkCut, { nth }), text: fill(t.perkCutText, { n: s.stampsNeeded }) },
    s.birthdayEnabled && { icon: "✦", title: t.perkBirthday, text: t.perkBirthdayText },
    s.referralEnabled && { icon: "↗", title: t.perkReferral, text: t.perkReferralText },
    reviewUrl && { icon: "★", title: t.perkReview, text: t.perkReviewText, link: reviewUrl },
  ].filter(Boolean) as { icon: string; title: string; text: string; link?: string }[];
  return (
    <div className="lc-how">
      <h2 className="h3">{t.howTitle}</h2>
      <ul className="lc-perks">
        {perks.map((p) => (
          <li key={p.title}>
            <span className="lc-perk-icon" aria-hidden>{p.icon}</span>
            <div>
              <strong>{p.title}</strong>
              <p className="muted">
                {p.text}
                {p.link && (
                  <>
                    {" "}
                    <a className="link" href={p.link} target="_blank" rel="noopener">{t.perkReviewLink} ↗</a>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="lc-rules small muted">{t.rules}</p>
    </div>
  );
}

export default async function LoyaltyPage({ params, searchParams }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const t = d.loyalty;
  const s = await getLoyaltySettings();
  const nth = freeNth(s.stampsNeeded, locale);
  const crumbs = [{ label: d.nav.home, href: href(locale, "home") }, { label: d.nav.loyalty, href: href(locale, "loyalty") }];

  // Noch nicht freigegeben: «kommt bald»
  if (!s.loyaltyPublic) {
    return (
      <>
        <PageHero eyebrow={t.soon} title={t.title} lead={fill(t.lead, { nth })} crumbs={crumbs} />
        <section className="section-tight">
          <div className="container narrow">
            <div className="stamp-card" data-reveal>
              <span className="stamp-soon">{t.soon}</span>
              <ol className="stamp-grid" aria-hidden>
                {Array.from({ length: s.stampsNeeded + 1 }, (_, i) => (
                  <li key={i} className={i === s.stampsNeeded ? "stamp is-free" : "stamp"}>{i === s.stampsNeeded ? t.free : i + 1}</li>
                ))}
              </ol>
              <h2 className="h3">{fill(t.cardTitle, { nth })}</h2>
              <p className="muted">{t.cardText}</p>
            </div>
            <Perks d={d} s={s} locale={locale} />
            <div className="btn-row" data-reveal>
              <Link className="btn btn-dark" href={href(locale, "booking")}>{d.common.bookCta}</Link>
              <Link className="btn btn-light" href={href(locale, "services")}>{d.common.allServices}</Link>
            </div>
          </div>
        </section>
        <CtaBand locale={locale} d={d} />
      </>
    );
  }

  const jar = await cookies();
  const email = readCustomerCookie(jar.get(CUSTOMER_COOKIE)?.value);
  const refParam = normalizeRefCode((await searchParams).ref ?? "");
  const privacy = (
    <p className="lc-privacy small muted">
      {t.privacy} <Link className="link" href={href(locale, "privacy")}>{t.privacyLink}</Link>
    </p>
  );

  if (!email) {
    return (
      <>
        <PageHero eyebrow={t.eyebrow} title={t.title} lead={fill(t.lead, { nth })} crumbs={crumbs} />
        <section className="section-tight">
          <div className="container narrow lc-page">
            {refParam && <RefCapture code={refParam} />}
            <div className="confirm-card account-card lc-login">
              {refParam && <p className="lc-invited">{t.invitedWelcome}</p>}
              <h2 className="h3">{t.loginTitle}</h2>
              <AccountLogin
                locale={locale}
                t={{
                  loginLead: t.loginLead,
                  email: d.account.email,
                  sendCode: d.account.sendCode,
                  sending: d.account.sending,
                  codeTitle: d.account.codeTitle,
                  codeText: d.account.codeText,
                  codeLabel: d.account.codeLabel,
                  login: d.account.login,
                  checking: d.account.checking,
                  resend: d.account.resend,
                  resendIn: d.account.resendIn,
                  sent: d.account.sent,
                  change: d.account.change,
                }}
              />
            </div>
            <Perks d={d} s={s} locale={locale} />
            {privacy}
          </div>
        </section>
      </>
    );
  }

  // Angemeldet: Karte holen oder anlegen, Einladung (Link oder gemerkter Code) verknüpfen
  const card = await ensureCard(email);
  const ref = refParam || normalizeRefCode(jar.get("gyan_ref")?.value ?? "");
  const refResult = ref && ref !== card.refCode ? await linkReferral(card, ref) : ref ? "self" : null;
  const [state, qr] = await Promise.all([getCardState(card, { logLimit: 8 }), cardQrSvg(card.token)]);
  const needed = s.stampsNeeded;
  const inviteUrl = `${site.url}${href(locale, "loyalty")}?ref=${card.refCode}`;
  const refError = refParam && refResult && refResult !== "ok" && refResult !== "already" && refResult !== "disabled" ? t[refResult === "notNew" ? "refNotNew" : refResult === "self" ? "refSelf" : "refInvalid"] : null;
  const dateFmt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIMEZONE, day: "numeric", month: "short", year: "numeric" });
  const apple = appleWalletEnabled();
  const google = googleWalletEnabled();

  return (
    <>
      <section className="booking-page lc-live">
        <div className="container narrow lc-page">
          <div className="account-head">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h2">{t.yourCard}</h1>
            <p className="muted">{fill(d.account.loggedInAs, { email })} · <Link className="link" href={href(locale, "account")}>{d.account.nav}</Link></p>
          </div>
          {refError && <p className="alert lc-alert" role="status">{refError}</p>}

          <div className="lc-pass">
            <div className="lc-pass-head">
              <span className="lc-brand">GYAN</span>
              <span className="lc-pass-name">{state.card.name || email}</span>
            </div>
            <Stamps onCard={state.onCard} needed={needed} freeLabel={t.free} label={fill(t.stampsOf, { n: state.onCard, total: needed })} />
            <p className="lc-count">
              <strong>{fill(t.stampsOf, { n: state.onCard, total: needed })}</strong>
              <span>{state.rewardsAvailable ? (state.rewardsAvailable > 1 ? fill(t.rewardsReady, { n: state.rewardsAvailable }) : t.rewardReady) : fill(t.toGo, { n: needed - state.onCard })}</span>
            </p>
            {s.birthdayEnabled && state.birthdayAvailable && <p className="lc-gift">✦ {t.birthdayReady}</p>}
            {s.birthdayEnabled && state.birthdayInMonth && state.birthdayRedeemed && <p className="lc-gift muted">{t.birthdayUsed}</p>}
          </div>

          <div className="lc-qr-box">
            <h2 className="h3">{t.qrTitle}</h2>
            <div className="lc-qr" role="img" aria-label={t.qrAlt} dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="muted">{t.qrHint}</p>
            {(apple || google) && (
              <div className="lc-wallets">
                {apple && <a className="btn btn-dark btn-sm" href={`/api/loyalty/apple?l=${locale}`}>{t.appleWallet}</a>}
                {google && <a className="btn btn-light btn-sm" href={`/api/loyalty/google?l=${locale}`}>{t.googleWallet}</a>}
              </div>
            )}
            <p className="lc-tip small muted">{t.homeHint}</p>
          </div>

          {s.birthdayEnabled && !state.birthDate && <p className="lc-note-box small">{t.birthdayMissing}</p>}

          {s.referralEnabled && (
            <div className="lc-invite">
              <h2 className="h3">{t.inviteTitle}</h2>
              <p className="muted">{t.inviteText}</p>
              {state.referredBy && <p className="small muted">{fill(t.invitedBy, { name: state.referredBy.name.split(" ")[0] || state.referredBy.refCode })}</p>}
              <ShareInvite url={inviteUrl} t={{ share: t.share, copy: t.copy, copied: t.copied, shareText: t.shareText, title: t.inviteTitle }} />
              <p className="small muted">
                {t.inviteCode}: <strong>{card.refCode}</strong>
                {state.referrals.count > 0 && <> · {fill(t.invitedCount, { n: state.referrals.count, m: state.referrals.rewarded })}</>}
              </p>
            </div>
          )}

          {state.log.length > 0 && (
            <div className="lc-history">
              <h2 className="h3">{t.historyTitle}</h2>
              <ul>
                {state.log.map((e) => (
                  <li key={e.seq}>
                    <span>{t.kinds[e.kind]}</span>
                    <span className="muted">{dateFmt.format(e.createdAt)}</span>
                    <strong>{e.delta > 0 ? `+${e.delta}` : e.delta < 0 ? e.delta : "✓"}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Perks d={d} s={s} locale={locale} />
          {privacy}
        </div>
      </section>
    </>
  );
}
