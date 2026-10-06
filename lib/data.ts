import "server-only";
import { site } from "@/content/site";
import { getSql, type Row } from "./db";
import { iconFor } from "./service-icon";
import type { L, Locale } from "@/content/types";
import { hm, toDate } from "./time";

export type Service = {
  id: number;
  slug: L;
  name: L;
  short: L;
  long: L;
  image: string;
  /** Symbol für Listen, siehe lib/service-icon.ts */
  icon: string;
  durationMin: number;
  priceChf: number;
  priceFrom: boolean;
  /** Preis ohne Termin (Walk-in), leer = nur mit Termin */
  walkinPriceChf: number | null;
  /** Gruppe in der Preisliste */
  category: ServiceCategory;
  /** «Beliebt»-Hinweis */
  popular: boolean;
  active: boolean;
  sort: number;
};

export const SERVICE_CATEGORIES = ["cut", "beard", "face", "package"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
const toCategory = (v: unknown): ServiceCategory => (SERVICE_CATEGORIES as readonly string[]).includes(String(v)) ? (v as ServiceCategory) : "cut";

/** Leistung in einer Sprache (fällt auf Deutsch zurück, wenn ein Text fehlt). */
export type LocalService = Omit<Service, "slug" | "name" | "short" | "long"> & { slug: string; name: string; short: string; long: string };

export function localize(s: Service, locale: Locale): LocalService {
  const pick = (v: L) => v[locale] || v.de;
  return { ...s, slug: pick(s.slug), name: pick(s.name), short: pick(s.short), long: pick(s.long) };
}

export type OpeningDay = {
  weekday: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart: string | null;
  breakEnd: string | null;
};

export type Blocked = { id: number; startsAt: Date; endsAt: Date; reason: string };

export type Booking = {
  id: string;
  serviceId: number | null;
  serviceName: string;
  priceChf: number | null;
  durationMin: number;
  startsAt: Date;
  endsAt: Date;
  busyUntil: Date;
  locale: Locale;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string;
  status: "confirmed" | "cancelled";
  source: "online" | "admin";
  cancelToken: string;
  createdAt: Date;
  reminderSentAt: Date | null;
  followupSentAt: Date | null;
  noShow: boolean;
  marketingConsent: boolean;
  emailVerified: boolean;
  lateCancel: boolean;
  feeOpen: boolean;
};

const tri = (r: Row, field: string): L => ({ de: r[`${field}_de`] ?? "", fr: r[`${field}_fr`] ?? "", en: r[`${field}_en`] ?? "" });

const mapService = (r: Row): Service => ({
  id: Number(r.id),
  slug: tri(r, "slug"),
  name: tri(r, "name"),
  short: tri(r, "short"),
  long: tri(r, "long"),
  icon: iconFor(String(r.slug_de ?? "")),
  image: r.image || (site.images.serviceFallback.find(([k]) => String(r.slug_de ?? "").includes(k)) ?? ["", site.images.hero])[1],
  durationMin: Number(r.duration_min),
  priceChf: Number(r.price_chf),
  priceFrom: Boolean(r.price_from),
  walkinPriceChf: r.walkin_price_chf == null ? null : Number(r.walkin_price_chf),
  category: toCategory(r.category),
  popular: Boolean(r.popular),
  active: Boolean(r.active),
  sort: Number(r.sort),
});

const mapDay = (r: Row): OpeningDay => ({
  weekday: Number(r.weekday),
  isOpen: Boolean(r.is_open),
  openTime: hm(r.open_time),
  closeTime: hm(r.close_time),
  breakStart: r.break_start ? hm(r.break_start) : null,
  breakEnd: r.break_end ? hm(r.break_end) : null,
});

const mapBlocked = (r: Row): Blocked => ({
  id: Number(r.id),
  startsAt: toDate(r.starts_at),
  endsAt: toDate(r.ends_at),
  reason: r.reason,
});

export const mapBooking = (r: Row): Booking => ({
  id: r.id,
  serviceId: r.service_id == null ? null : Number(r.service_id),
  serviceName: r.service_name,
  priceChf: r.price_chf == null ? null : Number(r.price_chf),
  durationMin: Number(r.duration_min),
  startsAt: toDate(r.starts_at),
  endsAt: toDate(r.ends_at),
  busyUntil: toDate(r.busy_until),
  locale: r.locale,
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  note: r.note,
  status: r.status,
  source: r.source,
  cancelToken: r.cancel_token,
  createdAt: toDate(r.created_at),
  reminderSentAt: r.reminder_sent_at ? toDate(r.reminder_sent_at) : null,
  followupSentAt: r.followup_sent_at ? toDate(r.followup_sent_at) : null,
  noShow: !!r.no_show,
  marketingConsent: !!r.marketing_consent,
  emailVerified: !!r.email_verified,
  lateCancel: !!r.late_cancel,
  feeOpen: !!r.fee_open,
});

export async function getServices(opts: { includeInactive?: boolean } = {}): Promise<Service[]> {
  const sql = await getSql();
  const rows = opts.includeInactive
    ? await sql`SELECT * FROM services ORDER BY sort, id`
    : await sql`SELECT * FROM services WHERE active ORDER BY sort, id`;
  return rows.map(mapService);
}

export async function getService(id: number): Promise<Service | null> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM services WHERE id = ${id}`;
  return rows[0] ? mapService(rows[0]) : null;
}

/** Leistung anhand der Adresse finden (in irgendeiner Sprache). */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM services WHERE active AND (slug_de = ${slug} OR slug_fr = ${slug} OR slug_en = ${slug})`;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function getOpeningHours(): Promise<OpeningDay[]> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM opening_hours ORDER BY weekday`;
  return rows.map(mapDay);
}

export async function getBlockedBetween(from: Date, to: Date): Promise<Blocked[]> {
  const sql = await getSql();
  const rows = await sql`
    SELECT * FROM blocked_times
    WHERE starts_at < ${to.toISOString()}::timestamptz AND ends_at > ${from.toISOString()}::timestamptz
    ORDER BY starts_at`;
  return rows.map(mapBlocked);
}

export async function getUpcomingBlocked(): Promise<Blocked[]> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM blocked_times WHERE ends_at > now() ORDER BY starts_at`;
  return rows.map(mapBlocked);
}

