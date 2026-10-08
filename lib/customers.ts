import "server-only";
import { mapBooking } from "./data";
import { getSql } from "./db";
import { isBirthDate } from "./time";

/**
 * Kunden werden über ihre E-Mail erkannt, ohne E-Mail über die Telefonnummer.
 * Daraus entstehen Hinweise wie «Stammkunde», «Neukunde» oder «2× nicht gekommen».
 */
export const REGULAR_FROM = 3; // ab so vielen Besuchen gilt jemand als Stammkunde

export function customerKey(email: string, phone: string) {
  const e = email.trim().toLowerCase();
  if (e) return e;
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

export type CustomerInfo = {
  key: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  noShows: number;
  lateCancels: number;
  openFees: number;
  openCount: number;
  upcoming: number;
  cancelled: number;
  firstAt: Date | null;
  lastVisitAt: Date | null;
  consent: boolean;
  /** JJJJ-MM-TT oder leer */
  birthDate: string;
  note: string;
  blocked: boolean;
  noMarketing: boolean;
};

// Gleiche Formel wie customerKey(), nur in SQL
const KEY_SQL = `CASE WHEN customer_email <> '' THEN lower(customer_email) ELSE 'tel:' || regexp_replace(customer_phone, '\\D', '', 'g') END`;

const AGG_SQL = `
  SELECT ${KEY_SQL} AS key,
    (array_agg(customer_name ORDER BY starts_at DESC))[1] AS name,
    (array_agg(customer_email ORDER BY starts_at DESC))[1] AS email,
    (array_agg(customer_phone ORDER BY starts_at DESC) FILTER (WHERE customer_phone <> ''))[1] AS phone,
    count(*) FILTER (WHERE status = 'confirmed' AND NOT no_show AND starts_at < now()) AS visits,
    count(*) FILTER (WHERE no_show) AS no_shows,
    count(*) FILTER (WHERE status = 'confirmed' AND starts_at >= now()) AS upcoming,
    count(*) FILTER (WHERE status = 'cancelled') AS cancelled,
    min(starts_at) AS first_at,
    max(starts_at) FILTER (WHERE status = 'confirmed' AND NOT no_show AND starts_at < now()) AS last_visit_at,
    count(*) FILTER (WHERE late_cancel) AS late_cancels,
    coalesce(sum(coalesce(price_chf, 0)) FILTER (WHERE fee_open), 0) AS open_fees,
    count(*) FILTER (WHERE fee_open) AS open_count,
    bool_or(marketing_consent) AS consent,
    (array_agg(birth_date ORDER BY starts_at DESC) FILTER (WHERE birth_date <> ''))[1] AS birth_date
  FROM bookings
  WHERE customer_email <> '' OR customer_phone <> ''
  GROUP BY 1`;

type Row = Record<string, unknown>;
const toDate = (v: unknown) => (v == null ? null : v instanceof Date ? v : new Date(String(v)));
const map = (r: Row): CustomerInfo => ({
  key: String(r.key),
  name: String(r.name ?? ""),
  email: String(r.email ?? ""),
  phone: String(r.phone ?? ""),
  visits: Number(r.visits ?? 0),
  noShows: Number(r.no_shows ?? 0),
  lateCancels: Number(r.late_cancels ?? 0),
  openFees: Number(r.open_fees ?? 0),
  openCount: Number(r.open_count ?? 0),
  upcoming: Number(r.upcoming ?? 0),
  cancelled: Number(r.cancelled ?? 0),
  firstAt: toDate(r.first_at),
  lastVisitAt: toDate(r.last_visit_at),
  consent: !!r.consent,
  birthDate: String(r.birth_date ?? ""),
  note: String(r.note ?? ""),
  blocked: !!r.blocked,
  noMarketing: !!r.no_marketing,
});

async function query(text: string, params: unknown[] = []) {
  return (await getSql()).query(text, params);
}

/** Hinweise für mehrere Kunden auf einmal (für die Terminliste) */
export async function getCustomerInfos(keys: string[]): Promise<Map<string, CustomerInfo>> {
  const unique = [...new Set(keys.filter(Boolean))];
  if (!unique.length) return new Map();
  const rows = await query(
    `SELECT a.*, c.note, c.blocked, c.no_marketing FROM (${AGG_SQL}) a LEFT JOIN customers c ON c.key = a.key WHERE a.key = ANY($1::text[])`,
    [unique],
  );
  return new Map(rows.map((r) => [String(r.key), map(r)]));
}

/** Alle Kunden für die Kundenliste, zuletzt aktive zuerst */
export async function listCustomers(search = "", { limit = 500 }: { limit?: number | null } = {}): Promise<CustomerInfo[]> {
  const q = `%${search.trim().toLowerCase()}%`;
  // Telefonsuche nur mit Ziffern: sonst würde «anna» zu «%%» und alle Kunden passen
  const digits = search.replace(/\D/g, "");
  const rows = await query(
    `SELECT a.*, c.note, c.blocked, c.no_marketing FROM (${AGG_SQL}) a LEFT JOIN customers c ON c.key = a.key
     WHERE $1 = '%%' OR lower(a.name) LIKE $1 OR a.key LIKE $1 OR ($2 <> '' AND regexp_replace(coalesce(a.phone, ''), '\\D', '', 'g') LIKE '%' || $2 || '%')
     ORDER BY greatest(a.first_at, coalesce(a.last_visit_at, a.first_at)) DESC
     ${limit ? `LIMIT ${Math.trunc(limit)}` : ""}`,
    [q, digits],
  );
  return rows.map(map);
}

export async function updateCustomer(key: string, patch: { note?: string; blocked?: boolean; noMarketing?: boolean }) {
  if (!key) return;
  const sql = await getSql();
  await sql`INSERT INTO customers (key) VALUES (${key}) ON CONFLICT (key) DO NOTHING`;
  if (patch.note !== undefined) await sql`UPDATE customers SET note = ${patch.note}, updated_at = now() WHERE key = ${key}`;
  if (patch.blocked !== undefined) await sql`UPDATE customers SET blocked = ${patch.blocked}, updated_at = now() WHERE key = ${key}`;
  if (patch.noMarketing !== undefined) await sql`UPDATE customers SET no_marketing = ${patch.noMarketing}, updated_at = now() WHERE key = ${key}`;
}

/** Gesperrte Kunden können nicht online buchen (E-Mail oder Telefonnummer) */
export async function isBlocked(email: string, phone = ""): Promise<boolean> {
  const keys = [customerKey(email, ""), customerKey("", phone)].filter(Boolean);
  if (!keys.length) return false;
  const sql = await getSql();
  const rows = await sql`SELECT 1 FROM customers WHERE blocked AND key = ANY(${keys}::text[]) LIMIT 1`;
  return rows.length > 0;
}

/** Hat dieser Kunde etwas, worauf das Admin achten sollte? */
export const needsAttention = (c?: CustomerInfo) => !!c && (c.noShows > 0 || c.lateCancels > 0 || c.openCount > 0 || c.blocked || !!c.note);

/** Termine mit offenen Kosten (zu spät storniert oder nicht gekommen), neueste zuerst */
export async function getOpenFeeBookings() {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM bookings WHERE fee_open ORDER BY starts_at DESC LIMIT 200`;
  return rows.map(mapBooking);
}

/** Ein Kunde mit allen Kennzahlen, oder null */
export async function getCustomer(key: string): Promise<CustomerInfo | null> {
  if (!key) return null;
  return (await getCustomerInfos([key])).get(key) ?? null;
}

/** Alle Termine eines Kunden, neueste zuerst */
export async function getCustomerBookings(key: string) {
  const rows = await query(`SELECT * FROM bookings WHERE ${KEY_SQL} = $1 ORDER BY starts_at DESC LIMIT 300`, [key]);
  return rows.map(mapBooking);
}

/**
 * Name, E-Mail und Telefon bei allen Terminen dieses Kunden ändern.
 * Ändert sich dadurch der Schlüssel (E-Mail/Telefon), ziehen Notiz und Sperre mit.
 * Gibt den neuen Schlüssel zurück.
 */
export async function updateCustomerContact(key: string, contact: { name: string; email: string; phone: string; birthDate?: string }): Promise<string> {
  const newKey = customerKey(contact.email, contact.phone);
  if (!key || !newKey) return key;
  await query(`UPDATE bookings SET customer_name = $2, customer_email = $3, customer_phone = $4 WHERE ${KEY_SQL} = $1`, [
    key,
    contact.name,
    contact.email.trim().toLowerCase(),
    contact.phone,
  ]);
  if (contact.birthDate) await query(`UPDATE bookings SET birth_date = $2 WHERE ${KEY_SQL} = $1`, [newKey, contact.birthDate]);
  if (newKey !== key) {
    const sql = await getSql();
    const taken = await sql`SELECT 1 FROM customers WHERE key = ${newKey}`;
    if (taken.length) await sql`DELETE FROM customers WHERE key = ${key}`;
    else await sql`UPDATE customers SET key = ${newKey}, updated_at = now() WHERE key = ${key}`;
    // Stempelkarte zieht mit, ausser unter der neuen E-Mail gibt es schon eine
    await sql`UPDATE loyalty_cards SET customer_key = ${newKey} WHERE customer_key = ${key} AND NOT EXISTS (SELECT 1 FROM loyalty_cards WHERE customer_key = ${newKey})`.catch(() => []);
  }
  return newKey;
}

/** Geburtsdatum bei allen Terminen ohne Geburtsdatum nachtragen */
export async function fillBirthDate(key: string, birthDate: string) {
  if (!key || !birthDate) return;
  await query(`UPDATE bookings SET birth_date = $2 WHERE ${KEY_SQL} = $1 AND birth_date = ''`, [key, birthDate]);
}

/** Kunde vollständig löschen: alle Termine, Notizen und Codes (Datenschutz) */
export async function deleteCustomer(key: string): Promise<number> {
  if (!key) return 0;
  const sql = await getSql();
  const rows = await query(`DELETE FROM bookings WHERE ${KEY_SQL} = $1 RETURNING id`, [key]);
  await sql`DELETE FROM customers WHERE key = ${key}`;
  if (!key.startsWith("tel:")) await sql`DELETE FROM email_codes WHERE email = ${key}`.catch(() => []);
  await sql`DELETE FROM loyalty_cards WHERE customer_key = ${key}`.catch(() => []); // Stempelkarte mit allen Stempeln
  return rows.length;
}

export type AccountProfile = { name: string; phone: string; birthDate: string };

/** Angaben eines Kundenkontos: was beim Konto steht, sonst vom letzten Termin */
export async function getAccountProfile(email: string): Promise<AccountProfile> {
  const key = email.trim().toLowerCase();
  if (!key) return { name: "", phone: "", birthDate: "" };
  const sql = await getSql();
  const [[own], fromBookings] = await Promise.all([
    sql`SELECT name, phone, birth_date FROM customers WHERE key = ${key}`.catch(() => []),
    getCustomer(key),
  ]);
  const pick = (a: unknown, b: string | undefined) => (typeof a === "string" && a ? a : b ?? "");
  return {
    name: pick(own?.name, fromBookings?.name),
    phone: pick(own?.phone, fromBookings?.phone),
    birthDate: pick(own?.birth_date, fromBookings?.birthDate),
  };
}

/** Sind Name, Telefon und Geburtsdatum vollständig? */
export const profileComplete = (p: AccountProfile) => p.name.trim().length >= 2 && p.phone.replace(/\D/g, "").length >= 9 && isBirthDate(p.birthDate);

/** Angaben fürs ganze Konto speichern: beim Konto und bei allen Terminen dieser E-Mail */
export async function saveAccountProfile(email: string, p: AccountProfile) {
  const key = email.trim().toLowerCase();
  if (!key) return;
  const sql = await getSql();
  await sql`INSERT INTO customers (key, name, phone, birth_date) VALUES (${key}, ${p.name}, ${p.phone}, ${p.birthDate})
            ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, birth_date = EXCLUDED.birth_date, updated_at = now()`;
  if (await getCustomer(key)) await updateCustomerContact(key, { name: p.name, email: key, phone: p.phone, birthDate: p.birthDate });
}
