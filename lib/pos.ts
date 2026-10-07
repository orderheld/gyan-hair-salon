import "server-only";
import { createHash } from "node:crypto";
import { getSql, type Row } from "./db";
import { getServices } from "./data";
import { getSettings } from "./settings";

/* Kasse: Team, Produkte, Belege.
   Belege sind fortlaufend nummeriert und über eine Prüfsumme verkettet (jeder Beleg enthält die
   Prüfsumme des vorherigen). Die Datenbank verbietet Ändern und Löschen; korrigiert wird nur mit
   einem Storno-Beleg. So bleiben die Aufzeichnungen vollständig und unverändert (GeBüV). */

export const PAYMENTS = ["cash", "card", "twint"] as const;
export type Payment = (typeof PAYMENTS)[number];

export type Staff = { id: string; name: string; sort: number; active: boolean };
export type Product = { id: number; name: string; priceChf: number; active: boolean; sort: number };
export type SaleItem = { kind: "service" | "product" | "custom"; refId: number | null; name: string; qty: number; unitChf: number; totalChf: number; walkin?: boolean };
export type Sale = {
  no: number;
  createdAt: Date;
  staffId: string;
  staffName: string;
  payment: Payment;
  items: SaleItem[];
  totalChf: number;
  vatRate: number;
  vatChf: number;
  givenChf: number | null;
  bookingId: string | null;
  stornoOf: number | null;
  note: string;
  hash: string;
};

/** Eingabe aus der Kasse. Preise kommen immer aus der Datenbank, nur «Freier Betrag» vom Gerät. */
export type CartLine =
  | { kind: "service"; id: number; walkin: boolean; qty: number }
  | { kind: "product"; id: number; qty: number }
  | { kind: "custom"; name: string; priceChf: number; qty: number };

export class PosError extends Error {}

const money = (n: number) => Math.round(n * 100) / 100;
const n = (v: unknown) => (v === null || v === undefined ? 0 : Number(v));

const mapSale = (r: Row): Sale => ({
  no: Number(r.no),
  createdAt: new Date(r.created_at),
  staffId: r.staff_id,
  staffName: r.staff_name,
  payment: r.payment,
  items: (typeof r.items === "string" ? JSON.parse(r.items) : r.items) as SaleItem[],
  totalChf: n(r.total_chf),
  vatRate: n(r.vat_rate),
  vatChf: n(r.vat_chf),
  givenChf: r.given_chf === null ? null : n(r.given_chf),
  bookingId: r.booking_id ?? null,
  stornoOf: r.storno_of === null ? null : Number(r.storno_of),
  note: r.note ?? "",
  hash: r.hash,
});

export async function getStaff(opts: { includeInactive?: boolean } = {}): Promise<Staff[]> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM staff ORDER BY sort, id`;
  return rows.map((r) => ({ id: r.id, name: r.name, sort: Number(r.sort), active: r.active })).filter((s) => opts.includeInactive || s.active);
}

export async function saveStaff(list: { id: string; name: string; active: boolean }[]) {
  const sql = await getSql();
  for (const s of list) await sql`UPDATE staff SET name = ${s.name}, active = ${s.active} WHERE id = ${s.id}`;
}

export async function getProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM pos_products ORDER BY sort, name`;
  return rows
    .map((r) => ({ id: Number(r.id), name: r.name, priceChf: n(r.price_chf), active: r.active, sort: Number(r.sort) }))
    .filter((p) => opts.includeInactive || p.active);
}

export async function saveProduct(p: { id?: number; name: string; priceChf: number; active: boolean; sort: number }) {
  const sql = await getSql();
  if (p.id) await sql`UPDATE pos_products SET name = ${p.name}, price_chf = ${p.priceChf}, active = ${p.active}, sort = ${p.sort} WHERE id = ${p.id}`;
  else await sql`INSERT INTO pos_products (name, price_chf, active, sort) VALUES (${p.name}, ${p.priceChf}, ${p.active}, ${p.sort})`;
}

/** Löschen ist unbedenklich: jeder Beleg speichert Name und Preis selbst. */
export async function deleteProduct(id: number) {
  const sql = await getSql();
  await sql`DELETE FROM pos_products WHERE id = ${id}`;
}

function hashOf(prev: string, s: Omit<Sale, "hash" | "createdAt"> & { createdAt: string }) {
  const payload = JSON.stringify([s.no, s.createdAt, s.staffId, s.staffName, s.payment, s.items.map((i) => [i.kind, i.refId, i.name, i.qty, i.unitChf.toFixed(2), i.totalChf.toFixed(2), !!i.walkin]), s.totalChf.toFixed(2), s.vatRate.toFixed(2), s.vatChf.toFixed(2), s.givenChf === null ? null : s.givenChf.toFixed(2), s.bookingId, s.stornoOf, s.note]);
  return createHash("sha256").update(prev + "|" + payload).digest("hex");
}

