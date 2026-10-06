import { SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { getAdminText } from "@/lib/admin";
import { getSettings, SLOT_STEPS } from "@/lib/settings";
import { saveRules } from "../../actions";

const NOTICE = [0, 15, 30, 60, 120, 180, 240, 360, 720, 1440, 2880];
const BUFFER = [0, 5, 10, 15, 20, 30, 45, 60];

export default async function Rules({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { t } = await getAdminText();
  const r = t.rules;
  const s = await getSettings();
  const mins = (m: number) =>
    m === 0 ? "0" : m < 60 ? `${m} ${t.common.minutes}` : m % 1440 === 0 ? `${m / 1440} ${m === 1440 ? t.common.day : t.common.days}` : `${m / 60} ${m === 60 ? t.common.hour : t.common.hours}`;
  const notice = NOTICE.includes(s.minNoticeMin) ? NOTICE : [...NOTICE, s.minNoticeMin].sort((a, b) => a - b);

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{r.title}</h1>
        <p className="muted">{r.hint}</p>
      </div>
      <Flash ok={ok} error={error} />

      <form action={saveRules} className="rules">
        <section className="panel rules-grid">
          <div className="rule">
            <div><label htmlFor="slotStepMin" className="rule-label">{r.slotStep}</label><p className="muted small">{r.slotStepHint}</p></div>
            <select id="slotStepMin" name="slotStepMin" defaultValue={s.slotStepMin} className="select">
              {SLOT_STEPS.map((n) => <option key={n} value={n}>{n} {t.common.minutes}</option>)}
            </select>
          </div>
          <div className="rule">
            <div><label htmlFor="minNoticeMin" className="rule-label">{r.minNotice}</label><p className="muted small">{r.minNoticeHint}</p></div>
            <select id="minNoticeMin" name="minNoticeMin" defaultValue={s.minNoticeMin} className="select">
              {notice.map((n) => <option key={n} value={n}>{mins(n)}</option>)}
            </select>
          </div>
          <div className="rule">
            <div><label htmlFor="horizonDays" className="rule-label">{r.horizon}</label><p className="muted small">{r.horizonHint}</p></div>
            <div className="unit"><input id="horizonDays" name="horizonDays" type="number" min={1} max={365} defaultValue={s.horizonDays} className="input" /><span>{t.common.days}</span></div>
          </div>
          <div className="rule">
            <div><label htmlFor="bufferMin" className="rule-label">{r.buffer}</label><p className="muted small">{r.bufferHint}</p></div>
            <select id="bufferMin" name="bufferMin" defaultValue={s.bufferMin} className="select">
              {(BUFFER.includes(s.bufferMin) ? BUFFER : [...BUFFER, s.bufferMin].sort((a, b) => a - b)).map((n) => <option key={n} value={n}>{n} {t.common.minutes}</option>)}
            </select>
          </div>
          <div className="rule">
            <div><label htmlFor="cancelNoticeHours" className="rule-label">{r.cancelNotice}</label><p className="muted small">{r.cancelNoticeHint}</p></div>
            <div className="unit"><input id="cancelNoticeHours" name="cancelNoticeHours" type="number" min={0} max={168} defaultValue={s.cancelNoticeHours} className="input" /><span>{t.common.hours} {r.before}</span></div>
          </div>
          <div className="rule">
            <div><label htmlFor="reminderHoursBefore" className="rule-label">{r.reminder}</label><p className="muted small">{r.reminderHint}</p></div>
            <div className="unit"><input id="reminderHoursBefore" name="reminderHoursBefore" type="number" min={1} max={48} defaultValue={s.reminderHoursBefore} className="input" /><span>{t.common.hours} {r.before}</span></div>
          </div>
          <div className="rule">
            <div><label htmlFor="followupHoursAfter" className="rule-label">{r.followup}</label><p className="muted small">{r.followupHint}</p></div>
            <div className="unit"><input id="followupHoursAfter" name="followupHoursAfter" type="number" min={1} max={72} defaultValue={s.followupHoursAfter} className="input" /><span>{t.common.hours} {r.after}</span></div>
          </div>
          <p className="muted small rule-note">{r.durationHint}</p>
        </section>

        <section className="panel stack">
          <h2 className="h3">{r.links}</h2>
          <div className="field"><label htmlFor="reviewUrl">{r.reviewUrl}</label><input id="reviewUrl" name="reviewUrl" type="url" defaultValue={s.reviewUrl} className="input" /></div>
          <div className="field"><label htmlFor="instagramUrl">{r.instagramUrl}</label><input id="instagramUrl" name="instagramUrl" type="url" defaultValue={s.instagramUrl} className="input" /></div>
          <div className="field">
            <label htmlFor="notifyEmail">{r.notifyEmail}</label>
            <input id="notifyEmail" name="notifyEmail" type="email" defaultValue={s.notifyEmail} className="input" />
            <p className="muted small" style={{ margin: 0 }}>{r.notifyEmailHint}</p>
          </div>
        </section>

        <div className="sticky-save">
          <SubmitButton className="btn btn-dark" pendingLabel={t.common.saving}>{t.common.save}</SubmitButton>
        </div>
      </form>
    </>
  );
}
