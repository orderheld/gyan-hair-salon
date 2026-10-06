import type { OpeningDay } from "./data";

export type HoursRow = { days: string; time: string | null; weekdays: number[] };

const MON_FIRST = [1, 2, 3, 4, 5, 6, 0];
const t = (d: OpeningDay) =>
  d.isOpen ? (d.breakStart && d.breakEnd ? `${d.openTime}–${d.breakStart}, ${d.breakEnd}–${d.closeTime}` : `${d.openTime}–${d.closeTime}`) : null;

/** Öffnungszeiten zusammengefasst, z. B. "Mo–Mi 09:00–19:00" */
export function groupHours(hours: OpeningDay[], weekdaysShort: string[]): HoursRow[] {
  const by = new Map(hours.map((h) => [h.weekday, h]));
  const rows: HoursRow[] = [];
  for (const wd of MON_FIRST) {
    const day = by.get(wd);
    const time = day ? t(day) : null;
    const last = rows[rows.length - 1];
    if (last && last.time === time) last.weekdays.push(wd);
    else rows.push({ days: "", time, weekdays: [wd] });
  }
  for (const r of rows) {
    const first = weekdaysShort[r.weekdays[0]];
    const end = weekdaysShort[r.weekdays[r.weekdays.length - 1]];
    r.days = r.weekdays.length === 1 ? first : r.weekdays.length === 2 ? `${first}, ${end}` : `${first}–${end}`;
  }
  return rows;
}

/** Für schema.org */
export const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
