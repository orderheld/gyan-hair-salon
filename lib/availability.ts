import "server-only";
import { getBlockedBetween, getBookingsBetween, getOpeningHours, getServices, type BookingStaff, type OpeningDay } from "./data";
import { getSettings } from "./settings";
import { addDays, isTimeKey, toDateKey, toTimeKey, weekdayOf, zurichToDate } from "./time";

type Interval = { start: number; end: number };

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/**
 * Freie Startzeiten pro Tag für eine Leistung mit der gegebenen Dauer.
 * Berücksichtigt Öffnungszeiten, Pausen, Sperrzeiten, bestehende Termine inkl. Puffer,
 * Zeitraster, Mindestvorlauf und maximalen Buchungshorizont aus den Einstellungen.
 */
export type Days = Record<string, string[]>;

/**
 * Nachtruhe: Bucht jemand nachts (z. B. 21:00 bis 08:00), ist der früheste Termin
 * nightEnd + nightLeadMin am nächsten Morgen. So sieht der Salon jeden Frühtermin rechtzeitig.
 */
export function nightEarliest(now: Date, s: { nightStart: string; nightEnd: string; nightLeadMin: number }): number {
  if (!s.nightLeadMin || !isTimeKey(s.nightStart) || !isTimeKey(s.nightEnd)) return 0;
  const t = toTimeKey(now);
  const overnight = s.nightStart > s.nightEnd; // z. B. 21:00 bis 08:00
  const inNight = overnight ? t >= s.nightStart || t < s.nightEnd : t >= s.nightStart && t < s.nightEnd;
  if (!inNight) return 0;
  const today = toDateKey(now);
  const wakeDay = overnight && t >= s.nightStart ? addDays(today, 1) : today;
  return zurichToDate(wakeDay, s.nightEnd).getTime() + s.nightLeadMin * 60_000;
}

/**
 * Freie Startzeiten pro Tag für mehrere Dauern auf einmal.
 * Lädt Einstellungen, Öffnungszeiten, Termine und Sperrzeiten in einem einzigen parallelen Schritt
 * und rechnet danach ohne weitere Datenbankanfragen.
 * Ohne durations: alle Dauern der aktiven Leistungen (im selben Schritt geladen).
 */
export async function getAvailabilityFor(
  durations?: number[],
  opts: { from?: string; days?: number; now?: Date; staffId?: BookingStaff } = {},
): Promise<Record<number, Days>> {
  // Online buchbar ist (noch) nur Zana
  const staffId = opts.staffId ?? "zana";
  const now = opts.now ?? new Date();
  const todayKey = toDateKey(now);
  const fromKey = opts.from ?? todayKey;
  // Bis zum grössten erlaubten Horizont laden, gekürzt wird unten mit den echten Einstellungen
  const loadDays = opts.days ?? 366; // nur künftige Termine, also wenige Zeilen
  const rangeStart = zurichToDate(fromKey, "00:00");
  const rangeEnd = zurichToDate(addDays(fromKey, loadDays), "00:00");

  const [list, settings, hours, bookings, blocked] = await Promise.all([
    durations ?? getServices().then((all) => all.map((s) => s.durationMin)),
    getSettings(),
    getOpeningHours(staffId),
    getBookingsBetween(rangeStart, rangeEnd, { staffId }),
    getBlockedBetween(rangeStart, rangeEnd, staffId),
  ]);

  const lastKey = addDays(todayKey, settings.horizonDays);
  const days = Math.min(loadDays, opts.days ?? settings.horizonDays + 1);
  const busy: Interval[] = [
    ...bookings.map((b) => ({ start: b.startsAt.getTime(), end: b.busyUntil.getTime() })),
    ...blocked.map((b) => ({ start: b.startsAt.getTime(), end: b.endsAt.getTime() })),
  ];
  const byWeekday = new Map<number, OpeningDay>(hours.map((h) => [h.weekday, h]));
  const earliest = Math.max(now.getTime() + settings.minNoticeMin * 60_000, nightEarliest(now, settings));
  const step = settings.slotStepMin * 60_000;

  const out: Record<number, Days> = {};
  for (const durationMin of new Set(list)) {
    const duration = durationMin * 60_000;
    const occupied = (durationMin + settings.bufferMin) * 60_000;
    const result: Days = {};
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
    out[durationMin] = result;
  }
  return out;
}

/** Freie Startzeiten pro Tag für eine Leistung mit der gegebenen Dauer. */
export async function getAvailability(durationMin: number, opts: { from?: string; days?: number; now?: Date; staffId?: BookingStaff } = {}): Promise<Days> {
  return (await getAvailabilityFor([durationMin], opts))[durationMin];
}

export async function isSlotAvailable(dateKey: string, time: string, durationMin: number, now = new Date()) {
  const availability = await getAvailability(durationMin, { from: dateKey, days: 1, now });
  return (availability[dateKey] ?? []).includes(time);
}