/** Schreibt einen Beleg mit der nächsten Nummer. Bei gleichzeitigem Kassieren wird neu versucht. */
async function insertSale(data: Omit<Sale, "no" | "createdAt" | "hash">): Promise<Sale> {
  const sql = await getSql();
  for (let attempt = 0; attempt < 6; attempt++) {
    const [last] = await sql`SELECT no, hash FROM pos_sales ORDER BY no DESC LIMIT 1`;
    const no = last ? Number(last.no) + 1 : 1;
    const prev = last?.hash ?? "GYAN";
    const createdAt = new Date();
    // Millisekunden weg: so liest die Datenbank exakt denselben Zeitpunkt zurück wie gehasht
    createdAt.setMilliseconds(0);
    const iso = createdAt.toISOString();
    const hash = hashOf(prev, { ...data, no, createdAt: iso });
    try {
      const rows = await sql`
        INSERT INTO pos_sales (no, created_at, staff_id, staff_name, payment, items, total_chf, vat_rate, vat_chf, given_chf, booking_id, storno_of, note, prev_hash, hash)
        VALUES (${no}, ${iso}, ${data.staffId}, ${data.staffName}, ${data.payment}, ${JSON.stringify(data.items)}::jsonb, ${data.totalChf}, ${data.vatRate}, ${data.vatChf},
                ${data.givenChf}, ${data.bookingId}, ${data.stornoOf}, ${data.note}, ${prev}, ${hash})
        RETURNING *`;
      return mapSale(rows[0]);
    } catch (error) {
      const e = error as { code?: string; message?: string };
      if (e.code === "23505" && /pos_sales_pkey/.test(e.message ?? "pos_sales_pkey")) continue;
      throw error;
    }
  }
  throw new PosError("busy");
}

function vatFor(total: number, rate: number) {
  return rate > 0 ? money((total * rate) / (100 + rate)) : 0;
}

export async function createSale(input: { staffId: string; payment: Payment; lines: CartLine[]; givenChf: number | null; bookingId: string | null; note: string }): Promise<Sale> {
  if (!PAYMENTS.includes(input.payment)) throw new PosError("payment");
  if (!input.lines.length || input.lines.length > 40) throw new PosError("empty");
  const [staff, services, products, settings] = await Promise.all([getStaff(), getServices({ includeInactive: true }), getProducts({ includeInactive: true }), getSettings()]);
  const member = staff.find((s) => s.id === input.staffId);
  if (!member) throw new PosError("staff");

  const items: SaleItem[] = input.lines.map((line) => {
    const qty = Math.round(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) throw new PosError("qty");
    if (line.kind === "service") {
      const s = services.find((x) => x.id === line.id);
      if (!s) throw new PosError("item");
      const walkin = line.walkin && s.walkinPriceChf !== null;
      const unit = walkin ? s.walkinPriceChf! : s.priceChf;
      return { kind: "service", refId: s.id, name: s.name.de, qty, unitChf: unit, totalChf: money(unit * qty), walkin };
    }
    if (line.kind === "product") {
      const p = products.find((x) => x.id === line.id);
      if (!p) throw new PosError("item");
      return { kind: "product", refId: p.id, name: p.name, qty, unitChf: p.priceChf, totalChf: money(p.priceChf * qty) };
    }
    const name = String(line.name ?? "").trim().slice(0, 80);
    const unit = money(Number(line.priceChf));
    if (!name || !Number.isFinite(unit) || unit < -2000 || unit > 5000 || unit === 0) throw new PosError("custom");
    return { kind: "custom", refId: null, name, qty, unitChf: unit, totalChf: money(unit * qty) };
  });

  const total = money(items.reduce((sum, i) => sum + i.totalChf, 0));
  if (total < 0) throw new PosError("negative");
  const given = input.payment === "cash" && input.givenChf !== null && Number.isFinite(input.givenChf) ? money(input.givenChf) : null;
  if (given !== null && given < total) throw new PosError("given");
  const rate = settings.vatNumber ? settings.vatRate : 0;

  return insertSale({
    staffId: member.id,
    staffName: member.name,
    payment: input.payment,
    items,
    totalChf: total,
    vatRate: rate,
    vatChf: vatFor(total, rate),
    givenChf: given,
    bookingId: input.bookingId && /^[0-9a-f-]{36}$/i.test(input.bookingId) ? input.bookingId : null,
    stornoOf: null,
    note: input.note.trim().slice(0, 200),
  });
}

/** Storno: neuer Beleg mit umgekehrten Beträgen. Der ursprüngliche Beleg bleibt unverändert. */
export async function stornoSale(no: number, reason: string): Promise<Sale> {
  const original = await getSale(no);
  if (!original) throw new PosError("item");
  if (original.stornoOf !== null) throw new PosError("storno");
  const sql = await getSql();
  const [done] = await sql`SELECT no FROM pos_sales WHERE storno_of = ${no}`;
  if (done) throw new PosError("storno");
  return insertSale({
    staffId: original.staffId,
    staffName: original.staffName,
    payment: original.payment,
    items: original.items.map((i) => ({ ...i, unitChf: -i.unitChf, totalChf: -i.totalChf })),
    totalChf: -original.totalChf,
    vatRate: original.vatRate,
    vatChf: -original.vatChf,
    givenChf: null,
    bookingId: original.bookingId,
    stornoOf: original.no,
    note: reason.trim().slice(0, 200),
  });
}

