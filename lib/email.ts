import "server-only";
import { formatTime } from "./time";
import { Resend } from "resend";
import { site, staffName } from "@/content/site";
import type { Locale } from "@/content/types";
import type { Booking } from "./data";
import { fill, getDict } from "./i18n";
import { href, INTL_LOCALE } from "./i18n/config";
import { getService } from "./data";
import { EMAIL_LOGO_BASE64 } from "./email-logo";
import { formatChf, formatDuration } from "./format";
import { customerKey, getCustomerInfos } from "./customers";
import { getSql } from "./db";
import { pushToAdmins, pushToCustomer } from "./push";
import { getSettings, type EmailTemplate, type EmailType, type Settings } from "./settings";
import { TIMEZONE } from "./config";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? `${site.name} <termin@gyanhairsalon.ch>`;

type Mail = { to: string; subject: string; html: string; text: string; ics?: string; replyTo?: string };

/** Letzter Versandfehler (für die Warnung im Admin) */
async function rememberError(mail: Mail, message: string) {
  try {
    const sql = await getSql();
    const value = JSON.stringify({ at: new Date().toISOString(), to: mail.to, subject: mail.subject, message: message.slice(0, 300) });
    await sql`
      INSERT INTO settings (key, value, updated_at) VALUES ('emailLastError', ${value}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  } catch (e) {
    console.error("[GYAN] Versandfehler konnte nicht gespeichert werden:", e);
  }
}

export type EmailError = { at: string; to: string; subject: string; message: string };

export async function getEmailLastError(): Promise<EmailError | null> {
  const sql = await getSql();
  const rows = await sql`SELECT value FROM settings WHERE key = 'emailLastError'`;
  return (rows[0]?.value as EmailError | undefined) ?? null;
}

/** Schickt eine E-Mail. Gibt null zurück, wenn sie raus ist, sonst die Fehlermeldung. */
async function send(mail: Mail): Promise<string | null> {
  if (!resend) {
    console.log(`[GYAN] E-Mail (nicht versendet, RESEND_API_KEY fehlt) an ${mail.to}: ${mail.subject}`);
    if (process.env.VERCEL) await rememberError(mail, "RESEND_API_KEY fehlt in Vercel");
    return process.env.VERCEL ? "RESEND_API_KEY fehlt" : null;
  }
  const payload = {
    from: FROM,
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: mail.replyTo || site.email, // Antworten landen immer im Salon-Postfach
    attachments: [
      { filename: "gyan-logo.png", content: EMAIL_LOGO_BASE64, contentType: "image/png", contentId: "gyan-logo" },
      ...(mail.ics ? [{ filename: "gyan-termin.ics", content: Buffer.from(mail.ics).toString("base64"), contentType: "text/calendar" }] : []),
    ],
  };
  let error: { message: string; name?: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      ({ error } = await resend.emails.send(payload));
    } catch (e) {
      error = { message: e instanceof Error ? e.message : String(e) };
    }
    // Resend erlaubt nur wenige Mails pro Sekunde: kurz warten und nochmals
    if (!error || error.name !== "rate_limit_exceeded") break;
    await new Promise((r) => setTimeout(r, 1100));
  }
  if (!error) {
    // Warnung im Admin löschen, sobald wieder eine Mail an einen Kunden rausgeht
    // (an die eigene Adresse klappt es bei Resend auch ohne verifizierte Domain)
    const own = (await getSettings().catch(() => null))?.notifyEmail;
    if (mail.to !== own) await getSql().then((sql) => sql`DELETE FROM settings WHERE key = 'emailLastError'`).catch(() => {});
    return null;
  }
  console.error("[GYAN] E-Mail-Fehler:", mail.to, error);
  await rememberError(mail, `${error.name ? `${error.name}: ` : ""}${error.message}`);
  return error.message;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Standardtext oder eigener Text aus dem Admin */
export function templateFor(settings: Settings, type: EmailType, locale: Locale): EmailTemplate {
  const custom = settings.emailTemplates[type]?.[locale];
  const fallback = getDict(locale).emails.templates[type];
  return {
    subject: custom?.subject?.trim() || fallback.subject,
    heading: custom?.heading?.trim() || fallback.heading,
    body: custom?.body?.trim() || fallback.body,
  };
}

type Vars = Record<string, string>;

async function varsFor(b: Booking, locale: Locale, settings: Settings): Promise<Vars> {
  const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: TIMEZONE, ...opts });
  const service = b.serviceId ? await getService(b.serviceId).catch(() => null) : null;
  return {
    name: b.customerName,
    firstName: b.customerName.split(" ")[0],
    service: service ? service.name[locale] || service.name.de : b.serviceName,
    date: fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(b.startsAt),
    time: fmt({ hour: "2-digit", minute: "2-digit" }).format(b.startsAt),
    endTime: fmt({ hour: "2-digit", minute: "2-digit" }).format(b.endsAt),
    duration: formatDuration(b.durationMin, locale),
    payment: getDict(locale).emails.paymentText,
    price: b.priceChf != null ? formatChf(b.priceChf) : "",
    address: `${site.address.street}, ${site.address.zip} ${site.address.city}`,
    phone: site.phone,
    cancelHours: String(settings.cancelNoticeHours),
    customerPhone: b.customerPhone || "–",
    customerEmail: b.customerEmail || "–",
    note: b.note || "–",
  };
}

type Button = { label: string; href: string; primary?: boolean };

/** Grosser Bewertungs-Block für die Mail nach dem Besuch */
function reviewBlock(t: { buttonReview: string; reviewNote: string; socialTitle: string }, url: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;background:#f6f0e6;border-radius:18px"><tr><td style="padding:26px 20px;text-align:center">
<div style="font-size:26px;letter-spacing:6px;color:#6b5b4b;line-height:1">★★★★★</div>
<a href="${esc(url)}" style="display:inline-block;margin:18px 0 10px;padding:16px 30px;border-radius:999px;background:#141210;color:#fbf8f3;font-size:16px;font-weight:600;text-decoration:none">${esc(t.buttonReview)}</a>
<div style="font-size:13px;color:#8a8176">${esc(t.reviewNote)}</div>
</td></tr></table>
<p style="margin:22px 0 0;text-align:center;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8a8176">${esc(t.socialTitle)}</p>`;
}

function layout(opts: { locale: Locale; preheader: string; heading: string; body: string; details?: [string, string][]; buttons?: Button[]; logoSrc: string; highlight?: string; after?: string }) {
  const d = getDict(opts.locale);
  const paragraphs = esc(opts.body)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;color:#4a443d;font-size:15px;line-height:1.65">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  const details = opts.details?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-top:1px solid #eee6da">${opts.details
        .map(
          ([k, v]) =>
            `<tr><td style="padding:12px 0;color:#8a8176;font-size:13px;border-bottom:1px solid #eee6da">${esc(k)}</td><td style="padding:12px 0;text-align:right;font-size:14px;font-weight:600;color:#141210;border-bottom:1px solid #eee6da">${esc(v)}</td></tr>`,
        )
        .join("")}</table>`
    : "";
  const buttons = (opts.buttons ?? [])
    .map(
      (b) =>
        `<a href="${esc(b.href)}" style="display:inline-block;margin:6px 4px;padding:13px 24px;border-radius:999px;font-size:14px;font-weight:600;text-decoration:none;${
          b.primary ? "background:#141210;color:#fbf8f3" : "border:1px solid #cfc5b6;color:#141210"
        }">${esc(b.label)}</a>`,
    )
    .join("");
  return `<!doctype html><html lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;background:#f3ece1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#141210">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ece1;padding:36px 14px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#fffdf9;border-radius:22px;overflow:hidden">
<tr><td style="height:3px;background:#6b5b4b;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:40px 36px 8px;text-align:center"><img src="${opts.logoSrc}" width="150" alt="GYAN" style="display:inline-block;width:150px;height:auto;border:0"></td></tr>
<tr><td style="padding:4px 36px 0;text-align:center;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8a8176">Hair Salon · Biel/Bienne</td></tr>
<tr><td style="padding:28px 36px 12px;text-align:center"><h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-weight:600;letter-spacing:-0.02em;font-size:26px;line-height:1.2;color:#141210">${esc(opts.heading)}</h1></td></tr>
<tr><td style="padding:12px 36px 8px">${opts.highlight ?? ""}${paragraphs}${details}${opts.after ?? ""}</td></tr>
${buttons ? `<tr><td style="padding:0 30px 36px;text-align:center">${buttons}</td></tr>` : ""}
<tr><td style="padding:22px 36px;background:#efe8dc;font-size:12px;line-height:1.7;color:#6b635a;text-align:center">
<strong style="color:#141210">${esc(site.name)}</strong><br>${esc(site.address.street)}, ${esc(site.address.zip)} ${esc(site.address.city)} · ${esc(site.phone)}<br>
<span style="color:#9a9187">${esc(d.emails.footer)}</span></td></tr>
</table></td></tr></table></body></html>`;
}

