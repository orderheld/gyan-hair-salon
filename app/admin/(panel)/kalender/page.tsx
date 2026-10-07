import Link from "next/link";
import { DayPick } from "@/components/admin/DayPick";
import { Flash } from "@/components/admin/Flash";
import type { Locale } from "@/content/types";
import { getAdminText } from "@/lib/admin";
import { getBlockedBetween, getBookingsBetween, getOpeningHours, type Blocked, type Booking, type OpeningDay } from "@/lib/data";
import { fill, type AdminDict } from "@/lib/i18n";
import { addDays, formatTime, isDateKey, toDateKey, weekdayOf, zurichParts, zurichToDate } from "@/lib/time";

type View = "day" | "week" | "month";
type Search = Promise<{ datum?: string; ansicht?: string; storniert?: string; ok?: string; error?: string }>;

const PPM = 1.5; // Pixel pro Minute im Raster
const INTL: Record<Locale, string> = { de: "de-CH", fr: "fr-CH", en: "en-GB" };
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Minuten seit Mitternacht (Zürich) innerhalb eines Tages, abgeschnitten auf 0–1440 */
function minutesIn(day: string, date: Date) {
  const key = toDateKey(date);
  if (key < day) return 0;
  if (key > day) return 24 * 60;
  const p = zurichParts(date);
  return p.hour * 60 + p.minute;
}

function mondayOf(day: string) {
  return addDays(day, -((weekdayOf(day) + 6) % 7));
}

function label(day: string, locale: Locale, o: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(INTL[locale], { timeZone: "UTC", ...o }).format(new Date(`${day}T12:00:00Z`));
}

