import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { site } from "@/content/site";
import type { Locale } from "@/content/types";
import { AccountDetails } from "@/components/site/AccountDetails";
import { AccountLogin, AccountLogout } from "@/components/site/AccountLogin";
import { LoyaltySummary } from "@/components/loyalty/LoyaltySummary";
import { TIMEZONE } from "@/lib/config";
import { getAccountProfile, getCustomerBookings, profileComplete } from "@/lib/customers";
import { ProfileGate } from "@/components/site/ProfileGate";
import { getServices, localize, type Booking } from "@/lib/data";
import { formatChf } from "@/lib/format";
import { fill, getDict } from "@/lib/i18n";
import { href, INTL_LOCALE } from "@/lib/i18n/config";
import { privateMetadata } from "@/lib/seo";
import { CUSTOMER_COOKIE, readCustomerCookie } from "@/lib/verify";

// Persönlich: nie zwischenspeichern, nie bei Google
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return privateMetadata(getDict((await params).lang as Locale).account.metaTitle);
}

export default async function MyBookings({ params }: Props) {
  const locale = (await params).lang as Locale;
  const d = getDict(locale);
  const t = d.account;
  const email = readCustomerCookie((await cookies()).get(CUSTOMER_COOKIE)?.value);

  if (!email) {
    return (
      <section className="booking-page">
        <div className="container">
          <div className="confirm-card account-card">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="h2">{t.title}</h1>
            <AccountLogin
              locale={locale}
              t={{
                loginLead: t.loginLead,
                email: t.email,
                sendCode: t.sendCode,
                sending: t.sending,
                codeTitle: t.codeTitle,
                codeText: t.codeText,
                codeLabel: t.codeLabel,
                login: t.login,
                checking: t.checking,
                resend: t.resend,
                resendIn: t.resendIn,
                sent: t.sent,
                change: t.change,
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  const [bookings, services, profile] = await Promise.all([getCustomerBookings(email), getServices(), getAccountProfile(email)]);
  if (!profileComplete(profile)) return <ProfileGate locale={locale} d={d} email={email} profile={profile} />;
  const byId = new Map(services.map((s) => [s.id, localize(s, locale)]));
  const now = Date.now();
  const upcoming = bookings.filter((b) => b.status === "confirmed" && b.endsAt.getTime() > now).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const past = bookings.filter((b) => !upcoming.includes(b)).slice(0, 12);
  const openFee = bookings.filter((b) => b.feeOpen && b.priceChf != null).reduce((sum, b) => sum + (b.priceChf ?? 0), 0);
  const name = profile.name.split(" ")[0];

  const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIMEZONE, ...o });
  const day = fmt({ weekday: "long", day: "numeric", month: "long" });
  const dayYear = fmt({ day: "numeric", month: "short", year: "numeric" });
  const time = fmt({ hour: "2-digit", minute: "2-digit" });
  const serviceName = (b: Booking) => (b.serviceId && byId.get(b.serviceId)?.name) || b.serviceName;
  const bookAgain = (b: Booking) => (b.serviceId && byId.has(b.serviceId) ? `${href(locale, "booking")}?service=${b.serviceId}` : href(locale, "booking"));

  return (
    <section className="booking-page">
      <div className="container account">
        <div className="account-head">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="h2">{name ? fill(t.hello, { name }) : t.title}</h1>
          <p className="muted">
            {fill(t.loggedInAs, { email })} · <AccountLogout label={t.logout} />
          </p>
        </div>

        {openFee > 0 && <p className="late-note">{fill(t.feeOpen, { price: formatChf(openFee) })}</p>}

        <h2 className="h3 account-h">{t.upcoming}</h2>
        {upcoming.length === 0 ? (
          <div className="account-empty">
            <p className="muted">{bookings.length ? t.noUpcoming : t.empty}</p>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{t.book}</Link>
          </div>
        ) : (
          <>
            <ul className="account-list">
              {upcoming.map((b) => (
                <li key={b.id} className="account-item is-next">
                  <div className="account-date">
                    <strong>{day.format(b.startsAt)}</strong>
                    <span>{time.format(b.startsAt)} – {time.format(b.endsAt)}</span>
                  </div>
                  <div className="account-what">
                    <span>{serviceName(b)}</span>
                    {b.priceChf != null && <span className="muted">{formatChf(b.priceChf)} · {d.booking.paymentText}</span>}
                  </div>
                  <div className="account-actions">
                    <a className="btn btn-light btn-sm" href={site.address.mapsUrl} target="_blank" rel="noopener">{d.common.route}</a>
                    {b.startsAt.getTime() > now && (
                      <Link className="btn btn-light btn-sm" href={href(locale, "booking", "storno", b.cancelToken)}>{t.manage}</Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="muted account-hint">
              {t.changeHint} <a className="link" href={site.phoneHref}>{site.phone}</a>
            </p>
            <Link className="btn btn-dark" href={href(locale, "booking")}>{t.book}</Link>
          </>
        )}

        <LoyaltySummary email={email} locale={locale} />

        {(
          <>
            <h2 className="h3 account-h" id="angaben">{t.details}</h2>
            <AccountDetails
              locale={locale}
              email={email}
              t={{ details: t.details, detailsHint: t.detailsHint, detailsSave: t.detailsSave, detailsSaving: t.detailsSaving, detailsSaved: t.detailsSaved, emailFixed: t.emailFixed, name: d.booking.name, phone: d.booking.phone, birthDate: d.booking.birthDate }}
              initial={profile}
            />
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="h3 account-h">{t.past}</h2>
            <ul className="account-list">
              {past.map((b) => (
                <li key={b.id} className="account-item is-past">
                  <div className="account-date">
                    <strong>{dayYear.format(b.startsAt)}</strong>
                    <span>{time.format(b.startsAt)}</span>
                  </div>
                  <div className="account-what">
                    <span>{serviceName(b)}</span>
                    {b.status === "cancelled" ? (
                      <span className="account-badge">{t.cancelled}</span>
                    ) : b.noShow ? (
                      <span className="account-badge">{t.noShow}</span>
                    ) : null}
                  </div>
                  <div className="account-actions">
                    <Link className="btn btn-light btn-sm" href={bookAgain(b)}>{t.again}</Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
