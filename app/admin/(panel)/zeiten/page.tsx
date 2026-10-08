import { requireAdmin } from "@/lib/auth";
import { ConfirmButton, SubmitButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { getAdminText } from "@/lib/admin";
import { StaffSwitch } from "@/components/admin/StaffSwitch";
import { getBookingsBetween, getOpeningHours, getUpcomingBlocked, isBookingStaff, type BookingStaff } from "@/lib/data";
import { fill, getDict } from "@/lib/i18n";
import { formatLongDate, formatTime, toDateKey } from "@/lib/time";
import { addBlockedTime, deleteBlockedTime, saveOpeningHours } from "../../actions";

const NAMES: Record<BookingStaff, string> = { zana: "Zana", hikmet: "Hikmet" };

export default async function AdminTimes({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; wer?: string }> }) {
  // Jede Seite prüft selbst: das Layout allein schützt nicht vor direkten RSC-Anfragen
  await requireAdmin();
  const { ok, error, wer } = await searchParams;
  // Zana, Hikmet oder das ganze Geschäft (nur Sperren)
  const staff: BookingStaff | null = wer === "geschaeft" ? null : isBookingStaff(wer) ? wer : "zana";
  const current = staff ?? "geschaeft";
  const { locale, t } = await getAdminText();
  const h = t.hours;
  const weekdays = getDict(locale).common.weekdays;
  const [hours, allBlocked] = await Promise.all([staff ? getOpeningHours(staff) : [], getUpcomingBlocked()]);
  const blocked = allBlocked.filter((b) => b.staffId === staff);
  const conflicts = await Promise.all(blocked.map((b) => getBookingsBetween(b.startsAt, b.endsAt, { staffId: isBookingStaff(b.staffId) ? b.staffId : undefined })));
  const order = [1, 2, 3, 4, 5, 6, 0];
  const today = toDateKey(new Date());

  return (
    <>
      <div className="admin-title">
        <h1 className="h2">{h.title}</h1>
        <p className="muted">{h.hint}</p>
      </div>
      <Flash ok={ok} error={error} />
      <StaffSwitch
        current={current}
        label={h.who}
        options={[{ key: "zana", label: NAMES.zana }, { key: "hikmet", label: NAMES.hikmet }, { key: "geschaeft", label: h.business }]}
        href={(k) => `/admin/zeiten?wer=${k}`}
      />
      <p className="muted small" style={{ margin: 0 }}>{staff ? fill(h.staffHint, { name: NAMES[staff] }) : h.businessHint}</p>

      <div className={staff ? "admin-cols" : ""}>
        {staff && <section className="panel">
          <h2 className="h3" style={{ marginBottom: 16 }}>{h.openingHours}</h2>
          <form action={saveOpeningHours}>
            <input type="hidden" name="staff" value={staff} />
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
        </section>}

        <aside className="panel">
          <h2 className="h3">{staff ? fill(h.blockTitleFor, { name: NAMES[staff] }) : h.blockTitleBusiness}</h2>
          <p className="muted small">{h.blockHint}</p>
          <form action={addBlockedTime} className="stack">
            <input type="hidden" name="staff" value={staff ?? ""} />
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
                    <input type="hidden" name="returnTo" value={`/admin/zeiten?wer=${current}`} />
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