export async function getBookingsBetween(from: Date, to: Date, opts: { includeCancelled?: boolean } = {}): Promise<Booking[]> {
  const sql = await getSql();
  const rows = await sql`
    SELECT * FROM bookings
    WHERE starts_at < ${to.toISOString()}::timestamptz AND busy_until > ${from.toISOString()}::timestamptz
      AND (${opts.includeCancelled ?? false}::boolean OR status = 'confirmed')
    ORDER BY starts_at`;
  return rows.map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = await getSql();
  const rows = await sql`SELECT * FROM bookings WHERE id = ${id}::uuid`;
  return rows[0] ? mapBooking(rows[0]) : null;
}

export async function getBookingByToken(token: string): Promise<Booking | null> {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  const sql = await getSql();
  const rows = await sql`SELECT * FROM bookings WHERE cancel_token = ${token}`;
  return rows[0] ? mapBooking(rows[0]) : null;
}

export async function getBookingStats() {
  const sql = await getSql();
  const [row] = await sql`
    SELECT
      count(*) FILTER (WHERE status = 'confirmed' AND starts_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Zurich') AT TIME ZONE 'Europe/Zurich'
                         AND starts_at < (date_trunc('day', now() AT TIME ZONE 'Europe/Zurich') + interval '1 day') AT TIME ZONE 'Europe/Zurich') AS today,
      count(*) FILTER (WHERE status = 'confirmed' AND starts_at >= now() AND starts_at < now() + interval '7 days') AS week,
      count(*) FILTER (WHERE status = 'confirmed' AND starts_at >= now()) AS upcoming,
      coalesce(sum(price_chf) FILTER (WHERE status = 'confirmed' AND starts_at >= now() AND starts_at < now() + interval '7 days'), 0) AS week_revenue
    FROM bookings`;
  return {
    today: Number(row.today),
    week: Number(row.week),
    upcoming: Number(row.upcoming),
    weekRevenue: Number(row.week_revenue),
  };
}
