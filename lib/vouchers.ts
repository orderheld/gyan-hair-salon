import "server-only";
import { randomInt } from "node:crypto";
import type { Locale } from "@/content/types";
import { getSql, type Row } from "./db";
import { isLocale } from "./i18n/config";

/**
 * Gutscheine.
 * - Online bestellt: Status «ordered» (reserviert, noch nicht bezahlt). Im Salon bezahlt und abgeholt: «active».
 *   Ein bestellter Gutschein kann erst nach dem Bezahlen eingelöst werden.
 * - Im Salon verkauft: direkt «active».
 * - Einlösen geht auch in Teilen: jede Einlösung ist ein Eintrag, der Restwert ist Betrag minus Summe.
 * - Storniert: «cancelled», bleibt für die Übersicht gespeichert.
 */

export const VOUCHER_PAYMENTS = ["cash", "card", "twint"] as const;
export type VoucherPayment = (typeof VOUCHER_PAYMENTS)[number];
export type VoucherStatus = "ordered" | "active" | "cancelled";
/** Anzeige im Admin: active wird je nach Restwert zu «gültig», «teilweise eingelöst» oder «eingelöst» */
export type VoucherState = "ordered" | "valid" | "partial" | "redeemed" | "cancelled";

export type VoucherSettings = {
  /** Online-Bestellung auf der Gutscheinseite */
  onlineEnabled: boolean;
  /** Vorschläge im Bestellformular */
  presets: number[];
  minChf: number;
  maxChf: number;
};

export const DEFAULT_VOUCHER_SETTINGS: VoucherSettings = { onlineEnabled: true, presets: [30, 50, 80, 100], minChf: 20, maxChf: 500 };

export type Redemption = { id: number; amountChf: number; note: string; createdAt: Date; saleNo: number | null };
export type Voucher = {
  id: number;
  code: string;
  amountChf: number;
  source: "online" | "salon";
  status: VoucherStatus;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  recipientName: string;
  message: string;
  locale: Locale;
  payment: VoucherPayment | null;
  note: string;
  createdAt: Date;
  pickedUpAt: Date | null;
  cancelledAt: Date | null;
  remindedAt: Date | null;
  /** Kassenbeleg, mit dem er verkauft oder abgeholt wurde */
  saleNo: number | null;
  usedChf: number;
  balanceChf: number;
  state: VoucherState;
};

const date = (v: unknown) => (v ? (v instanceof Date ? v : new Date(String(v))) : null);
const money = (n: number) => Math.round(n * 100) / 100;

function stateOf(status: VoucherStatus, amount: number, used: number): VoucherState {
  if (status !== "active") return status;
  if (used <= 0) return "valid";
  return used >= amount ? "redeemed" : "partial";
}

const mapVoucher = (r: Row): Voucher => {
  const amountChf = Number(r.amount_chf);
  const usedChf = money(Number(r.used_chf ?? 0));
  const status = r.status as VoucherStatus;
  return {
    id: Number(r.id),
    code: String(r.code),
    amountChf,
    source: r.source === "salon" ? "salon" : "online",
    status,
    buyerName: String(r.buyer_name ?? ""),
    buyerEmail: String(r.buyer_email ?? ""),
    buyerPhone: String(r.buyer_phone ?? ""),
    recipientName: String(r.recipient_name ?? ""),
    message: String(r.message ?? ""),
    locale: isLocale(String(r.locale)) ? (r.locale as Locale) : "de",
    payment: (VOUCHER_PAYMENTS as readonly string[]).includes(String(r.payment)) ? (r.payment as VoucherPayment) : null,
    note: String(r.note ?? ""),
    createdAt: date(r.created_at)!,
    pickedUpAt: date(r.picked_up_at),
    cancelledAt: date(r.cancelled_at),
    remindedAt: date(r.reminded_at),
    saleNo: r.sale_no === null || r.sale_no === undefined ? null : Number(r.sale_no),
    usedChf,
    balanceChf: status === "cancelled" ? 0 : money(Math.max(0, amountChf - usedChf)),
    state: stateOf(status, amountChf, usedChf),
  };
};

/* ---------- Einstellungen ---------- */

export async function getVoucherSettings(): Promise<VoucherSettings> {
  const sql = await getSql();
  const [row] = await sql`SELECT value FROM settings WHERE key = 'vouchers'`;
  return normalizeSettings({ ...DEFAULT_VOUCHER_SETTINGS, ...((row?.value ?? {}) as Partial<VoucherSettings>) });
}

