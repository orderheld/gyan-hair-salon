import { addDays, isDateKey, toDateKey, weekdayOf, zurichToDate } from "./time";

export const PERIODS = ["today", "week", "month", "year"] as const;
export type Period = (typeof PERIODS)[number];

/** Zeitraum der Auswertung als Datumsschlüssel (bis = inklusive) */
export function periodRange(p: { zeit?: string; von?: string; bis?: string }) {
  const today = toDateKey(new Date());
  if (p.von && p.bis && isDateKey(p.von) && isDateKey(p.bis) && p.von <= p.bis) return { from: p.von, to: p.bis, period: null };
  const period: Period = (PERIODS as readonly string[]).includes(p.zeit ?? "") ? (p.zeit as Period) : "today";
  const from =
    period === "today" ? today
    : period === "week" ? addDays(today, -((weekdayOf(today) + 6) % 7))
    : period === "month" ? today.slice(0, 8) + "01"
    : today.slice(0, 5) + "01-01";
  return { from, to: today, period };
}

export const rangeDates = (from: string, to: string) => ({ start: zurichToDate(from, "00:00"), end: zurichToDate(addDays(to, 1), "00:00") });

/** Heute, diese Woche (Mo–So) und dieser Monat als Zeitspannen [Beginn, Ende) */
export function currentPeriods(now = new Date()) {
  const today = toDateKey(now);
  const monday = addDays(today, -((weekdayOf(today) + 6) % 7));
  const first = today.slice(0, 8) + "01";
  const [y, m] = first.split("-").map(Number);
  const nextFirst = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const span = (a: string, b: string): [Date, Date] => [zurichToDate(a, "00:00"), zurichToDate(b, "00:00")];
  return { today: span(today, addDays(today, 1)), week: span(monday, addDays(monday, 7)), month: span(first, nextFirst) };
}
