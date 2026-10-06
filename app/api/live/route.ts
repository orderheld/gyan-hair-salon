import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOpeningHours, getServices } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { runEmailJobsThrottled } from "@/lib/jobs";
import { nextFreeSlot, openState } from "@/lib/live";
import { formatShortDate, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * Live-Angaben für die Startseite: «Jetzt offen» und der nächste freie Termin.
 * Die Seiten selbst sind zwischengespeichert (schnell), diese Angaben kommen frisch nach.
 */
export async function GET(request: Request) {
  const l = new URL(request.url).searchParams.get("l") ?? "de";
  const locale = isLocale(l) ? l : "de";
  const d = getDict(locale);
  const live = d.home.live;
  const [services, hours] = await Promise.all([getServices(), getOpeningHours()]);
  const now = new Date();
  const open = openState(hours, now);
  const status =
    open.kind === "open" ? live.open.replace("{t}", open.until)
    : open.kind === "later" ? live.later.replace("{t}", open.from)
    : open.kind === "closed" ? live.closed.replace("{d}", d.common.weekdays[open.weekday]).replace("{t}", open.from)
    : null;
  const shortest = Math.min(...services.map((s) => s.durationMin).filter((n) => n > 0), 30);
  const slot = await nextFreeSlot(shortest, now);
  const slotText = !slot
    ? live.none
    : `${slot.dayOffset === 0 ? live.today : slot.dayOffset === 1 ? live.tomorrow : formatShortDate(slot.date, locale)}, ${formatTime(slot.date, locale)}`;
  // Ersatz, falls cron-job.org einmal ausfällt: Erinnerungs- und Feedback-Mails nachholen
  after(runEmailJobsThrottled);
  return NextResponse.json({ status, isOpen: open.kind === "open", slot: slotText }, { headers: { "Cache-Control": "no-store" } });
}
