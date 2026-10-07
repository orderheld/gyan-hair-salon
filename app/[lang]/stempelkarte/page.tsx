import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Locale } from "@/content/types";
import { site } from "@/content/site";
import { CtaBand, PageHero } from "@/components/site/Blocks";
import { AccountLogin } from "@/components/site/AccountLogin";
import { ProfileGate } from "@/components/site/ProfileGate";
import { getAccountProfile, profileComplete } from "@/lib/customers";
import { RefCapture } from "@/components/loyalty/RefCapture";
import { SaveQr } from "@/components/loyalty/SaveQr";
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

/* Schlichte Linien-Symbole wie bei den Leistungen, keine Emojis */
const PERK_ICONS: Record<string, React.ReactNode> = {
  cut: <><circle cx="7" cy="17" r="2.6" /><circle cx="17" cy="17" r="2.6" /><path d="M8.9 15.2 17 4.5M15.1 15.2 7 4.5" /></>,
  birthday: <><path d="M5 11.5h14V20H5z" /><path d="M3.5 8h17v3.5h-17zM12 8v12" /><path d="M12 8c-1.5-3.5-5-3.5-5-1.2C7 8 9.5 8 12 8zM12 8c1.5-3.5 5-3.5 5-1.2C17 8 14.5 8 12 8z" /></>,
  referral: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.7-3.2 2.9-5 5.5-5s4.8 1.8 5.5 5" /><path d="M18 8v6M15 11h6" /></>,
  review: <path d="M12 4.2l2.3 4.8 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z" />,
};

/** Vorteile der Karte (Haarschnitt, Geburtstag, Einladen, Bewertung), je nach Einstellungen */
async function Perks({ d, s, locale }: { d: Dict; s: LoyaltySettings; locale: Locale }) {
  const t = d.loyalty;
  const nth = freeNth(s.stampsNeeded, locale);
  const reviewUrl = s.reviewEnabled ? (await getSettings()).reviewUrl : "";
  const perks = [
    { icon: "cut", title: fill(t.perkCut, { nth }), text: fill(t.perkCutText, { n: s.stampsNeeded }) },
    s.birthdayEnabled && { icon: "birthday", title: t.perkBirthday, text: t.perkBirthdayText },
    s.referralEnabled && { icon: "referral", title: t.perkReferral, text: t.perkReferralText },
    reviewUrl && { icon: "review", title: t.perkReview, text: t.perkReviewText, link: reviewUrl },
  ].filter(Boolean) as { icon: string; title: string; text: string; link?: string }[];
  return (
    <div className="lc-how">
      <h2 className="h3">{t.howTitle}</h2>
      <ul className="lc-perks">
        {perks.map((p) => (
          <li key={p.title}>
            <span className="lc-perk-icon" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{PERK_ICONS[p.icon]}</svg></span>
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

  // Angemeldet: zuerst einmalig Name, Telefon und Geburtsdatum, dann Karte holen oder anlegen und Einladung verknüpfen
  const profile = await getAccountProfile(email);
  if (!profileComplete(profile)) return <ProfileGate locale={locale} d={d} email={email} profile={profile} />;
  const card = await ensureCard(email, profile.name);
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
            {s.birthdayEnabled && state.birthdayAvailable && <p className="lc-gift">{t.birthdayReady}</p>}
            {s.birthdayEnabled && state.birthdayInMonth && state.birthdayRedeemed && <p className="lc-gift muted">{t.birthdayUsed}</p>}
          </div>

          <div className="lc-qr-box">
            <h2 className="h3">{t.qrTitle}</h2>
            <div className="lc-qr" role="img" aria-label={t.qrAlt} dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="muted">{t.qrHint}</p>
            <SaveQr svg={qr} label={t.saveQr} fileName="gyan-stempelkarte.png" title="GYAN Stempelkarte" />
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
              <ShareInvite url={inviteUrl} t={{ share: t.share, copy: t.copy, copied: t.copied, shareText: t.shareText, title: t.inviteTitle, whatsapp: t.shareWhatsapp, sms: t.shareSms, email: t.shareEmail, more: t.shareMore, subject: t.shareSubject }} />
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
