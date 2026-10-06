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
                            customer_name, customer_email, customer_phone, note, locale, source, cancel_token)
      SELECT ${input.service.id}, ${input.service.name.de}, ${input.service.priceChf}, ${input.service.durationMin},
             ${start}::timestamptz, ${end}::timestamptz, ${busyUntil.toISOString()}::timestamptz,
             ${input.customerName}, ${input.customerEmail}, ${input.customerPhone}, ${input.note}, ${input.locale},
             ${input.source}, ${token}
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

export async function cancelBooking(id: string): Promise<Booking | null> {
  const sql = await getSql();
  const rows = await sql`
    UPDATE bookings SET status = 'cancelled', cancelled_at = now()
    WHERE id = ${id}::uuid AND status = 'confirmed'
    RETURNING *`;
  return rows[0] ? mapBooking(rows[0]) : null;
}
