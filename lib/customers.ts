import "server-only";
import { mapBooking } from "./data";
import { getSql } from "./db";

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
    bool_or(marketing_consent) AS consent
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
export async function listCustomers(search = ""): Promise<CustomerInfo[]> {
  const q = `%${search.trim().toLowerCase()}%`;
  const rows = await query(
    `SELECT a.*, c.note, c.blocked, c.no_marketing FROM (${AGG_SQL}) a LEFT JOIN customers c ON c.key = a.key
     WHERE $1 = '%%' OR lower(a.name) LIKE $1 OR a.key LIKE $1 OR regexp_replace(coalesce(a.phone, ''), '\\D', '', 'g') LIKE regexp_replace($1, '[^0-9%]', '', 'g')
     ORDER BY greatest(a.first_at, coalesce(a.last_visit_at, a.first_at)) DESC
     LIMIT 500`,
    [q],
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
