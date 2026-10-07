import "server-only";
import { randomBytes } from "node:crypto";
import type { Locale } from "@/content/types";
import { getSql, isOverlapError } from "./db";
import { mapBooking, type Booking, type Service } from "./data";
import { getSettings } from "./settings";

export class SlotTakenError extends Error {
  constructor() {
    super("Dieser Termin ist leider nicht mehr frei.");
  }
}

export type NewBooking = {
  service: Pick<Service, "id" | "name" | "priceChf" | "durationMin">;
  startsAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string;
  locale: Locale;
  source: "online" | "admin";
  marketingConsent?: boolean;
  emailVerified?: boolean;
};

/**
 * Legt einen bestätigten Termin an.
 * Die Datenbank verhindert Überschneidungen inkl. Puffer (Exclusion-Constraint),
 * die Abfrage verhindert Buchungen in Sperrzeiten, auch bei gleichzeitigen Anfragen.
 */
export async function createBooking(input: NewBooking): Promise<Booking> {
  const sql = await getSql();
  const { bufferMin } = await getSettings();
  const endsAt = new Date(input.startsAt.getTime() + input.service.durationMin * 60_000);
  const busyUntil = new Date(endsAt.getTime() + bufferMin * 60_000);
  const token = randomBytes(24).toString("base64url");
  const start = input.startsAt.toISOString();
  const end = endsAt.toISOString();
  try {
    const rows = await sql`
      INSERT INTO bookings (service_id, service_name, price_chf, duration_min, starts_at, ends_at, busy_until,
                            customer_name, customer_email, customer_phone, note, locale, source, cancel_token,
                            marketing_consent, email_verified)
      SELECT ${input.service.id}, ${input.service.name.de}, ${input.service.priceChf}, ${input.service.durationMin},
             ${start}::timestamptz, ${end}::timestamptz, ${busyUntil.toISOString()}::timestamptz,
             ${input.customerName}, ${input.customerEmail}, ${input.customerPhone}, ${input.note}, ${input.locale},
             ${input.source}, ${token}, ${!!input.marketingConsent}, ${!!input.emailVerified}
      WHERE NOT EXISTS (
        SELECT 1 FROM blocked_times
        WHERE starts_at < ${end}::timestamptz AND ends_at > ${start}::timestamptz
      )
      RETURNING *`;
    if (!rows[0]) throw new SlotTakenError();
    return mapBooking(rows[0]);
  } catch (error) {
    if (isOverlapError(error)) throw new SlotTakenError();
    throw error;
  }
}

/** Storniert einen Termin. late = kurzfristig durch den Kunden: Kosten bleiben offen fürs nächste Mal. */
export async function cancelBooking(id: string, opts: { late?: boolean } = {}): Promise<Booking | null> {
  const sql = await getSql();
  const late = !!opts.late;
  const rows = await sql`
    UPDATE bookings SET status = 'cancelled', cancelled_at = now(), late_cancel = ${late}, fee_open = ${late}
    WHERE id = ${id}::uuid AND status = 'confirmed'
    RETURNING *`;
  return rows[0] ? mapBooking(rows[0]) : null;
}

export type BookingChange = {
  service: Pick<Service, "id" | "name" | "durationMin">;
  priceChf: number | null;
  startsAt: Date;
};

/**
 * Verschiebt einen Termin oder ändert die Leistung.
 * Gleiche Schutzregeln wie beim Anlegen: keine Überschneidung, keine Sperrzeit.
 * Bei neuer Uhrzeit wird die Erinnerung zurückgesetzt, damit sie zur neuen Zeit kommt.
 */
export async function rescheduleBooking(id: string, change: BookingChange): Promise<Booking | null> {
  const sql = await getSql();
  const { bufferMin } = await getSettings();
  const endsAt = new Date(change.startsAt.getTime() + change.service.durationMin * 60_000);
  const busyUntil = new Date(endsAt.getTime() + bufferMin * 60_000);
  const start = change.startsAt.toISOString();
  const end = endsAt.toISOString();
  try {
    const rows = await sql`
      UPDATE bookings SET
        service_id = ${change.service.id}, service_name = ${change.service.name.de}, price_chf = ${change.priceChf},
        duration_min = ${change.service.durationMin}, starts_at = ${start}::timestamptz, ends_at = ${end}::timestamptz,
        busy_until = ${busyUntil.toISOString()}::timestamptz,
        reminder_sent_at = CASE WHEN starts_at = ${start}::timestamptz THEN reminder_sent_at ELSE NULL END,
        followup_sent_at = CASE WHEN starts_at = ${start}::timestamptz THEN followup_sent_at ELSE NULL END
      WHERE id = ${id}::uuid
        AND NOT EXISTS (
          SELECT 1 FROM blocked_times
          WHERE starts_at < ${end}::timestamptz AND ends_at > ${start}::timestamptz
        )
      RETURNING *`;
    if (!rows[0]) {
      const exists = await sql`SELECT 1 FROM bookings WHERE id = ${id}::uuid`;
      if (exists.length) throw new SlotTakenError();
      return null;
    }
    return mapBooking(rows[0]);
  } catch (error) {
    if (isOverlapError(error)) throw new SlotTakenError();
    throw error;
  }
}

/** Löscht einen Termin endgültig (zum Beispiel ein Test oder ein Versehen) */
export async function deleteBooking(id: string): Promise<Booking | null> {
  const sql = await getSql();
  const rows = await sql`DELETE FROM bookings WHERE id = ${id}::uuid RETURNING *`;
  return rows[0] ? mapBooking(rows[0]) : null;
}
