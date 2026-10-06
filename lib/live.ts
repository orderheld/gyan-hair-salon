import "server-only";
import { getAvailability } from "./availability";
import type { OpeningDay } from "./data";
import { addDays, toDateKey, toTimeKey, weekdayOf, zurichToDate } from "./time";

export type OpenState =
  | { kind: "open"; until: string }
  | { kind: "later"; from: string }
  | { kind: "closed"; weekday: number; from: string }
  | { kind: "none" };

/** Ist der Salon gerade offen? Sonst: wann öffnet er wieder? (Zürcher Zeit) */
export function openState(hours: OpeningDay[], now = new Date()): OpenState {
  const by = new Map(hours.map((h) => [h.weekday, h]));
  const today = toDateKey(now);
  const t = toTimeKey(now);
  const day = by.get(weekdayOf(today));
  if (day?.isOpen) {
    const inBreak = day.breakStart && day.breakEnd && t >= day.breakStart && t < day.breakEnd;
    if (t < day.openTime) return { kind: "later", from: day.openTime };
    if (inBreak) return { kind: "later", from: day.breakEnd! };
    if (t < day.closeTime) return { kind: "open", until: day.breakStart && t < day.breakStart ? day.breakStart : day.closeTime };
  }
  for (let i = 1; i <= 7; i++) {
    const key = addDays(today, i);
    const d = by.get(weekdayOf(key));
    if (d?.isOpen) return { kind: "closed", weekday: weekdayOf(key), from: d.openTime };
  }
  return { kind: "none" };
}

/** Nächster freie Online-Termin bei Zana für die kürzeste Leistung. */
export async function nextFreeSlot(durationMin: number, now = new Date()): Promise<{ date: Date; dayOffset: number } | null> {
  try {
    const days = await getAvailability(durationMin, { days: 21, now });
    const key = Object.keys(days).sort()[0];
    if (!key) return null;
    const date = zurichToDate(key, days[key][0]);
    const dayOffset = Math.round((zurichToDate(key, "12:00").getTime() - zurichToDate(toDateKey(now), "12:00").getTime()) / 86_400_000);
    return { date, dayOffset };
  } catch {
    return null;
  }
}