export async function getSale(no: number): Promise<Sale | null> {
  if (!Number.isInteger(no) || no < 1) return null;
  const sql = await getSql();
  const rows = await sql`SELECT * FROM pos_sales WHERE no = ${no}`;
  return rows[0] ? mapSale(rows[0]) : null;
}

export async function getStornoFor(no: number): Promise<Sale | null> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM pos_sales WHERE storno_of = ${no}`;
  return rows[0] ? mapSale(rows[0]) : null;
}

export async function getSalesBetween(from: Date, to: Date): Promise<Sale[]> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM pos_sales WHERE created_at >= ${from.toISOString()} AND created_at < ${to.toISOString()} ORDER BY no`;
  return rows.map(mapSale);
}

/** Termine, die schon abgerechnet sind (ohne stornierte Belege) */
export async function billedBookingIds(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const sql = await getSql();
  const rows = await sql.query(
    `SELECT s.booking_id FROM pos_sales s
     WHERE s.booking_id = ANY($1::uuid[]) AND s.storno_of IS NULL
       AND NOT EXISTS (SELECT 1 FROM pos_sales x WHERE x.storno_of = s.no)`,
    [ids],
  );
  return new Set(rows.map((r) => String(r.booking_id)));
}

export type Summary = {
  count: number;
  total: number;
  services: number;
  products: number;
  vat: number;
  byPayment: Record<Payment, number>;
  byStaff: { id: string; name: string; count: number; services: number; products: number; total: number }[];
};

/** Auswertung: Stornos zählen negativ, so stimmt jede Summe mit den Belegen überein. */
export function summarize(sales: Sale[], staff: Staff[]): Summary {
  const byPayment = { cash: 0, card: 0, twint: 0 } as Record<Payment, number>;
  const rows = new Map(staff.map((s) => [s.id, { id: s.id, name: s.name, count: 0, services: 0, products: 0, total: 0 }]));
  let services = 0;
  let products = 0;
  let vat = 0;
  let count = 0;
  for (const sale of sales) {
    const row = rows.get(sale.staffId) ?? { id: sale.staffId, name: sale.staffName, count: 0, services: 0, products: 0, total: 0 };
    rows.set(sale.staffId, row);
    const sign = sale.stornoOf === null ? 1 : -1;
    count += sign;
    row.count += sign;
    byPayment[sale.payment] = money(byPayment[sale.payment] + sale.totalChf);
    vat = money(vat + sale.vatChf);
    for (const item of sale.items) {
      // Freie Beträge zählen zu den Leistungen (z. B. Rabatt auf einen Schnitt)
      if (item.kind === "product") { products = money(products + item.totalChf); row.products = money(row.products + item.totalChf); }
      else { services = money(services + item.totalChf); row.services = money(row.services + item.totalChf); }
    }
    row.total = money(row.services + row.products);
  }
  return { count, total: money(services + products), services, products, vat, byPayment, byStaff: [...rows.values()] };
}

/** Prüft die ganze Belegkette: Nummern lückenlos, jede Prüfsumme passt. Gibt die erste fehlerhafte Nummer zurück. */
export async function verifyChain(): Promise<{ ok: boolean; count: number; brokenAt: number | null }> {
  const sql = await getSql();
  const rows = await sql`SELECT * FROM pos_sales ORDER BY no`;
  let prev = "GYAN";
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const s = mapSale(r);
    if (s.no !== i + 1 || r.prev_hash !== prev || hashOf(prev, { ...s, createdAt: s.createdAt.toISOString() }) !== s.hash) {
      return { ok: false, count: rows.length, brokenAt: s.no };
    }
    prev = s.hash;
  }
  return { ok: true, count: rows.length, brokenAt: null };
}

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Export für Treuhand und Buchhaltung: eine Zeile pro Position, alle Belege vollständig. */
export function salesCsv(sales: Sale[], dateTime: (d: Date) => string): string {
  const head = ["Beleg", "Datum/Zeit", "Mitarbeiter", "Zahlung", "Art", "Position", "Menge", "Einzelpreis CHF", "Betrag CHF", "Beleg total CHF", "MWST %", "MWST CHF", "Storno von Beleg", "Notiz", "Prüfsumme"];
  const lines = [head.join(";")];
  for (const s of sales) {
    for (const i of s.items) {
      lines.push([s.no, dateTime(s.createdAt), s.staffName, s.payment, i.kind, i.name + (i.walkin ? " (ohne Termin)" : ""), i.qty, i.unitChf.toFixed(2), i.totalChf.toFixed(2), s.totalChf.toFixed(2), s.vatRate.toFixed(2), s.vatChf.toFixed(2), s.stornoOf ?? "", s.note, s.hash].map(csvCell).join(";"));
    }
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}
