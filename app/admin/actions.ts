"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALES, type Locale } from "@/content/types";
import { ADMIN_LANG_COOKIE, getAdminText, slugify } from "@/lib/admin";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { cancelBooking, createBooking, SlotTakenError } from "@/lib/booking";
import { getBookingById, getBookingsBetween, getService } from "@/lib/data";
import { getSql } from "@/lib/db";
import { sendBookingConfirmation, sendCancellation, sendTestEmail } from "@/lib/email";
import { fill, getDict } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { EMAIL_TYPES, getSettings, saveSettings, SLOT_STEPS, type EmailTemplate, type EmailType } from "@/lib/settings";
import { isDateKey, isTimeKey, zurichToDate } from "@/lib/time";

const str = (fd: FormData, key: string, max = 500) => String(fd.get(key) ?? "").trim().slice(0, max);
const num = (fd: FormData, key: string) => Number(String(fd.get(key) ?? "").replace(",", "."));
const back = (path: string, msg: string, type: "ok" | "error" = "ok"): never => {
  const [base, hash] = path.split("#");
  const sep = base.includes("?") ? "&" : "?";
  redirect(`${base}${sep}${type}=${encodeURIComponent(msg)}${hash ? `#${hash}` : ""}`);
};
const refreshSite = () => revalidatePath("/", "layout");

/* Login & Sprache */
export async function login(_: { error?: string } | undefined, fd: FormData) {
  await new Promise((r) => setTimeout(r, 400)); // bremst Rateversuche
  const { t } = await getAdminText();
  if (!checkPassword(str(fd, "password", 200))) return { error: t.login.wrong };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function setAdminLanguage(fd: FormData) {
  const lang = str(fd, "lang", 2);
  if (isLocale(lang)) {
    (await cookies()).set(ADMIN_LANG_COOKIE, lang, { path: "/admin", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  const to = str(fd, "returnTo", 200);
  redirect(/^\/admin(\/[\w-]*)*$/.test(to) ? to : "/admin");
}

/* Termine */
export async function adminCancelBooking(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const booking = await cancelBooking(str(fd, "id", 40));
  if (booking && fd.get("notify") === "on") await sendCancellation(booking, "salon");
  revalidatePath("/admin");
  back(str(fd, "returnTo", 200) || "/admin", booking ? t.bookings.cancelledMsg : t.bookings.alreadyCancelled);
}

export async function adminCreateBooking(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const date = str(fd, "date", 10);
  const time = str(fd, "time", 5);
  const returnTo = `/admin?datum=${date}`;
  const service = await getService(Number(fd.get("serviceId")));
  const name = str(fd, "name", 80);
  const lang = str(fd, "locale", 2);
  if (!service || !isDateKey(date) || !isTimeKey(time) || name.length < 2) back(returnTo, t.bookings.createMissing, "error");
  try {
    const booking = await createBooking({
      service: service!,
      startsAt: zurichToDate(date, time),
      customerName: name,
      customerEmail: str(fd, "email", 120).toLowerCase(),
      customerPhone: str(fd, "phone", 30),
      note: str(fd, "note"),
      locale: isLocale(lang) ? lang : "de",
      source: "admin",
    });
    if (booking.customerEmail && fd.get("notify") === "on") await sendBookingConfirmation(booking);
  } catch (error) {
    if (error instanceof SlotTakenError) back(returnTo, t.bookings.overlap, "error");
    throw error;
  }
  revalidatePath("/admin");
  back(returnTo, t.bookings.created);
}

export async function resendConfirmation(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const booking = await getBookingById(str(fd, "id", 40));
  if (booking?.status === "confirmed" && booking.customerEmail) await sendBookingConfirmation(booking);
  back(str(fd, "returnTo", 200) || "/admin", t.bookings.resent);
}

/* Leistungen (alle Texte in drei Sprachen) */
export async function saveService(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = Number(fd.get("id"));
  const text = (field: string, l: Locale, max: number) => str(fd, `${field}_${l}`, max);
  const name = Object.fromEntries(LOCALES.map((l) => [l, text("name", l, 80)])) as Record<Locale, string>;
  const short = Object.fromEntries(LOCALES.map((l) => [l, text("short", l, 300)])) as Record<Locale, string>;
  const long = Object.fromEntries(LOCALES.map((l) => [l, text("long", l, 8000)])) as Record<Locale, string>;
  const slug = Object.fromEntries(LOCALES.map((l) => [l, slugify(text("slug", l, 80) || name[l] || name.de)])) as Record<Locale, string>;
  const duration = Math.round(num(fd, "duration"));
  const price = num(fd, "price");
  const valid = name.de.length >= 2 && duration >= 5 && duration <= 480 && Number.isFinite(price) && price >= 0 && slug.de;
  const anchor = id ? `/admin/leistungen#s${id}` : "/admin/leistungen#neu";
  if (!valid) back(anchor, t.services.invalid, "error");

  const v = {
    image: str(fd, "image", 200),
    priceFrom: fd.get("priceFrom") === "on",
    active: id ? fd.get("active") === "on" : true,
    sort: Math.round(num(fd, "sort")) || 0,
  };
  const sql = await getSql();
  try {
    if (id) {
      await sql`UPDATE services SET
        slug_de = ${slug.de}, slug_fr = ${slug.fr}, slug_en = ${slug.en},
        name_de = ${name.de}, name_fr = ${name.fr}, name_en = ${name.en},
        short_de = ${short.de}, short_fr = ${short.fr}, short_en = ${short.en},
        long_de = ${long.de}, long_fr = ${long.fr}, long_en = ${long.en},
        image = ${v.image}, duration_min = ${duration}, price_chf = ${price}, price_from = ${v.priceFrom},
        active = ${v.active}, sort = ${v.sort}
        WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO services (slug_de, slug_fr, slug_en, name_de, name_fr, name_en, short_de, short_fr, short_en,
          long_de, long_fr, long_en, image, duration_min, price_chf, price_from, active, sort)
        VALUES (${slug.de}, ${slug.fr}, ${slug.en}, ${name.de}, ${name.fr}, ${name.en}, ${short.de}, ${short.fr}, ${short.en},
          ${long.de}, ${long.fr}, ${long.en}, ${v.image}, ${duration}, ${price}, ${v.priceFrom}, true, ${v.sort})`;
    }
  } catch (error) {
    if ((error as { code?: string })?.code === "23505") back(anchor, t.services.slugTaken, "error");
    throw error;
  }
  refreshSite();
  back(anchor, fill(id ? t.services.savedMsg : t.services.added, { name: name.de }));
}

export async function deleteService(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const sql = await getSql();
  await sql`DELETE FROM services WHERE id = ${Number(fd.get("id"))}`;
  refreshSite();
  back("/admin/leistungen", t.services.deleted);
}

/* Öffnungszeiten */
export async function saveOpeningHours(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const days = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const bs = str(fd, `bs_${d}`, 5);
    const be = str(fd, `be_${d}`, 5);
    const hasBreak = isTimeKey(bs) && isTimeKey(be) && be > bs;
    return { d, isOpen: fd.get(`open_${d}`) === "on", from: str(fd, `from_${d}`, 5), to: str(fd, `to_${d}`, 5), bs: hasBreak ? bs : null, be: hasBreak ? be : null };
  });
  if (days.some((x) => !isTimeKey(x.from) || !isTimeKey(x.to) || x.to <= x.from)) back("/admin/zeiten", t.hours.hoursInvalid, "error");
  const sql = await getSql();
  for (const x of days) {
    await sql`
      INSERT INTO opening_hours (weekday, is_open, open_time, close_time, break_start, break_end)
      VALUES (${x.d}, ${x.isOpen}, ${x.from}::time, ${x.to}::time, ${x.bs}::time, ${x.be}::time)
      ON CONFLICT (weekday) DO UPDATE SET is_open = EXCLUDED.is_open, open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time, break_start = EXCLUDED.break_start, break_end = EXCLUDED.break_end`;
  }
  refreshSite();
  back("/admin/zeiten", t.hours.hoursSaved);
}

/* Sperrzeiten */
export async function addBlockedTime(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const fromDate = str(fd, "fromDate", 10);
  const toDate = str(fd, "toDate", 10) || fromDate;
  const allDay = fd.get("allDay") === "on";
  const fromTime = allDay ? "00:00" : str(fd, "fromTime", 5);
  const toTime = allDay ? "23:59" : str(fd, "toTime", 5);
  if (!isDateKey(fromDate) || !isDateKey(toDate) || !isTimeKey(fromTime) || !isTimeKey(toTime)) back("/admin/zeiten", t.hours.blockInvalid, "error");
  const start = zurichToDate(fromDate, fromTime);
  const end = zurichToDate(toDate, toTime);
  if (end <= start) back("/admin/zeiten", t.hours.blockInvalid, "error");
  const sql = await getSql();
  await sql`INSERT INTO blocked_times (starts_at, ends_at, reason)
    VALUES (${start.toISOString()}::timestamptz, ${end.toISOString()}::timestamptz, ${str(fd, "reason", 120) || t.hours.defaultReason})`;
  const clashes = await getBookingsBetween(start, end);
  revalidatePath("/admin/zeiten");
  back("/admin/zeiten", clashes.length ? `${t.hours.blocked} ${fill(t.hours.conflict, { n: clashes.length })}` : t.hours.blocked);
}

export async function deleteBlockedTime(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const sql = await getSql();
  await sql`DELETE FROM blocked_times WHERE id = ${Number(fd.get("id"))}`;
  revalidatePath("/admin/zeiten");
  back("/admin/zeiten", t.hours.removed);
}

/* Buchungsregeln */
const within = (n: number, min: number, max: number, fallback: number) => (Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback);

export async function saveRules(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const s = await getSettings();
  const step = Number(fd.get("slotStepMin"));
  const url = (key: string, fallback: string) => {
    const v = str(fd, key, 400);
    return /^https?:\/\//.test(v) ? v : fallback;
  };
  const email = str(fd, "notifyEmail", 200);
  await saveSettings({
    slotStepMin: SLOT_STEPS.includes(step) ? step : s.slotStepMin,
    minNoticeMin: within(num(fd, "minNoticeMin"), 0, 60 * 24 * 14, s.minNoticeMin),
    horizonDays: within(num(fd, "horizonDays"), 1, 365, s.horizonDays),
    bufferMin: within(num(fd, "bufferMin"), 0, 120, s.bufferMin),
    cancelNoticeHours: within(num(fd, "cancelNoticeHours"), 0, 168, s.cancelNoticeHours),
    reminderHoursBefore: within(num(fd, "reminderHoursBefore"), 1, 48, s.reminderHoursBefore),
    followupHoursAfter: within(num(fd, "followupHoursAfter"), 1, 72, s.followupHoursAfter),
    reviewUrl: url("reviewUrl", s.reviewUrl),
    instagramUrl: url("instagramUrl", s.instagramUrl),
    notifyEmail: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email === "" ? email : s.notifyEmail,
  });
  revalidatePath("/admin", "layout");
  refreshSite();
  back("/admin/regeln", t.common.saved);
}

/* E-Mails */
const isType = (v: string): v is EmailType => (EMAIL_TYPES as readonly string[]).includes(v);

export async function saveEmail(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const type = str(fd, "type", 40);
  if (!isType(type)) back("/admin/emails", t.common.checkInput, "error");
  const s = await getSettings();
  const own: Partial<Record<Locale, EmailTemplate>> = {};
  for (const l of LOCALES) {
    const def = getDict(l).emails.templates[type as EmailType];
    const tpl = { subject: str(fd, `subject_${l}`, 300), heading: str(fd, `heading_${l}`, 300), body: str(fd, `body_${l}`, 5000).replace(/\r\n/g, "\n") };
    // Nur speichern, was vom Standardtext abweicht
    if (tpl.subject !== def.subject || tpl.heading !== def.heading || tpl.body !== def.body) own[l] = tpl;
  }
  await saveSettings({
    emailEnabled: { ...s.emailEnabled, [type]: fd.get("enabled") === "on" },
    emailTemplates: { ...s.emailTemplates, [type]: own },
  });
  revalidatePath("/admin/emails");
  back(`/admin/emails#${type}`, t.common.saved);
}

export async function resetEmail(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const type = str(fd, "type", 40);
  if (!isType(type)) back("/admin/emails", t.common.checkInput, "error");
  const s = await getSettings();
  const templates = { ...s.emailTemplates };
  delete templates[type as EmailType];
  await saveSettings({ emailTemplates: templates });
  revalidatePath("/admin/emails");
  back(`/admin/emails#${type}`, t.emails.resetDone);
}

export async function sendEmailTest(lang: string, fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const type = str(fd, "type", 40);
  const s = await getSettings();
  if (!s.notifyEmail) back(`/admin/emails#${type}`, t.emails.testNoEmail, "error");
  if (!isType(type) || !isLocale(lang)) back("/admin/emails", t.common.checkInput, "error");
  await sendTestEmail(type as EmailType, lang as Locale, s.notifyEmail);
  back(`/admin/emails#${type}`, fill(t.emails.testSent, { email: s.notifyEmail }));
}