function ics(b: Booking, summary: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GYAN Hair Salon//Termine//DE",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@gyanhairsalon.ch`,
    `DTSTAMP:${fmt(new Date())}`,
    // steigt mit jeder Änderung, damit Kalender-Apps einen verschobenen Termin aktualisieren
    `SEQUENCE:${Math.floor(Date.now() / 1000)}`,
    `DTSTART:${fmt(b.startsAt)}`,
    `DTEND:${fmt(b.endsAt)}`,
    `SUMMARY:${summary} · GYAN Hair Salon`,
    `LOCATION:${site.address.street}\\, ${site.address.zip} ${site.address.city}`,
    `DESCRIPTION:${staffName(b.staffId)} · ${site.phone}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:GYAN Hair Salon",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Baut eine E-Mail eines Typs (für Versand und für die Vorschau im Admin). */
export async function buildEmail(type: EmailType, b: Booking, opts: { locale?: Locale; settings?: Settings; template?: EmailTemplate; preview?: boolean; extraDetails?: [string, string][] } = {}) {
  const settings = opts.settings ?? (await getSettings());
  const locale = opts.locale ?? b.locale;
  const d = getDict(locale);
  const vars = await varsFor(b, locale, settings);
  const t = opts.template ?? templateFor(settings, type, locale);
  const subject = fill(t.subject, vars);
  const heading = fill(t.heading, vars);
  const body = fill(t.body, vars);
  // Alle Angaben zum Termin stehen in jeder E-Mail, ausser im Dank nach dem Besuch (dort zählt nur die Bewertung)
  const followup = type === "followup";
  const details: [string, string][] = followup ? [] : [
    [d.emails.detailsService, vars.service],
    [d.emails.detailsDate, vars.date],
    [d.emails.detailsTime, `${vars.time} – ${vars.endTime}`],
    [d.emails.detailsDuration, vars.duration],
    [d.emails.detailsWith, staffName(b.staffId)],
  ];
  if (!followup) {
    if (vars.price) details.push([d.emails.detailsPrice, vars.price]);
    details.push([d.emails.detailsAddress, vars.address], [d.emails.detailsPayment, vars.payment]);
  }
  if (b.lateCancel && b.priceChf != null && (type === "cancellation" || type === "cancellationBySalon")) {
    details.push([d.emails.detailsFee, fill(d.emails.lateFee, { price: vars.price })]);
  }
  if (type === "adminNotify") {
    details.push(
      [d.emails.detailsCustomer, vars.name],
      [d.emails.detailsPhone, vars.customerPhone],
      [d.emails.detailsEmail, vars.customerEmail],
      [d.emails.detailsNote, vars.note],
    );
  }
  if (opts.extraDetails) details.push(...opts.extraDetails);

  const bookUrl = `${site.url}${href(locale, "booking")}`;
  const buttons: Button[] = [];
  switch (type) {
    case "confirmation":
      buttons.push({ label: d.emails.buttonRoute, href: site.address.mapsUrl, primary: true });
      buttons.push({ label: d.emails.buttonCancel, href: `${site.url}${href(locale, "booking", "storno", b.cancelToken)}` });
      break;
    case "reminder":
      buttons.push({ label: d.emails.buttonRoute, href: site.address.mapsUrl, primary: true });
      break;
    case "followup":
      // Bewertung steht als grosser Block im Text, hier nur noch Social Media
      buttons.push({ label: d.emails.buttonInstagram, href: settings.instagramUrl });
      buttons.push({ label: d.emails.buttonTiktok, href: site.tiktok });
      break;
    case "cancellation":
    case "cancellationBySalon":
      buttons.push({ label: d.emails.buttonRebook, href: bookUrl, primary: true });
      break;
    case "adminNotify":
      buttons.push({ label: "Admin", href: `${site.url}/admin`, primary: true });
      break;
  }
  const logoSrc = opts.preview ? "/brand/logo-email.png" : "cid:gyan-logo";
  const after = followup ? reviewBlock(d.emails, settings.reviewUrl) : undefined;
  const html = layout({ locale, preheader: subject, heading, body, details, buttons, logoSrc, after });
  const text = [
    heading, "", body, "",
    ...(followup ? [`${d.emails.buttonReview}: ${settings.reviewUrl}`, "", d.emails.socialTitle] : details.map(([k, v]) => `${k}: ${v}`)),
    "", ...buttons.map((x) => `${x.label}: ${x.href}`),
  ].join("\n");
  return { subject, html, text, ics: type === "confirmation" ? ics(b, vars.service) : undefined };
}

async function sendType(type: EmailType, b: Booking, to: string, extra: { replyTo?: string; locale?: Locale; details?: [string, string][] } = {}) {
  const settings = await getSettings();
  if (!settings.emailEnabled[type] || !to) return;
  const mail = await buildEmail(type, b, { settings, locale: extra.locale, extraDetails: extra.details });
  await send({ to, replyTo: extra.replyTo, ...mail });
}

/** Kurzer Hinweis fürs Admin: nicht gekommen, zu spät storniert, offene Kosten, Notiz */
async function customerWarning(b: Booking): Promise<[string, string][]> {
  const key = customerKey(b.customerEmail, b.customerPhone);
  const c = key ? (await getCustomerInfos([key]).catch(() => new Map())).get(key) : undefined;
  if (!c) return [];
  const parts = [
    c.noShows ? `${c.noShows}× nicht gekommen` : "",
    c.lateCancels ? `${c.lateCancels}× zu spät storniert` : "",
    c.openCount ? `offen ${formatChf(c.openFees)}` : "",
    c.note ? `Notiz: ${c.note}` : "",
  ].filter(Boolean);
  return parts.length ? [["⚠ Achtung", parts.join(" · ")]] : [];
}

export async function sendBookingConfirmation(b: Booking) {
  const settings = await getSettings();
  await Promise.allSettled([
    sendType("confirmation", b, b.customerEmail, { replyTo: settings.notifyEmail || undefined }),
    sendType("adminNotify", b, settings.notifyEmail, { replyTo: b.customerEmail || undefined, locale: "de", details: await customerWarning(b) }),
    b.source === "online" ? pushToAdmins("new", b).catch((e) => console.error("[GYAN] Push:", e)) : null,
  ]);
}

const CHANGED: Record<Locale, string> = { de: "Termin geändert", fr: "Rendez-vous modifié", en: "Appointment changed" };

/** Termin verschoben oder geändert: neue Bestätigung mit allen Angaben an den Kunden */
export async function sendRescheduled(b: Booking) {
  const settings = await getSettings();
  await pushToCustomer("rescheduled", b).catch((e) => console.error("[GYAN] Push:", e));
  if (!b.customerEmail) return null;
  const mail = await buildEmail("confirmation", b, { settings });
  return send({ to: b.customerEmail, replyTo: settings.notifyEmail || undefined, ...mail, subject: `${CHANGED[b.locale] ?? CHANGED.de}: ${mail.subject}` });
}

/** Nur die Bestätigung an den Kunden, nochmals (aus dem Admin) */
export async function resendConfirmationToCustomer(b: Booking) {
  const settings = await getSettings();
  await sendType("confirmation", b, b.customerEmail, { replyTo: settings.notifyEmail || undefined });
}

export async function sendCancellation(b: Booking, by: "customer" | "salon") {
  const settings = await getSettings();
  const tasks: Promise<unknown>[] = [sendType(by === "salon" ? "cancellationBySalon" : "cancellation", b, b.customerEmail, { replyTo: settings.notifyEmail || undefined })];
  if (by === "customer" && settings.emailEnabled.adminNotify && settings.notifyEmail) {
    const mail = await buildEmail("cancellation", b, { settings, locale: "de" });
    tasks.push(send({ to: settings.notifyEmail, ...mail, ics: undefined, subject: `${b.lateCancel ? "Zu spät storniert" : "Storniert"}: ${mail.subject}` }));
  }
  tasks.push(by === "customer" ? pushToAdmins("cancelled", b).catch((e) => console.error("[GYAN] Push:", e)) : pushToCustomer("cancelled", b).catch((e) => console.error("[GYAN] Push:", e)));
  await Promise.allSettled(tasks);
}

export async function sendReminder(b: Booking) {
  const settings = await getSettings();
  await Promise.allSettled([
    sendType("reminder", b, b.customerEmail, { replyTo: settings.notifyEmail || undefined }),
    pushToCustomer("reminder", b).catch((e) => console.error("[GYAN] Push:", e)),
  ]);
}

export async function sendFollowup(b: Booking) {
  const settings = await getSettings();
  await Promise.allSettled([
    sendType("followup", b, b.customerEmail, { replyTo: settings.notifyEmail || undefined }),
    pushToCustomer("followup", b).catch((e) => console.error("[GYAN] Push:", e)),
  ]);
}

/** Bestätigungscode für die E-Mail-Adresse (fester Text, kein Termin) */
export async function sendVerifyCode(to: string, code: string, locale: Locale, purpose: "booking" | "login" = "booking") {
  const dict = getDict(locale);
  const v = dict.booking.verify;
  const subject = fill(v.mailSubject, { code });
  const body = purpose === "login" ? dict.account.mailBody : v.mailBody;
  const highlight = `<div style="margin:0 0 24px;text-align:center"><span style="display:inline-block;padding:16px 22px 16px 30px;border-radius:16px;background:#f3ece1;font-size:34px;font-weight:700;letter-spacing:.32em;color:#141210;font-family:SFMono-Regular,Menlo,Consolas,monospace">${code}</span></div>`;
  const html = layout({ locale, preheader: subject, heading: v.mailHeading, body, logoSrc: "cid:gyan-logo", highlight });
  const replyTo = (await getSettings().catch(() => null))?.notifyEmail || undefined;
  return send({ to, subject, html, replyTo, text: `${v.mailHeading}\n\n${code}\n\n${body}` });
}

/** Test-E-Mail aus dem Admin (unabhängig davon, ob der Typ aktiv ist). */
export async function sendTestEmail(type: EmailType, locale: Locale, to: string) {
  const mail = await buildEmail(type, sampleBooking(locale), { locale });
  return send({ to, ...mail, subject: `[Test] ${mail.subject}` });
}

/** Beispielwerte für die Platzhalter-Legende im Admin */
export async function sampleVars(locale: Locale, settings: Settings) {
  return varsFor({ ...sampleBooking(locale), note: "–" }, locale, settings);
}

export function sampleBooking(locale: Locale): Booking {
  const start = new Date(Date.now() + 2 * 86400_000);
  start.setUTCHours(13, 30, 0, 0);
  return {
    id: "00000000-0000-0000-0000-000000000000",
    staffId: "zana",
    serviceId: null,
    serviceName: "GYAN Signature Cut",
    priceChf: 45,
    durationMin: 45,
    startsAt: start,
    endsAt: new Date(start.getTime() + 45 * 60_000),
    busyUntil: new Date(start.getTime() + 45 * 60_000),
    locale,
    customerName: "Luca Meier",
    customerEmail: "luca@example.com",
    customerPhone: "079 123 45 67",
    birthDate: "",
    note: "",
    status: "confirmed",
    source: "online",
    cancelToken: "beispiel",
    createdAt: new Date(),
    reminderSentAt: null,
    followupSentAt: null,
    noShow: false,
    marketingConsent: true,
    emailVerified: true,
    lateCancel: false,
    feeOpen: false,
  };
}

/** Morgen-Übersicht an den Salon: alle heutigen Termine auf einen Blick */
export async function sendDailyDigest(bookings: Booking[], to: string) {
  if (!to) return null;
  const time = (d: Date) => formatTime(d, "de");
  const subject = bookings.length
    ? `Heute ${bookings.length} ${bookings.length === 1 ? "Termin" : "Termine"}, erster um ${time(bookings[0].startsAt)}`
    : "Heute keine Online-Termine";
  const body = bookings.length
    ? "Guten Morgen! Das sind die Termine von heute. Neue Buchungen kommen wie immer zusätzlich per Push und E-Mail."
    : "Guten Morgen! Für heute sind noch keine Termine eingetragen.";
  const details: [string, string][] = bookings.map((b) => [`${time(b.startsAt)}–${time(b.endsAt)}`, `${b.customerName} · ${b.serviceName}`]);
  const buttons = [{ label: "Kalender öffnen", href: `${site.url}/admin/kalender?ansicht=day`, primary: true }];
  const html = layout({ locale: "de", preheader: subject, heading: "Deine Termine heute", body, details, buttons, logoSrc: "cid:gyan-logo" });
  const text = `${subject}\n\n${details.map(([a, b]) => `${a}  ${b}`).join("\n")}`;
  return send({ to, subject, html, text });
}

/** Stempelkarte: Geburtstagsgruss (fester Text aus lib/i18n/dict, loyalty.birthdayMail) */
export async function sendBirthdayGreeting(to: string, name: string, locale: Locale) {
  const m = getDict(locale).loyalty.birthdayMail;
  const vars = { firstName: name.trim().split(" ")[0] ?? "" };
  const subject = fill(m.subject, vars);
  const body = fill(m.body, vars);
  const buttons = [{ label: m.button, href: `${site.url}${href(locale, "booking")}`, primary: true }];
  const html = layout({ locale, preheader: subject, heading: m.heading, body, buttons, logoSrc: "cid:gyan-logo" });
  const replyTo = (await getSettings().catch(() => null))?.notifyEmail || undefined;
  return send({ to, subject, html, replyTo, text: `${m.heading}\n\n${body}\n\n${m.button}: ${buttons[0].href}` });
}
