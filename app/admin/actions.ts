"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALES, type Locale } from "@/content/types";
import { ADMIN_LANG_COOKIE, getAdminText, slugify } from "@/lib/admin";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { cancelBooking, createBooking, deleteBooking, rescheduleBooking, SlotTakenError } from "@/lib/booking";
import { getBookingById, getBookingsBetween, getService, SERVICE_CATEGORIES } from "@/lib/data";
import { getSql } from "@/lib/db";
import { customerKey, deleteCustomer, updateCustomer, updateCustomerContact } from "@/lib/customers";
import { resendConfirmationToCustomer, sendBookingConfirmation, sendCancellation, sendRescheduled, sendTestEmail } from "@/lib/email";
import { fill, getDict } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n/config";
import { EMAIL_TYPES, getSettings, saveSettings, SLOT_STEPS, type EmailTemplate, type EmailType } from "@/lib/settings";
import { isDateKey, isTimeKey, toDateKey, zurichToDate } from "@/lib/time";

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
  const next = str(fd, "next", 200);
  redirect(/^\/(de|fr|en)(\/[\w-]*)*$/.test(next) ? next : "/admin");
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
  back(safeReturn(fd), booking ? t.bookings.cancelledMsg : t.bookings.alreadyCancelled);
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
  if (booking?.status === "confirmed" && booking.customerEmail) await resendConfirmationToCustomer(booking);
  back(str(fd, "returnTo", 200) || "/admin", t.bookings.resent);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const safeReturn = (fd: FormData) => {
  const to = str(fd, "returnTo", 200);
  return /^\/admin(\/[\w%.@+-]*)*(\?[\w=&%.+-]*)?(#[\w-]+)?$/.test(to) && !to.includes("//") ? to : "/admin";
};

/** Name, Telefon, E-Mail und Notizen eines Termins ändern (plus interne Kundennotiz) */
export async function updateBookingDetails(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = str(fd, "id", 40);
  const name = str(fd, "name", 80);
  const email = str(fd, "email", 120).toLowerCase();
  const phone = str(fd, "phone", 30);
  const returnTo = safeReturn(fd);
  if (name.length < 2 || (email && !EMAIL.test(email))) back(returnTo, t.common.checkInput, "error");
  const sql = await getSql();
  await sql`UPDATE bookings SET customer_name = ${name}, customer_email = ${email}, customer_phone = ${phone}, note = ${str(fd, "note", 500)}
            WHERE id = ${id}::uuid`;
  if (fd.has("customerNote")) await updateCustomer(customerKey(email, phone), { note: str(fd, "customerNote", 1000) });
  revalidatePath("/admin");
  back(returnTo, t.bookings.detailsSaved);
}

/** «Nicht gekommen» setzen oder zurücknehmen; nicht gekommen = Kosten offen fürs nächste Mal */
export async function toggleNoShow(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const on = fd.get("value") === "1";
  const sql = await getSql();
  await sql`UPDATE bookings SET no_show = ${on}, fee_open = ${on} WHERE id = ${str(fd, "id", 40)}::uuid AND status = 'confirmed'`;
  revalidatePath("/admin");
  back(safeReturn(fd), on ? t.bookings.noShowMsg : t.bookings.noShowUndoneMsg);
}

/** Kunde für Online-Buchungen sperren (E-Mail und Telefonnummer) oder entsperren */
export async function toggleBlock(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const on = fd.get("value") === "1";
  const keys = [customerKey(str(fd, "email", 120), ""), customerKey("", str(fd, "phone", 30)), str(fd, "key", 140)].filter(Boolean);
  for (const key of new Set(keys)) await updateCustomer(key, { blocked: on });
  revalidatePath("/admin");
  back(safeReturn(fd), on ? t.bookings.blockedMsg : t.bookings.unblockedMsg);
}

/** Offene Kosten als verrechnet abhaken */
export async function settleFee(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const sql = await getSql();
  await sql`UPDATE bookings SET fee_open = false WHERE id = ${str(fd, "id", 40)}::uuid`;
  revalidatePath("/admin");
  back(safeReturn(fd), t.bookings.settledMsg);
}

/** Kundenliste: Notiz und Werbe-Abmeldung speichern */
export async function saveCustomer(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  await updateCustomer(str(fd, "key", 140), { note: str(fd, "note", 1000), noMarketing: fd.get("noMarketing") === "on" });
  revalidatePath("/admin/kunden");
  back(safeReturn(fd), t.customers.saved);
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
    walkin: str(fd, "walkin", 12) === "" || !(num(fd, "walkin") >= 0) ? null : num(fd, "walkin"),
    category: (SERVICE_CATEGORIES as readonly string[]).includes(str(fd, "category", 20)) ? str(fd, "category", 20) : "cut",
    popular: fd.get("popular") === "on",
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
        active = ${v.active}, sort = ${v.sort}, walkin_price_chf = ${v.walkin}, category = ${v.category}, popular = ${v.popular}
        WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO services (slug_de, slug_fr, slug_en, name_de, name_fr, name_en, short_de, short_fr, short_en,
          long_de, long_fr, long_en, image, duration_min, price_chf, price_from, active, sort, walkin_price_chf, category, popular)
        VALUES (${slug.de}, ${slug.fr}, ${slug.en}, ${name.de}, ${name.fr}, ${name.en}, ${short.de}, ${short.fr}, ${short.en},
          ${long.de}, ${long.fr}, ${long.en}, ${v.image}, ${duration}, ${price}, ${v.priceFrom}, true, ${v.sort}, ${v.walkin}, ${v.category}, ${v.popular})`;
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
  const failed = await sendTestEmail(type as EmailType, lang as Locale, s.notifyEmail);
  if (failed) back(`/admin/emails#${type}`, fill(t.emails.testFailed, { error: failed }), "error");
  back(`/admin/emails#${type}`, fill(t.emails.testSent, { email: s.notifyEmail }));
}

/* Termin-Detailseite: alles ändern, verschieben, löschen */
export async function adminUpdateBooking(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = str(fd, "id", 40);
  const page = `/admin/termin/${id}`;
  const before = await getBookingById(id);
  if (!before) back("/admin/kalender", t.booking.notFound, "error");
  const name = str(fd, "name", 80);
  const email = str(fd, "email", 120).toLowerCase();
  const phone = str(fd, "phone", 30);
  const date = str(fd, "date", 10);
  const time = str(fd, "time", 5);
  const lang = str(fd, "locale", 2);
  const service = await getService(Number(fd.get("serviceId")));
  const priceRaw = str(fd, "price", 12);
  const price = priceRaw === "" ? null : num(fd, "price");
  if (name.length < 2 || (email && !EMAIL.test(email)) || !service || !isDateKey(date) || !isTimeKey(time) || (price !== null && !(price >= 0))) {
    back(page, t.common.checkInput, "error");
  }
  const sql = await getSql();
  await sql`UPDATE bookings SET customer_name = ${name}, customer_email = ${email}, customer_phone = ${phone},
            note = ${str(fd, "note", 500)}, locale = ${isLocale(lang) ? lang : before!.locale} WHERE id = ${id}::uuid`;
  if (fd.has("customerNote")) await updateCustomer(customerKey(email, phone), { note: str(fd, "customerNote", 1000) });

  const startsAt = zurichToDate(date, time);
  const moved = startsAt.getTime() !== before!.startsAt.getTime() || service!.id !== before!.serviceId || price !== before!.priceChf;
  let updated = await getBookingById(id);
  if (moved) {
    try {
      updated = await rescheduleBooking(id, { service: service!, priceChf: price, startsAt });
    } catch (error) {
      if (error instanceof SlotTakenError) back(page, t.bookings.overlap, "error");
      throw error;
    }
  }
  const timeChanged = startsAt.getTime() !== before!.startsAt.getTime() || service!.id !== before!.serviceId;
  let msg = t.booking.saved;
  if (updated && timeChanged && updated.status === "confirmed" && updated.customerEmail && fd.get("notify") === "on") {
    const failed = await sendRescheduled(updated);
    msg = failed ? fill(t.emails.testFailed, { error: failed }) : t.booking.savedNotified;
  }
  revalidatePath("/admin", "layout");
  back(page, msg);
}

export async function adminDeleteBooking(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const id = str(fd, "id", 40);
  const booking = await getBookingById(id);
  if (booking && booking.status === "confirmed" && booking.startsAt.getTime() > Date.now() && fd.get("notify") === "on") {
    await sendCancellation(booking, "salon");
  }
  await deleteBooking(id);
  revalidatePath("/admin", "layout");
  const to = booking ? `/admin/kalender?datum=${toDateKey(booking.startsAt)}` : "/admin/kalender";
  back(to, t.booking.deleted);
}

/* Kunden-Detailseite */
export async function adminSaveCustomerContact(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const key = str(fd, "key", 140);
  const name = str(fd, "name", 80);
  const email = str(fd, "email", 120).toLowerCase();
  const phone = str(fd, "phone", 30);
  const page = `/admin/kunden/${encodeURIComponent(key)}`;
  if (name.length < 2 || (email && !EMAIL.test(email)) || (!email && !phone.replace(/\D/g, ""))) back(page, t.common.checkInput, "error");
  const newKey = await updateCustomerContact(key, { name, email, phone });
  await updateCustomer(newKey, { note: str(fd, "note", 1000), noMarketing: fd.get("noMarketing") === "on" });
  revalidatePath("/admin", "layout");
  back(`/admin/kunden/${encodeURIComponent(newKey)}`, t.customers.saved);
}

export async function adminDeleteCustomer(fd: FormData) {
  await requireAdmin();
  const { t } = await getAdminText();
  const n = await deleteCustomer(str(fd, "key", 140));
  revalidatePath("/admin", "layout");
  back("/admin/kunden", fill(t.customers.deleted, { n }));
}
