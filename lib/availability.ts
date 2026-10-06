import "server-only";
import { getBlockedBetween, getBookingsBetween, getOpeningHours, type OpeningDay } from "./data";
import { getSettings } from "./settings";
import { addDays, toDateKey, toTimeKey, weekdayOf, zurichToDate } from "./time";

type Interval = { start: number; end: number };

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/**
 * Freie Startzeiten pro Tag für eine Leistung mit der gegebenen Dauer.
 * Berücksichtigt Öffnungszeiten, Pausen, Sperrzeiten, bestehende Termine inkl. Puffer,
 * Zeitraster, Mindestvorlauf und maximalen Buchungshorizont aus den Einstellungen.
 */
export async function getAvailability(
  durationMin: number,
  opts: { from?: string; days?: number; now?: Date } = {},
): Promise<Record<string, string[]>> {
  const settings = await getSettings();
  const now = opts.now ?? new Date();
  const todayKey = toDateKey(now);
  const fromKey = opts.from ?? todayKey;
  const lastKey = addDays(todayKey, settings.horizonDays);
  const days = opts.days ?? settings.horizonDays + 1;

  const rangeStart = zurichToDate(fromKey, "00:00");
  const rangeEnd = zurichToDate(addDays(fromKey, days), "00:00");

  const [hours, bookings, blocked] = await Promise.all([
    getOpeningHours(),
    getBookingsBetween(rangeStart, rangeEnd),
    getBlockedBetween(rangeStart, rangeEnd),
  ]);

  const busy: Interval[] = [
    ...bookings.map((b) => ({ start: b.startsAt.getTime(), end: b.busyUntil.getTime() })),
    ...blocked.map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() })),
  ];

  const byWeekday = new Map<number, OpeningDay>(hours.map((h) => [h.weekday, h]));
  const earliest = now.getTime() + settings.minNoticeMin * 60_000;
  const duration = durationMin * 60_000;
  const occupied = (durationMin + settings.bufferMin) * 60_000;
  const step = settings.slotStepMin * 60_000;
  const result: Record<string, string[]> = {};

  for (let i = 0; i < days; i++) {
    const key = addDays(fromKey, i);
    if (key > lastKey || key < todayKey) continue;
    const day = byWeekday.get(weekdayOf(key));
    if (!day?.isOpen) continue;

    const open = zurichToDate(key, day.openTime).getTime();
    const close = zurichToDate(key, day.closeTime).getTime();
    const pause =
      day.breakStart && day.breakEnd
        ? { start: zurichToDate(key, day.breakStart).getTime(), end: zurichToDate(key, day.breakEnd).getTime() }
        : null;

    const slots: string[] = [];
    for (let t = open; t + duration <= close; t += step) {
      if (t < earliest) continue;
      // Der Termin selbst muss in die Öffnungszeit passen, der Puffer darf über das Ende hinausgehen.
      const slot = { start: t, end: t + occupied };
      if (pause && overlaps({ start: t, end: t + duration }, pause)) continue;
      if (busy.some((b) => overlaps(slot, b))) continue;
      slots.push(toTimeKey(new Date(t)));
    }
    if (slots.length) result[key] = slots;
  }
  return result;
}

export async function isSlotAvailable(dateKey: string, time: string, durationMin: number, now = new Date()) {
  const availability = await getAvailability(durationMin, { from: dateKey, days: 1, now });
  return (availability[dateKey] ?? []).includes(time);
}
