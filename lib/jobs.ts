import "server-only";
import { getSql } from "./db";
import { mapBooking } from "./data";
import { sendFollowup, sendReminder } from "./email";
import { getSettings } from "./settings";

let lastRun = 0;

/**
 * Verschickt fällige Erinnerungen und Feedback-E-Mails.
 * Jeder Termin wird vorher atomar "reserviert" (UPDATE … RETURNING), so geht keine E-Mail doppelt raus,
 * auch wenn der Cron und ein Seitenaufruf gleichzeitig laufen.
 */
export async function runEmailJobs() {
  lastRun = Date.now();
  const sql = await getSql();
  const s = await getSettings();
  const result = { reminders: 0, followups: 0 };

  if (s.emailEnabled.reminder) {
    const rows = await sql`
      UPDATE bookings SET reminder_sent_at = now()
      WHERE status = 'confirmed' AND reminder_sent_at IS NULL AND customer_email <> ''
        AND starts_at > now()
        AND starts_at <= now() + make_interval(hours => ${s.reminderHoursBefore}::int)
        AND created_at < starts_at - make_interval(hours => ${s.reminderHoursBefore}::int)
      RETURNING *`;
    for (const r of rows) {
      await sendReminder(mapBooking(r)).catch((e) => console.error("[GYAN] Erinnerung fehlgeschlagen:", e));
      result.reminders++;
    }
  }

  if (s.emailEnabled.followup) {
    const rows = await sql`
      UPDATE bookings SET followup_sent_at = now()
      WHERE status = 'confirmed' AND NOT no_show AND followup_sent_at IS NULL AND customer_email <> ''
        AND ends_at + make_interval(hours => ${s.followupHoursAfter}::int) <= now()
        AND ends_at > now() - interval '3 days'
      RETURNING *`;
    for (const r of rows) {
      await sendFollowup(mapBooking(r)).catch((e) => console.error("[GYAN] Feedback-Mail fehlgeschlagen:", e));
      result.followups++;
    }
  }
  return result;
}

/** Läuft zusätzlich nach Seitenaufrufen, höchstens alle 10 Minuten pro Server-Instanz. */
export async function runEmailJobsThrottled() {
  if (Date.now() - lastRun < 10 * 60_000) return;
  await runEmailJobs().catch((e) => console.error("[GYAN] E-Mail-Jobs:", e));
}
