import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { VoucherNav } from "@/components/admin/VoucherNav";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { fill } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { getVoucherSettings } from "@/lib/vouchers";
import { voucherSaveSettings } from "@/app/admin/voucher-actions";

export const dynamic = "force-dynamic";

type Search = Promise<{ ok?: string; error?: string }>;

/** Online-Bestellung ein/aus, Beträge zur Auswahl, Mindest- und Höchstbetrag */
export default async function VoucherSettings({ searchParams }: { searchParams: Search }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { ok, error } = await searchParams;
  const { t: all } = await getAdminText();
  const t = all.vouchers;
  const [s, settings] = await Promise.all([getVoucherSettings(), getSettings()]);

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{t.settingsTitle}</h1>
        <VoucherNav active="settings" t={t.nav} />
      </div>
      <Flash ok={ok} error={error} />

      <form action={voucherSaveSettings} className="panel stack lc-settings">
        <div className="lc-setting">
          <label className="switch-row">
            <span>{t.settings.online}</span>
            <input type="checkbox" name="onlineEnabled" defaultChecked={s.onlineEnabled} className="tgl" />
          </label>
          <p className="muted small">{t.settings.onlineHint}</p>
        </div>
        <div className="field">
          <label htmlFor="vs-presets">{t.settings.presets}</label>
          <input id="vs-presets" name="presets" className="input" defaultValue={s.presets.join(", ")} inputMode="numeric" />
          <small className="muted small">{t.settings.presetsHint}</small>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field">
            <label htmlFor="vs-min">{t.settings.min}</label>
            <input id="vs-min" name="minChf" type="number" min={5} max={1000} className="input" defaultValue={s.minChf} />
          </div>
          <div className="field">
            <label htmlFor="vs-max">{t.settings.max}</label>
            <input id="vs-max" name="maxChf" type="number" min={5} max={2000} className="input" defaultValue={s.maxChf} />
          </div>
        </div>
        <p className="muted small" style={{ margin: 0 }}>
          {settings.notifyEmail ? fill(t.settings.mailHint, { email: settings.notifyEmail }) : t.settings.noMail}
        </p>
        <SubmitButton pendingLabel={all.common.saving} className="btn btn-dark">{t.settings.save}</SubmitButton>
      </form>
    </>
  );
}
