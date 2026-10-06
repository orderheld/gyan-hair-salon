import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { LOCALES } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { sampleVars, templateFor } from "@/lib/email";
import { fill } from "@/lib/i18n";
import { LOCALE_NAMES } from "@/lib/i18n/config";
import { EMAIL_TYPES, getSettings } from "@/lib/settings";
import { resetEmail, saveEmail, sendEmailTest } from "../../actions";


export default async function Emails({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { locale, t } = await getAdminText();
  const e = t.emails;
  const s = await getSettings();
  const examples = await sampleVars(locale, s);

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{e.title}</h1>
        <p className="muted">{e.hint}</p>
      </div>
      <Flash ok={ok} error={error} />
      <details className="panel legend" open>
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

      <div className="mail-list">
        {EMAIL_TYPES.map((type) => {
          const custom = !!s.emailTemplates[type] && Object.keys(s.emailTemplates[type] ?? {}).length > 0;
          return (
            <section key={type} id={type} className={`panel mail ${s.emailEnabled[type] ? "" : "off"}`}>
              <form action={saveEmail}>
                <input type="hidden" name="type" value={type} />
                <div className="mail-head">
                  <div>
                    <h2 className="h3">{e.types[type]}</h2>
                    <p className="muted small">{fill(e.typeHints[type], { hours: type === "reminder" ? s.reminderHoursBefore : s.followupHoursAfter })}</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="enabled" defaultChecked={s.emailEnabled[type]} />
                    <span className="switch-ui" aria-hidden />
                    <span>{e.enabled}</span>
                  </label>
                </div>

                {LOCALES.map((l) => {
                  const tpl = templateFor(s, type, l);
                  return (
                    <details key={l} className="svc-lang" open={l === locale}>
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
                  <SubmitButton pendingLabel={t.common.saving}>{t.common.save}</SubmitButton>
                </div>
              </form>
            </section>
          );
        })}
      </div>
      <p className="muted small">{e.previewNote}</p>
    </>
  );
}
