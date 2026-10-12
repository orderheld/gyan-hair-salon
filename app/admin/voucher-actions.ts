"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminText } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { sendVoucherMail } from "@/lib/email";
import { formatChf } from "@/lib/format";
import { fill } from "@/lib/i18n";
import {
  cancelVoucher,
  createVoucher,
  getVoucher,
  getVoucherSettings,
  markNotPickedUp,
  markPickedUp,
  markReminded,
  redeemVoucher,
  restoreVoucher,
  saveVoucherSettings,
  undoRedemption,
  updateVoucherNote,
  VOUCHER_PAYMENTS,
  type VoucherPayment,
} from "@/lib/vouchers";

const str = (fd: FormData, key: string, max = 300) => String(fd.get(key) ?? "").trim().slice(0, max);
const num = (fd: FormData, key: string) => Number(str(fd, key, 20).replace(",", "."));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const go = (path: string, params: Record<string, string>): never => redirect(`${path}?${new URLSearchParams(params)}`);
const detail = (id: number) => `/admin/gutscheine/${id}`;
const payment = (fd: FormData): VoucherPayment | null => {
  const p = str(fd, "payment", 10);
  return (VOUCHER_PAYMENTS as readonly string[]).includes(p) ? (p as VoucherPayment) : null;
};

/** Gutschein laden; fehlt er, zurück zur Übersicht */
async function load(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = Number(str(fd, "id", 12));
  const v = await getVoucher(id);
  if (!v) go("/admin/gutscheine", { error: t.vouchers.errors.notFound });
  return { t: t.vouchers, v: v! };
}

/** Mail schicken und Ergebnis als Hinweis zurückgeben */
async function mail(kind: Parameters<typeof sendVoucherMail>[0], id: number, t: Awaited<ReturnType<typeof load>>["t"]): Promise<string | null> {
  const fresh = await getVoucher(id);
  if (!fresh?.buyerEmail) return t.errors.noEmail;
  const error = await sendVoucherMail(kind, fresh);
  return error ? fill(t.errors.mail, { error }) : null;
}

export async function voucherPickUp(fd: FormData) {
  const { t, v } = await load(fd);
  const pay = payment(fd);
  if (!pay) go(detail(v.id), { error: t.errors.payment });
  if (!(await markPickedUp(v.id, pay!))) go(detail(v.id), { error: t.errors.state });
  if (fd.get("sendMail") === "on" && v.buyerEmail) {
    const error = await mail("picked", v.id, t);
    if (error) go(detail(v.id), { error });
    go(detail(v.id), { ok: t.done.pickedMail });
  }
  go(detail(v.id), { ok: t.done.picked });
}

export async function voucherNotPickedUp(fd: FormData) {
  const { t, v } = await load(fd);
  if (!(await markNotPickedUp(v.id))) go(detail(v.id), { error: t.errors.state });
  go(detail(v.id), { ok: t.done.notPicked });
}

export async function voucherRedeem(fd: FormData) {
  const { t, v } = await load(fd);
  const amount = Math.round(num(fd, "amount") * 100) / 100;
  if (!(amount > 0) || amount > v.balanceChf) go(detail(v.id), { error: v.state === "ordered" ? t.notPaidYet : t.errors.amount });
  if (!(await redeemVoucher(v.id, amount, str(fd, "note", 120)))) go(detail(v.id), { error: t.errors.state });
  const balance = Math.round((v.balanceChf - amount) * 100) / 100;
  go(detail(v.id), { ok: fill(t.done.redeemed, { amount: formatChf(amount), balance: formatChf(balance) }) });
}

export async function voucherUndoRedemption(fd: FormData) {
  const { t, v } = await load(fd);
  if (!(await undoRedemption(v.id, Number(str(fd, "redemption", 12))))) go(detail(v.id), { error: t.errors.state });
  go(detail(v.id), { ok: t.done.undone });
}

export async function voucherRemind(fd: FormData) {
  const { t, v } = await load(fd);
  if (v.status !== "ordered") go(detail(v.id), { error: t.errors.state });
  const error = await mail("remind", v.id, t);
  if (error) go(detail(v.id), { error });
  await markReminded(v.id);
  go(detail(v.id), { ok: t.done.reminded });
}

export async function voucherCancel(fd: FormData) {
  const { t, v } = await load(fd);
  if (v.usedChf > 0) go(detail(v.id), { error: t.errors.hasRedemptions });
  if (!(await cancelVoucher(v.id))) go(detail(v.id), { error: t.errors.state });
  if (fd.get("sendMail") === "on" && v.buyerEmail) {
    const error = await mail("cancelled", v.id, t);
    if (error) go(detail(v.id), { error });
    go(detail(v.id), { ok: t.done.cancelledMail });
  }
  go(detail(v.id), { ok: t.done.cancelled });
}

export async function voucherRestore(fd: FormData) {
  const { t, v } = await load(fd);
  if (!(await restoreVoucher(v.id))) go(detail(v.id), { error: t.errors.state });
  go(detail(v.id), { ok: t.done.restored });
}

export async function voucherSaveNote(fd: FormData) {
  const { t, v } = await load(fd);
  await updateVoucherNote(v.id, str(fd, "note", 500), str(fd, "recipientName", 60));
  go(detail(v.id), { ok: t.done.saved });
}

/** Im Salon verkauft: sofort bezahlt und gültig */
export async function voucherSell(fd: FormData) {
  await requireAdmin();
  const { locale, t: all } = await getAdminText();
  const t = all.vouchers;
  const amount = Math.round(num(fd, "amount") * 100) / 100;
  const pay = payment(fd);
  const email = str(fd, "email", 120).toLowerCase();
  if (!(amount >= 1 && amount <= 2000)) go("/admin/gutscheine/verkaufen", { error: t.errors.sellAmount });
  if (!pay) go("/admin/gutscheine/verkaufen", { error: t.errors.payment });
  if (email && !EMAIL.test(email)) go("/admin/gutscheine/verkaufen", { error: t.errors.email });
  const v = await createVoucher({
    amountChf: amount,
    source: "salon",
    payment: pay,
    buyerName: str(fd, "buyerName", 80),
    buyerEmail: email,
    buyerPhone: str(fd, "buyerPhone", 30),
    recipientName: str(fd, "recipientName", 60),
    message: "",
    note: str(fd, "note", 500),
    locale: (["de", "fr", "en"] as const).find((l) => l === str(fd, "locale", 2)) ?? locale,
  });
  if (email) {
    const error = await sendVoucherMail("picked", v);
    if (error) go(detail(v.id), { error: fill(t.errors.mail, { error }) });
  }
  go(detail(v.id), { ok: fill(t.done.created, { code: v.code }) });
}

export async function voucherSaveSettings(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const current = await getVoucherSettings();
  const presets = str(fd, "presets", 120).split(/[,;\s]+/).map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
  await saveVoucherSettings({
    onlineEnabled: fd.get("onlineEnabled") === "on",
    presets: presets.length ? presets : current.presets,
    minChf: num(fd, "minChf") || current.minChf,
    maxChf: num(fd, "maxChf") || current.maxChf,
  });
  // Gutscheinseite und FAQ zeigen je nach Einstellung andere Inhalte
  revalidatePath("/", "layout");
  go("/admin/gutscheine/einstellungen", { ok: t.vouchers.done.saved });
}