export function normalizeSettings(s: VoucherSettings): VoucherSettings {
  const minChf = Math.min(1000, Math.max(5, Math.round(Number(s.minChf) || DEFAULT_VOUCHER_SETTINGS.minChf)));
  const maxChf = Math.min(2000, Math.max(minChf, Math.round(Number(s.maxChf) || DEFAULT_VOUCHER_SETTINGS.maxChf)));
  const presets = [...new Set((Array.isArray(s.presets) ? s.presets : []).map((n) => Math.round(Number(n))).filter((n) => n >= minChf && n <= maxChf))]
    .sort((a, b) => a - b)
    .slice(0, 6);
  return { onlineEnabled: s.onlineEnabled !== false, presets, minChf, maxChf };
}

export async function saveVoucherSettings(s: VoucherSettings) {
  const sql = await getSql();
  const value = JSON.stringify(normalizeSettings(s));
  await sql`INSERT INTO settings (key, value, updated_at) VALUES ('vouchers', ${value}::jsonb, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
}

/* ---------- Code ---------- */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // ohne 0/O, 1/I/L
const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
export const newVoucherCode = () => `GYAN-${block()}-${block()}`;

/** Eingabe wie «gyan abcd efgh» oder «ABCDEFGH» zu «GYAN-ABCD-EFGH» */
export function normalizeCode(input: string): string {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^GYAN/, "");
  return raw.length === 8 ? `GYAN-${raw.slice(0, 4)}-${raw.slice(4)}` : "";
}

/* ---------- Lesen ---------- */

const SELECT = `SELECT v.*, coalesce((SELECT sum(r.amount_chf) FROM voucher_redemptions r WHERE r.voucher_id = v.id), 0) AS used_chf FROM vouchers v`;

export async function getVoucher(id: number): Promise<(Voucher & { redemptions: Redemption[] }) | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const sql = await getSql();
  const [rows, reds] = await Promise.all([
    sql.query(`${SELECT} WHERE v.id = $1`, [id]),
    sql`SELECT * FROM voucher_redemptions WHERE voucher_id = ${id} ORDER BY created_at DESC, id DESC`,
  ]);
  if (!rows[0]) return null;
  return {
    ...mapVoucher(rows[0]),
    redemptions: reds.map((r) => ({ id: Number(r.id), amountChf: Number(r.amount_chf), note: String(r.note ?? ""), createdAt: date(r.created_at)!, saleNo: r.sale_no === null || r.sale_no === undefined ? null : Number(r.sale_no) })),
  };
}

export async function getVoucherByCode(code: string): Promise<Voucher | null> {
  const c = normalizeCode(code);
  if (!c) return null;
  const sql = await getSql();
  const [r] = await sql.query(`${SELECT} WHERE v.code = $1`, [c]);
  return r ? mapVoucher(r) : null;
}

export type VoucherFilter = "open" | "valid" | "redeemed" | "cancelled" | "all";

/** Liste fürs Admin, neueste zuerst. q sucht in Code, Namen, E-Mail und Telefon. */
export async function listVouchers(filter: VoucherFilter, q = ""): Promise<Voucher[]> {
  const sql = await getSql();
  const params: unknown[] = [];
  const where: string[] = [];
  const term = q.trim();
  if (term) {
    params.push(`%${term.toLowerCase()}%`);
    const code = normalizeCode(term);
    params.push(code || "-");
    where.push(`(lower(v.code) LIKE $1 OR lower(v.buyer_name) LIKE $1 OR lower(v.buyer_email) LIKE $1 OR lower(v.recipient_name) LIKE $1 OR regexp_replace(v.buyer_phone, '\\D', '', 'g') LIKE '%' || nullif(regexp_replace($1, '\\D', '', 'g'), '') || '%' OR v.code = $2)`);
  }
  const used = `coalesce((SELECT sum(r.amount_chf) FROM voucher_redemptions r WHERE r.voucher_id = v.id), 0)`;
  if (!term) {
    if (filter === "open") where.push(`v.status = 'ordered'`);
    if (filter === "valid") where.push(`v.status = 'active' AND ${used} < v.amount_chf`);
    if (filter === "redeemed") where.push(`v.status = 'active' AND ${used} >= v.amount_chf`);
    if (filter === "cancelled") where.push(`v.status = 'cancelled'`);
  }
  const rows = await sql.query(`${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY v.created_at DESC LIMIT 300`, params);
  return rows.map(mapVoucher);
}

export type VoucherStats = { open: number; openChf: number; valid: number; validChf: number; soldMonthChf: number; redeemedMonthChf: number };

export async function getVoucherStats(): Promise<VoucherStats> {
  const sql = await getSql();
  const [a] = await sql`
    WITH v AS (
      SELECT v.*, coalesce((SELECT sum(r.amount_chf) FROM voucher_redemptions r WHERE r.voucher_id = v.id), 0) AS used FROM vouchers v
    )
    SELECT
      count(*) FILTER (WHERE status = 'ordered')::int AS open,
      coalesce(sum(amount_chf) FILTER (WHERE status = 'ordered'), 0) AS open_chf,
      count(*) FILTER (WHERE status = 'active' AND used < amount_chf)::int AS valid,
      coalesce(sum(amount_chf - used) FILTER (WHERE status = 'active' AND used < amount_chf), 0) AS valid_chf,
      coalesce(sum(amount_chf) FILTER (WHERE status = 'active' AND picked_up_at >= date_trunc('month', now() AT TIME ZONE 'Europe/Zurich') AT TIME ZONE 'Europe/Zurich'), 0) AS sold_month
    FROM v`;
  const [b] = await sql`
    SELECT coalesce(sum(amount_chf), 0) AS n FROM voucher_redemptions
    WHERE created_at >= date_trunc('month', now() AT TIME ZONE 'Europe/Zurich') AT TIME ZONE 'Europe/Zurich'`;
  return {
    open: Number(a?.open ?? 0),
    openChf: money(Number(a?.open_chf ?? 0)),
    valid: Number(a?.valid ?? 0),
    validChf: money(Number(a?.valid_chf ?? 0)),
    soldMonthChf: money(Number(a?.sold_month ?? 0)),
    redeemedMonthChf: money(Number(b?.n ?? 0)),
  };
}

export async function countOpenVouchers(): Promise<number> {
  const sql = await getSql();
  const [r] = await sql`SELECT count(*)::int AS n FROM vouchers WHERE status = 'ordered'`;
  return Number(r?.n ?? 0);
}

/* ---------- Schreiben ---------- */

type NewVoucher = {
  amountChf: number;
  source: "online" | "salon";
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  recipientName: string;
  message: string;
  locale: Locale;
  payment?: VoucherPayment | null;
  note?: string;
  /** Kasse: Code steht schon auf dem Beleg */
  code?: string;
  saleNo?: number | null;
};

export async function createVoucher(v: NewVoucher): Promise<Voucher> {
  const sql = await getSql();
  const active = v.source === "salon";
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = attempt === 0 && v.code ? v.code : newVoucherCode();
    const rows = await sql`
      INSERT INTO vouchers (code, amount_chf, source, status, buyer_name, buyer_email, buyer_phone, recipient_name, message, locale, payment, note, picked_up_at, sale_no)
      VALUES (${code}, ${money(v.amountChf)}, ${v.source}, ${active ? "active" : "ordered"}, ${v.buyerName}, ${v.buyerEmail.toLowerCase()}, ${v.buyerPhone},
              ${v.recipientName}, ${v.message}, ${v.locale}, ${active ? (v.payment ?? null) : null}, ${v.note ?? ""}, ${active ? new Date().toISOString() : null}, ${v.saleNo ?? null})
      ON CONFLICT (code) DO NOTHING
      RETURNING *, 0 AS used_chf`;
    if (rows[0]) return mapVoucher(rows[0]);
  }
  throw new Error("Kein freier Gutschein-Code gefunden");
}

/** Bezahlt und abgeholt (nur aus «bestellt») */
export async function markPickedUp(id: number, payment: VoucherPayment, saleNo: number | null = null): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`UPDATE vouchers SET status = 'active', payment = ${payment}, picked_up_at = now(), sale_no = ${saleNo} WHERE id = ${id} AND status = 'ordered' RETURNING id`;
  return rows.length > 0;
}

/** Zurück auf «nicht abgeholt» (nur wenn noch nichts eingelöst ist) */
export async function markNotPickedUp(id: number): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`
    UPDATE vouchers SET status = 'ordered', payment = NULL, picked_up_at = NULL, sale_no = NULL
    WHERE id = ${id} AND status = 'active' AND source = 'online' AND sale_no IS NULL AND NOT EXISTS (SELECT 1 FROM voucher_redemptions WHERE voucher_id = ${id})
    RETURNING id`;
  return rows.length > 0;
}

export async function cancelVoucher(id: number): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`
    UPDATE vouchers SET status = 'cancelled', cancelled_at = now()
    WHERE id = ${id} AND status <> 'cancelled' AND sale_no IS NULL AND NOT EXISTS (SELECT 1 FROM voucher_redemptions WHERE voucher_id = ${id})
    RETURNING id`;
  return rows.length > 0;
}

/** Storno rückgängig: zurück auf «bestellt» oder, falls schon bezahlt, auf «gültig» */
export async function restoreVoucher(id: number): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`
    UPDATE vouchers SET status = CASE WHEN picked_up_at IS NULL THEN 'ordered' ELSE 'active' END, cancelled_at = NULL
    WHERE id = ${id} AND status = 'cancelled' AND NOT (source = 'salon' AND sale_no IS NOT NULL) RETURNING id`;
  return rows.length > 0;
}

/** Einlösen (ganz oder teilweise). Nur gültige Gutscheine, nie mehr als der Restwert. */
export async function redeemVoucher(id: number, amountChf: number, note: string, saleNo: number | null = null): Promise<boolean> {
  const amount = money(amountChf);
  if (!(amount > 0)) return false;
  const sql = await getSql();
  const rows = await sql`
    INSERT INTO voucher_redemptions (voucher_id, amount_chf, note, sale_no)
    SELECT v.id, ${amount}, ${note}, ${saleNo} FROM vouchers v
    WHERE v.id = ${id} AND v.status = 'active'
      AND v.amount_chf - coalesce((SELECT sum(r.amount_chf) FROM voucher_redemptions r WHERE r.voucher_id = v.id), 0) >= ${amount}
    RETURNING id`;
  return rows.length > 0;
}

/** Eine Einlösung zurücknehmen (Vertipper). Einlösungen aus der Kasse nur per Storno des Belegs. */
export async function undoRedemption(voucherId: number, redemptionId: number): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`DELETE FROM voucher_redemptions WHERE id = ${redemptionId} AND voucher_id = ${voucherId} AND sale_no IS NULL RETURNING id`;
  return rows.length > 0;
}

export async function updateVoucherNote(id: number, note: string, recipientName: string) {
  const sql = await getSql();
  await sql`UPDATE vouchers SET note = ${note}, recipient_name = ${recipientName} WHERE id = ${id}`;
}

export async function markReminded(id: number) {
  const sql = await getSql();
  await sql`UPDATE vouchers SET reminded_at = now() WHERE id = ${id}`;
}

/* ---------- Kasse ---------- */

/** Was ein Kassenbeleg mit Gutscheinen gemacht hat (für den Storno) */
export async function voucherEffectsOfSale(saleNo: number) {
  const sql = await getSql();
  const [vs, reds] = await Promise.all([
    sql.query(`${SELECT} WHERE v.sale_no = $1`, [saleNo]),
    sql`SELECT id FROM voucher_redemptions WHERE sale_no = ${saleNo}`,
  ]);
  return { vouchers: vs.map(mapVoucher), redemptionIds: reds.map((r) => Number(r.id)) };
}

/**
 * Storno eines Kassenbelegs: Einlösungen zurücknehmen, abgeholte Online-Gutscheine wieder auf «nicht abgeholt»,
 * im Salon verkaufte stornieren. Wurde ein verkaufter Gutschein schon eingelöst, geht der Storno nicht (vorher prüfen).
 */
export async function revertSaleVouchers(saleNo: number) {
  const sql = await getSql();
  await sql`DELETE FROM voucher_redemptions WHERE sale_no = ${saleNo}`;
  await sql`
    UPDATE vouchers SET status = 'ordered', payment = NULL, picked_up_at = NULL, sale_no = NULL
    WHERE sale_no = ${saleNo} AND source = 'online' AND status = 'active'`;
  await sql`UPDATE vouchers SET status = 'cancelled', cancelled_at = now() WHERE sale_no = ${saleNo} AND source = 'salon' AND status = 'active'`;
}
