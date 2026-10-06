import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { getAdminText } from "@/lib/admin";
import { getBookingsBetween, getOpeningHours, getUpcomingBlocked } from "@/lib/data";
import { fill, getDict } from "@/lib/i18n";
import { formatLongDate, formatTime, toDateKey } from "@/lib/time";
import { addBlockedTime, deleteBlockedTime, saveOpeningHours } from "../../actions";

export default async function AdminTimes({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { ok, error } = await searchParams;
  const { locale, t } = await getAdminText();
  const h = t.hours;
  const weekdays = getDict(locale).common.weekdays;
  const [hours, blocked] = await Promise.all([getOpeningHours(), getUpcomingBlocked()]);
  const conflicts = await Promise.all(blocked.map((b) => getBookingsBetween(b.startsAt, b.endsAt)));
  const order = [1, 2, 3, 4, 5, 6, 0];
  const today = toDateKey(new Date());

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{h.title}</h1>
        <p className="muted">{h.hint}</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="admin-cols">
        <section className="panel">
          <h2 className="h3" style={{ marginBottom: 16 }}>{h.openingHours}</h2>
          <form action={saveOpeningHours}>
            <div className="hours-table">
              <div className="hours-head"><span>{h.day}</span><span>{h.open}</span><span>{h.from}</span><span>{h.to}</span><span>{h.breakFrom}</span><span>{h.breakTo}</span></div>
              {order.map((d) => {
                const day = hours.find((x) => x.weekday === d);
                return (
                  <div key={d} className="hours-row">
                    <span className="hours-day">{weekdays[d]}</span>
                    <label className="check-row"><input type="checkbox" name={`open_${d}`} defaultChecked={day?.isOpen ?? false} /><span className="sm-only">{h.open}</span></label>
                    <label className="hrs-f"><span className="sm-only">{h.from}</span><input type="time" name={`from_${d}`} defaultValue={day?.openTime ?? "09:00"} className="input" step={300} aria-label={h.from} /></label>
                    <label className="hrs-f"><span className="sm-only">{h.to}</span><input type="time" name={`to_${d}`} defaultValue={day?.closeTime ?? "18:00"} className="input" step={300} aria-label={h.to} /></label>
                    <label className="hrs-f"><span className="sm-only">{h.breakFrom}</span><input type="time" name={`bs_${d}`} defaultValue={day?.breakStart ?? ""} className="input" step={300} aria-label={h.breakFrom} /></label>
                    <label className="hrs-f"><span className="sm-only">{h.breakTo}</span><input type="time" name={`be_${d}`} defaultValue={day?.breakEnd ?? ""} className="input" step={300} aria-label={h.breakTo} /></label>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <SubmitButton pendingLabel={t.common.saving}>{h.saveHours}</SubmitButton>
            </div>
          </form>
        </section>

        <aside className="panel">
          <h2 className="h3">{h.blockTitle}</h2>
          <p className="muted small">{h.blockHint}</p>
          <form action={addBlockedTime} className="stack">
            <div className="row2">
              <div className="field"><label>{h.fromDate}</label><input type="date" name="fromDate" defaultValue={today} className="input" required /></div>
              <div className="field"><label>{h.from}</label><input type="time" name="fromTime" defaultValue="09:00" className="input" step={300} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>{h.toDate}</label><input type="date" name="toDate" defaultValue={today} className="input" /></div>
              <div className="field"><label>{h.to}</label><input type="time" name="toTime" defaultValue="12:00" className="input" step={300} /></div>
            </div>
            <label className="check-row"><input type="checkbox" name="allDay" /> {h.allDay}</label>
            <div className="field"><label>{h.reason}</label><input name="reason" className="input" placeholder={h.reasonPlaceholder} /></div>
            <SubmitButton className="btn btn-dark" pendingLabel={t.common.saving}>{h.block}</SubmitButton>
          </form>
        </aside>
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 className="h3">{h.upcoming}</h2>
        {blocked.length ? (
          <ul className="bk-list">
            {blocked.map((b, i) => (
              <li key={b.id} className="bk">
                <div className="bk-body">
                  <div className="bk-title"><strong>{b.reason || h.defaultReason}</strong></div>
                  <div className="bk-meta">
                    {formatLongDate(b.startsAt, locale)}, {formatTime(b.startsAt, locale)} –{" "}
                    {toDateKey(b.startsAt) === toDateKey(b.endsAt) ? "" : `${formatLongDate(b.endsAt, locale)}, `}{formatTime(b.endsAt, locale)}
                  </div>
                  {conflicts[i].length > 0 && <p className="bk-warn">{fill(h.conflict, { n: conflicts[i].length })}</p>}
                </div>
                <div className="bk-actions">
                  <form action={deleteBlockedTime}>
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmButton message={h.removeConfirm}>{t.common.remove}</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">{h.none}</p>
        )}
      </section>
    </>
  );
}
