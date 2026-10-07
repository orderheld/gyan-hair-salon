import { TIMEZONE } from "./config";

type Parts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  weekday: "short",
  hourCycle: "h23",
});

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Datum/Uhrzeit eines Zeitpunkts in Zürcher Lokalzeit. */
export function zurichParts(date: Date): Parts {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: WEEKDAYS[p.weekday],
  };
}

function offsetMs(date: Date): number {
  const p = zurichParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, date.getUTCSeconds());
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** "2026-10-05" + "09:30" (Zürich) -> Date (UTC). Berücksichtigt Sommer-/Winterzeit. */
export function zurichToDate(dateStr: string, time: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let result = guess - offsetMs(new Date(guess));
  result = guess - offsetMs(new Date(result));
  return new Date(result);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" in Zürcher Lokalzeit */
export function toDateKey(date: Date): string {
  const p = zurichParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Date -> "HH:MM" in Zürcher Lokalzeit */
export function toTimeKey(date: Date): string {
  const p = zurichParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 12));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTimeKey(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

/** "09:00:00" -> "09:00" */
export function hm(time: string | null | undefined): string {
  return (time ?? "").slice(0, 5);
}

export function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}

const INTL: Record<string, string> = { de: "de-CH", fr: "fr-CH", en: "en-GB" };
const f = (locale: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL[locale] ?? "de-CH", { timeZone: TIMEZONE, ...o });

export const formatLongDate = (date: Date, locale = "de") =>
  f(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);

export const formatTime = (date: Date, locale = "de") => f(locale, { hour: "2-digit", minute: "2-digit" }).format(date);

export const formatShortDate = (date: Date, locale = "de") => f(locale, { weekday: "short", day: "numeric", month: "numeric" }).format(date);

/** Geburtsdatum JJJJ-MM-TT: gültiges Datum, ab 1900, nicht in der Zukunft */
export function isBirthDate(value: string): boolean {
  if (!isDateKey(value) || value < "1900-01-01") return false;
  const d = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return false; // z. B. 31.02.
  return value <= toDateKey(new Date());
}
