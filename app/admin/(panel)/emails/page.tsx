import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { DirtyWatch } from "@/components/admin/Stepper";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { sampleVars, templateFor } from "@/lib/email";
import { fill } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { EMAIL_TYPES, getSettings } from "@/lib/settings";
import { countAdminDevices, pushEnabled } from "@/lib/push";
import { adminPushTest, resetEmail, saveEmail, sendEmailTest } from "../../actions";


export default async function Emails({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { locale, t } = await getAdminText();
  const e = t.emails;
  const s = await getSettings();
  const examples = await sampleVars(locale, s);
  const devices = pushEnabled ? await countAdminDevices().catch(() => 0) : 0;

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{e.title}</h1>
        <p className="muted">{e.hint}</p>
      </div>
      <Flash ok={ok} error={error} />
      <section className="panel push-panel" id="push">
        <h2 className="h3">🔔 {t.push.panelTitle}</h2>
        <p className="muted small">{t.push.panelText}</p>
        {!pushEnabled ? (
          <p className="small"><strong>{t.push.notConfigured}</strong></p>
        ) : (
          <div className="push-panel-row">
            <span className="small">{devices === 0 ? t.push.noDevices : devices === 1 ? t.push.devicesOne : fill(t.push.devices, { n: devices })}</span>
            {devices > 0 && (
              <form action={adminPushTest}>
                <SubmitButton className="btn btn-light btn-sm">{t.push.test}</SubmitButton>
              </form>
            )}
          </div>
        )}
      </section>

      <div className="mail-list">
        {EMAIL_TYPES.map((type) => {
          const custom = !!s.emailTemplates[type] && Object.keys(s.emailTemplates[type] ?? {}).length > 0;
          return (
            <section key={type} id={type} className={`panel mail ${s.emailEnabled[type] ? "" : "off"}`}>
              <form action={saveEmail}>
                <DirtyWatch />
                <input type="hidden" name="type" value={type} />
                <div className="mail-head">
                  <div>
                    <h2 className="h3">{e.types[type]}</h2>
                    <p className="muted small">{fill(e.typeHints[type], { hours: type === "reminder" ? s.reminderHoursBefore : s.followupHoursAfter })}</p>
                  </div>
                  <label className="switch-row mail-toggle">
                    <span>{e.enabled}</span>
                    <input type="checkbox" name="enabled" defaultChecked={s.emailEnabled[type]} className="tgl" />
                  </label>
                </div>

                {LOCALES.map((l) => {
                  const tpl = templateFor(s, type, l);
                  return (
                    <details key={l} className="svc-lang">
                      <summary>
                        {LOCALE_NAMES[l]} <span className="muted small">· {tpl.subject}</span>
                      </summary>
                      <div className="svc-lang-body">
                        <div className="field"><label>{e.subject}</label><input name={`subject_${l}`} defaultValue={tpl.subject} className="input" /></div>
                        <div className="field"><label>{e.heading}</label><input name={`heading_${l}`} defaultValue={tpl.heading} className="input" /></div>
                        <div className="field"><label>{e.body}</label><textarea name={`body_${l}`} defaultValue={tpl.body} className="textarea" rows={8} /></div>
                        <div className="mail-tools">
                          <a className="btn btn-light btn-sm" href={`/admin/email-preview?type=${type}&locale=${l}`} target="_blank">{e.preview} ↗</a>
                          <button className="btn btn-light btn-sm" formAction={sendEmailTest.bind(null, l)} type="submit">{e.sendTest}</button>
                        </div>
                      </div>
                    </details>
                  );
                })}

                <div className="svc-foot">
                  {custom && (
                    <button className="link-danger" formAction={resetEmail} type="submit">{e.reset}</button>
                  )}
                  <span className="spacer" />
                  <span className="svc-unsaved">{t.services.unsaved}</span>
                  <SubmitButton pendingLabel={t.common.saving} className="btn btn-dark">{t.common.save}</SubmitButton>
                </div>
              </form>
            </section>
          );
        })}
      </div>
      <p className="muted small">{e.previewNote}</p>
      <details className="panel legend">
        <summary className="h3">{e.legendTitle}</summary>
        <p className="muted small">{e.legendHint}</p>
        <dl className="legend-list">
          {(Object.keys(e.vars) as (keyof typeof e.vars)[]).map((k) => (
            <div key={k}>
              <dt><code>{`{${k}}`}</code></dt>
              <dd>
                {e.vars[k]}
                <span className="muted small">{e.legendExample}: {examples[k] || "–"}</span>
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </>
  );
}
