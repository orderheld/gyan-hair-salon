import "server-only";
import { getSql } from "./db";
import { mapBooking } from "./data";
import { sendDailyDigest, sendFollowup, sendReminder } from "./email";
import { pushDigestToAdmins } from "./push";
import { runLoyaltyJobs } from "./loyalty-jobs";
import { syncGoogleReviewsThrottled } from "./google-reviews";
import { syncBusinessProfileThrottled } from "./google-business";
import { formatTime, toDateKey, toTimeKey, zurichToDate, addDays } from "./time";
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
  await runDailyDigest(s).catch((e) => console.error("[GYAN] Morgen-Übersicht:", e));
  await runLoyaltyJobs().catch((e) => console.error("[GYAN] Stempelkarte:", e));
  // Google-Bewertungen: nur wenn verbunden, höchstens alle 6 Stunden
  await syncGoogleReviewsThrottled().catch((e) => console.error("[GYAN] Google-Bewertungen:", e));
  // Google-Profil: Öffnungszeiten, Webseite und neue Journal-Beiträge, höchstens alle 6 Stunden
  await syncBusinessProfileThrottled().catch((e) => console.error("[GYAN] Google-Profil:", e));
  return result;
}

/**
 * Morgen-Übersicht: einmal pro Tag ab digestTime (bis 12 Uhr) Push und E-Mail mit allen heutigen Terminen.
 * Der Tag wird vorher atomar in settings.digestSentOn eingetragen, so geht sie nie doppelt raus.
 */
async function runDailyDigest(s: Awaited<ReturnType<typeof getSettings>>) {
  if (!s.digestEnabled) return;
  const now = new Date();
  const today = toDateKey(now);
  const t = toTimeKey(now);
  if (t < s.digestTime || t >= "12:00") return;
  const sql = await getSql();
  const claimed = await sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('digestSentOn', ${JSON.stringify(today)}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      WHERE settings.value IS DISTINCT FROM EXCLUDED.value
    RETURNING key`;
  if (!claimed.length) return;
  const rows = await sql`
    SELECT * FROM bookings WHERE status = 'confirmed'
      AND starts_at >= ${zurichToDate(today, "00:00").toISOString()}::timestamptz
      AND starts_at < ${zurichToDate(addDays(today, 1), "00:00").toISOString()}::timestamptz
    ORDER BY starts_at`;
  const list = rows.map(mapBooking);
  const title = list.length ? `Heute ${list.length} ${list.length === 1 ? "Termin" : "Termine"}` : "Heute keine Termine";
  const body = list.length
    ? list.slice(0, 4).map((b) => `${formatTime(b.startsAt, "de")} ${b.customerName.split(" ")[0]}`).join(" · ") + (list.length > 4 ? ` · +${list.length - 4}` : "")
    : "Für heute ist noch nichts gebucht.";
  await Promise.allSettled([pushDigestToAdmins(`☀ ${title}`, body), sendDailyDigest(list, s.notifyEmail)]);
}

/** Läuft zusätzlich nach Seitenaufrufen, höchstens alle 10 Minuten pro Server-Instanz. */
export async function runEmailJobsThrottled() {
  if (Date.now() - lastRun < 10 * 60_000) return;
  await runEmailJobs().catch((e) => console.error("[GYAN] E-Mail-Jobs:", e));
}
