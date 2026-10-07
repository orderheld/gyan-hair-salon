import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { LoyaltyLiveSwitch } from "@/components/admin/LoyaltyLiveSwitch";
import { StempelNav } from "@/components/admin/StempelNav";
import { getAdminText } from "@/lib/admin";
import { fill } from "@/lib/i18n";
import { getLoyaltySettings } from "@/lib/loyalty";
import { freeNth } from "@/lib/loyalty-text";
import { appleWalletEnabled, googleWalletEnabled } from "@/lib/wallet";
import { loyaltySaveSettings } from "@/app/admin/loyalty-actions";

export const dynamic = "force-dynamic";

type Search = Promise<{ ok?: string; error?: string }>;

export default async function StempelSettings({ searchParams }: { searchParams: Search }) {
  const { ok, error } = await searchParams;
  const { locale, t: all } = await getAdminText();
  const t = all.loyalty;
  const s = await getLoyaltySettings();
  const toggle = (name: string, label: string, hint: string, checked: boolean) => (
    <div className="lc-setting">
      <label className="switch-row">
        <span>{label}</span>
        <input type="checkbox" name={name} defaultChecked={checked} className="tgl" />
      </label>
      <p className="muted small">{hint}</p>
    </div>
  );

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.settingsTitle}</h1>
        <StempelNav active="settings" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />
      <LoyaltyLiveSwitch on={s.loyaltyPublic} back="/admin/stempel/einstellungen" t={t} pending={all.common.saving} />

      <form action={loyaltySaveSettings} className="panel stack lc-settings">
        <div className="lc-setting">
          <div className="field">
            <label htmlFor="lc-needed">{t.stampsNeeded}</label>
            <input id="lc-needed" name="stampsNeeded" type="number" min={2} max={30} defaultValue={s.stampsNeeded} className="input lc-num" required />
          </div>
          <p className="muted small">{fill(t.stampsNeededHint, { n: s.stampsNeeded, nth: freeNth(s.stampsNeeded, locale) })}</p>
        </div>
        {toggle("birthdayEnabled", t.birthdayEnabled, t.birthdayEnabledHint, s.birthdayEnabled)}
        {toggle("birthdayNotify", t.birthdayNotify, t.birthdayNotifyHint, s.birthdayNotify)}
        {toggle("referralEnabled", t.referralEnabled, t.referralEnabledHint, s.referralEnabled)}
        {toggle("reviewEnabled", t.reviewEnabled, t.reviewEnabledHint, s.reviewEnabled)}
        <SubmitButton pendingLabel={all.common.saving} className="btn btn-dark">{t.save}</SubmitButton>
      </form>

      <section className="panel">
        <h2 className="h3">{t.wallet}</h2>
        <ul className="lc-facts small">
          <li>Apple Wallet: {appleWalletEnabled() ? t.walletOn : t.walletOff}</li>
          <li>Google Wallet: {googleWalletEnabled() ? t.walletOn : t.walletOff}</li>
        </ul>
        <p className="muted small">{t.walletHint}</p>
      </section>
    </>
  );
}
