import Link from "next/link";
import type { Locale } from "@/content/types";
import { fill, getDict } from "@/lib/i18n";
import { href } from "@/lib/i18n/config";
import { ensureCard, getCardState, getLoyaltySettings } from "@/lib/loyalty";
import { cardQrSvg } from "@/lib/loyalty-qr-svg";
import { Stamps } from "./Stamps";

/** «Mein Konto»: kurze Stempelkarte mit QR-Code (nur wenn die Karte für Kunden sichtbar ist) */
export async function LoyaltySummary({ email, locale }: { email: string; locale: Locale }) {
  const settings = await getLoyaltySettings();
  if (!settings.loyaltyPublic) return null;
  const t = getDict(locale).loyalty;
  const card = await ensureCard(email);
  const [s, qr] = await Promise.all([getCardState(card, { logLimit: 1 }), cardQrSvg(card.token)]);
  const needed = settings.stampsNeeded;
  return (
    <>
      <h2 className="h3 account-h">{t.accountTitle}</h2>
      <div className="lc-summary">
        <div className="lc-summary-main">
          <Stamps onCard={s.onCard} kinds={s.onCardKinds} legend={{ referral: t.bonusReferral, review: t.bonusReview }} needed={needed} freeLabel={t.free} label={fill(t.stampsOf, { n: s.onCard, total: needed })} compact />
          <p className="lc-count">
            <strong>{fill(t.stampsOf, { n: s.onCard, total: needed })}</strong>
            <span className="muted">{s.rewardsAvailable ? t.rewardReady : fill(t.toGo, { n: needed - s.onCard })}</span>
          </p>
          {s.birthdayAvailable && <p className="lc-gift">{t.birthdayReady}</p>}
          <Link className="btn btn-light btn-sm" href={href(locale, "loyalty")}>{t.accountLink}</Link>
        </div>
        <div className="lc-qr lc-qr-sm" role="img" aria-label={t.qrAlt} dangerouslySetInnerHTML={{ __html: qr }} />
      </div>
    </>
  );
}
