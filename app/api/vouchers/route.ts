import { after, NextResponse } from "next/server";
import { siteLocked } from "@/lib/auth";
import { isBlocked } from "@/lib/customers";
import { sendVoucherAdminNotice, sendVoucherMail } from "@/lib/email";
import { fill, getDict } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { pushVoucherToAdmins } from "@/lib/push";
import { clientIp, overLimit } from "@/lib/ratelimit";
import { getSettings } from "@/lib/settings";
import { createVoucher, getVoucherSettings } from "@/lib/vouchers";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Gutschein online bestellen: wird reserviert und beim Abholen im Salon bezahlt */
export async function POST(request: Request) {
  if (await siteLocked()) return NextResponse.json({ error: "Coming soon" }, { status: 403 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const locale = isLocale(String(body.locale)) ? (body.locale as "de" | "fr" | "en") : DEFAULT_LOCALE;
  const e = getDict(locale).voucher.form.errors;

  // Honeypot gegen Spam-Bots
  if (clean(body.website, 100)) return NextResponse.json({ ok: true, code: "", amount: 0 });

  const settings = await getVoucherSettings();
  if (!settings.onlineEnabled) return NextResponse.json({ error: e.off }, { status: 403 });

  const amount = Math.round(Number(body.amount) * 100) / 100;
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const recipientName = clean(body.recipientName, 60);
  const message = clean(body.message, 300);

  let error = "";
  if (!Number.isFinite(amount) || amount < settings.minChf || amount > settings.maxChf || !Number.isInteger(amount)) error = fill(e.amount, { min: settings.minChf, max: settings.maxChf });
  else if (name.length < 2) error = e.name;
  else if (!EMAIL.test(email)) error = e.email;
  else if (phone.replace(/\D/g, "").length < 9) error = e.phone;
  else if (body.consent !== true) error = e.consent;
  if (error) return NextResponse.json({ error }, { status: 400 });

  if (await overLimit(`voucher:${await clientIp()}`, 5, 60 * 60)) return NextResponse.json({ error: e.tooMany }, { status: 429 });
  if (await isBlocked(email, phone)) return NextResponse.json({ error: e.blocked }, { status: 403 });

  try {
    const voucher = await createVoucher({ amountChf: amount, source: "online", buyerName: name, buyerEmail: email, buyerPhone: phone, recipientName, message, locale });
    // Mails und Push nach der Antwort, damit die Bestätigung sofort erscheint
    after(async () => {
      const notify = (await getSettings().catch(() => null))?.notifyEmail ?? "";
      await sendVoucherMail("ordered", voucher).catch((err) => console.error("[GYAN] Gutschein-Mail:", err));
      await sendVoucherAdminNotice(voucher, notify).catch((err) => console.error("[GYAN] Gutschein-Mail Admin:", err));
      await pushVoucherToAdmins(voucher).catch((err) => console.error("[GYAN] Gutschein-Push:", err));
    });
    return NextResponse.json({ ok: true, code: voucher.code, amount: voucher.amountChf });
  } catch (err) {
    console.error("[GYAN] Gutschein-Bestellung:", err);
    return NextResponse.json({ error: e.generic }, { status: 500 });
  }
}