function DayColumn({
  day, bookings, blocked, hours, range, today, now, t, locale, wide,
}: {
  day: string; bookings: Booking[]; blocked: Blocked[]; hours?: OpeningDay; range: [number, number];
  today: string; now: number; t: AdminDict; locale: Locale; wide: boolean;
}) {
  const [from, to] = range;
  const top = (m: number) => (Math.max(m, from) - from) * PPM;
  const slots: number[] = [];
  for (let m = from; m < to; m += 30) slots.push(m);
  const closed = !hours?.isOpen;
  const open = hours?.isOpen ? [toMin(hours.openTime), toMin(hours.closeTime)] : null;
  const pause = hours?.isOpen && hours.breakStart && hours.breakEnd ? [toMin(hours.breakStart), toMin(hours.breakEnd)] : null;
  const dateLabel = label(day, locale, { day: "numeric", month: "long" });
  return (
    <div className={`cal-col${closed ? " is-closed" : ""}${day === today ? " is-today" : ""}`} style={{ height: (to - from) * PPM }}>
      {open && open[0] > from && <div className="cal-off" style={{ top: 0, height: top(open[0]) }} />}
      {open && open[1] < to && <div className="cal-off" style={{ top: top(open[1]), height: (to - Math.max(open[1], from)) * PPM }} />}
      {pause && <div className="cal-off" style={{ top: top(pause[0]), height: (pause[1] - pause[0]) * PPM }} />}
      {closed && <span className="cal-closed-label">{t.calendar.closed}</span>}
      {slots.map((m) => (
        <Link
          key={m}
          className="cal-slot"
          style={{ top: top(m), height: 30 * PPM }}
          href={`/admin?datum=${day}&zeit=${hhmm(m)}#neu`}
          aria-label={fill(t.calendar.newAt, { date: dateLabel, time: hhmm(m) })}
          prefetch={false}
        />
      ))}
      {blocked.map((x) => {
        const s = minutesIn(day, x.startsAt);
        const e = minutesIn(day, x.endsAt);
        if (e <= from || s >= to) return null;
        return (
          <Link key={x.id} href="/admin/zeiten" className="cal-block" style={{ top: top(s), height: Math.max((Math.min(e, to) - Math.max(s, from)) * PPM, 18) }}>
            <span>{t.calendar.blocked}{x.reason ? ` · ${x.reason}` : ""}</span>
          </Link>
        );
      })}
      {bookings.map((b) => {
        const s = minutesIn(day, b.startsAt);
        const e = minutesIn(day, b.endsAt);
        const h = Math.max((e - s) * PPM, 22);
        const cancelled = b.status === "cancelled";
        return (
          <Link
            key={b.id}
            href={`/admin/termin/${b.id}`}
            className={`cal-bk${cancelled ? " is-cancelled" : ""}${b.noShow ? " is-noshow" : ""}${b.source === "admin" ? " is-manual" : ""}${h < 54 ? " is-short" : ""}`}
            style={{ top: top(s), height: h }}
          >
            <span className="cal-bk-time">{formatTime(b.startsAt, locale)}</span>
            <strong className="cal-bk-name">{b.customerName}</strong>
            <span className="cal-bk-svc">{b.serviceName}{cancelled ? ` · ${t.calendar.cancelled}` : ""}</span>
            {wide && b.customerPhone && <span className="cal-bk-svc">{b.customerPhone}</span>}
          </Link>
        );
      })}
      {day === today && now > from && now < to && (
        <div className="cal-now" style={{ top: top(now) }} aria-label={t.calendar.now} />
      )}
    </div>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const { locale, t } = await getAdminText();
  const today = toDateKey(new Date());
  const day = sp.datum && isDateKey(sp.datum) ? sp.datum : today;
  const view: View = sp.ansicht === "day" || sp.ansicht === "month" ? sp.ansicht : "week";
  const showCancelled = sp.storniert === "1";

  // Sichtbare Tage
  let days: string[];
  if (view === "day") days = [day];
  else if (view === "week") days = Array.from({ length: 7 }, (_, i) => addDays(mondayOf(day), i));
  else {
    const first = `${day.slice(0, 8)}01`;
    const start = mondayOf(first);
    days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }
  const from = zurichToDate(days[0], "00:00");
  const to = zurichToDate(addDays(days[days.length - 1], 1), "00:00");
  const [all, blocked, hours] = await Promise.all([
    getBookingsBetween(from, to, { includeCancelled: true }),
    getBlockedBetween(from, to),
    getOpeningHours(),
  ]);
  const bookings = all.filter((b) => showCancelled || b.status === "confirmed");
  const byDay = new Map<string, Booking[]>();
  for (const b of bookings) {
    const k = toDateKey(b.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), b]);
  }
  const hoursOf = (d: string) => hours.find((h) => h.weekday === weekdayOf(d));

  // Zeitachse: Öffnungszeiten der Woche, erweitert um Termine ausserhalb
  let rFrom = 24 * 60;
  let rTo = 0;
  for (const h of hours) if (h.isOpen) { rFrom = Math.min(rFrom, toMin(h.openTime)); rTo = Math.max(rTo, toMin(h.closeTime)); }
  if (rFrom >= rTo) { rFrom = 9 * 60; rTo = 19 * 60; }
  if (view !== "month") {
    for (const d of days) for (const b of byDay.get(d) ?? []) { rFrom = Math.min(rFrom, minutesIn(d, b.startsAt)); rTo = Math.max(rTo, minutesIn(d, b.endsAt)); }
  }
  rFrom = Math.floor(rFrom / 60) * 60;
  rTo = Math.min(24 * 60, Math.ceil(rTo / 60) * 60);
  const nowP = zurichParts(new Date());
  const now = nowP.hour * 60 + nowP.minute;

  const step = view === "day" ? 1 : view === "week" ? 7 : 0;
  const prev = view === "month" ? `${addDays(`${day.slice(0, 8)}01`, -1).slice(0, 8)}01` : addDays(day, -step);
  const next = view === "month" ? addDays(`${day.slice(0, 8)}01`, 32).slice(0, 8) + "01" : addDays(day, step);
  const q = (d: string, v: View = view) => `/admin/kalender?ansicht=${v}&datum=${d}${showCancelled ? "&storniert=1" : ""}`;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed" && days.includes(toDateKey(b.startsAt))).length;

  const title =
    view === "day"
      ? label(day, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "week"
        ? `${label(days[0], locale, { day: "numeric", month: "short" })} – ${label(days[6], locale, { day: "numeric", month: "short", year: "numeric" })}`
        : label(day, locale, { month: "long", year: "numeric" });

  return (
    <>
      <div className="admin-title cal-title">
        <h1 className="h2">{t.calendar.title}</h1>
        <p className="muted">{t.calendar.hint}</p>
      </div>
      <Flash ok={sp.ok} error={sp.error} />

      <section className="panel cal-panel">
        <div className="cal-bar">
          <div className="cal-seg" role="tablist" aria-label={t.calendar.title}>
            {(["day", "week", "month"] as View[]).map((v) => (
              <Link key={v} href={q(day, v)} className={v === view ? "active" : ""} role="tab" aria-selected={v === view}>
                {t.calendar[v]}
              </Link>
            ))}
          </div>
          <div className="cal-nav">
            <Link className="btn btn-light btn-sm" href={q(prev)} aria-label={t.calendar.prev}>‹</Link>
            <Link className="btn btn-light btn-sm" href={q(today)}>{t.calendar.today}</Link>
            <Link className="btn btn-light btn-sm" href={q(next)} aria-label={t.calendar.next}>›</Link>
            <DayPick day={day} label={t.bookings.show} keep={{ ansicht: view, ...(showCancelled ? { storniert: "1" } : {}) }} />
          </div>
        </div>
        <div className="cal-sub">
          <h2 className="h3">{title}</h2>
          <span className="muted small">{confirmedCount === 1 ? t.calendar.countOne : fill(t.calendar.count, { n: confirmedCount })}</span>
          <Link className="small cal-toggle" href={`/admin/kalender?ansicht=${view}&datum=${day}${showCancelled ? "" : "&storniert=1"}`}>
            {showCancelled ? t.calendar.hideCancelled : t.calendar.showCancelled}
          </Link>
        </div>

        {view === "month" ? (
          <div className="cal-month">
            {days.slice(0, 7).map((d) => <div key={d} className="cal-mhead">{label(d, locale, { weekday: "short" })}</div>)}
            {days.map((d) => {
              const list = (byDay.get(d) ?? []).filter((b) => b.status === "confirmed" || showCancelled);
              const other = d.slice(0, 7) !== day.slice(0, 7);
              return (
                <Link key={d} href={q(d, "day")} className={`cal-mcell${other ? " is-other" : ""}${d === today ? " is-today" : ""}${hoursOf(d)?.isOpen ? "" : " is-closed"}`}>
                  <span className="cal-mday">{Number(d.slice(8))}</span>
                  {list.slice(0, 3).map((b) => (
                    <span key={b.id} className={`cal-mitem${b.status === "cancelled" ? " is-cancelled" : ""}`}>
                      {formatTime(b.startsAt, locale)} {b.customerName.split(" ")[0]}
                    </span>
                  ))}
                  {list.length > 3 && <span className="cal-mmore">{fill(t.calendar.more, { n: list.length - 3 })}</span>}
                  {list.length > 0 && <span className="cal-mdot" aria-hidden>{list.length}</span>}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={`cal-scroll${view === "day" ? " is-day" : ""}`}>
            <div className="cal-grid" style={{ gridTemplateColumns: `52px repeat(${days.length}, minmax(var(--cal-col), 1fr))` }}>
              <div className="cal-corner" />
              {days.map((d) => (
                <Link key={d} href={q(d, "day")} className={`cal-head${d === today ? " is-today" : ""}`}>
                  <span>{label(d, locale, { weekday: "short" })}</span>
                  <strong>{Number(d.slice(8))}</strong>
                </Link>
              ))}
              <div className="cal-times" style={{ height: (rTo - rFrom) * PPM }}>
                {Array.from({ length: (rTo - rFrom) / 60 }, (_, i) => (
                  <span key={i} style={{ top: i * 60 * PPM }}>{hhmm(rFrom + i * 60)}</span>
                ))}
              </div>
              {days.map((d) => (
                <DayColumn
                  key={d}
                  day={d}
                  bookings={byDay.get(d) ?? []}
                  blocked={blocked.filter((x) => toDateKey(x.startsAt) <= d && toDateKey(x.endsAt) >= d)}
                  hours={hoursOf(d)}
                  range={[rFrom, rTo]}
                  today={today}
                  now={now}
                  t={t}
                  locale={locale}
                  wide={view === "day"}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
